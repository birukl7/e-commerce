<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tx_ref',
        'order_id',
        'product_request_id',
        'amount',
        'currency',
        'customer_email',
        'customer_name',
        'customer_phone',
        'payment_method',
        'gateway_status',
        'admin_status',
        'checkout_url',
        'gateway_payload',
        'admin_notes',
        'rejection_reason_code',
        'admin_id',
        'admin_action_at',
    ];

    protected $casts = [
        'chapa_data' => 'array',
        'gateway_payload' => 'array',
        'admin_action_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    // Relationships
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Relationship to Order model.
     * 
     * Note: This relationship expects order_id to be numeric.
     * If order_id is stored as order_number string, use OrderLookupService
     * to find the order and normalize the payment transaction.
     * 
     * @return BelongsTo
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    /**
     * Get the order for this payment transaction.
     * Handles both numeric IDs and order number strings automatically.
     * 
     * @return Order|null
     */
    public function getOrder(): ?Order
    {
        return app(\App\Services\OrderLookupService::class)->getOrderForPayment($this);
    }

    /**
     * Check if this payment transaction has a valid order.
     * 
     * @return bool
     */
    public function hasOrder(): bool
    {
        return $this->getOrder() !== null;
    }

    /**
     * Normalize the order_id to store numeric ID instead of order_number string.
     * 
     * @return bool True if normalization occurred, false if already normalized or no order found
     */
    public function normalizeOrderId(): bool
    {
        return app(\App\Services\OrderLookupService::class)->ensurePaymentOrderIdNormalized($this);
    }

    public function productRequest(): BelongsTo
    {
        return $this->belongsTo(ProductRequest::class);
    }

    public function rejectionReason(): BelongsTo
    {
        return $this->belongsTo(PaymentRejectionReason::class, 'rejection_reason_code', 'reason_code');
    }

    // Gateway Status Helpers
    public function isGatewayPaid(): bool
    {
        return $this->gateway_status === 'paid';
    }

    public function isGatewayFailed(): bool
    {
        return $this->gateway_status === 'failed';
    }

    public function isGatewayPending(): bool
    {
        return $this->gateway_status === 'pending';
    }

    public function hasProofUploaded(): bool
    {
        return $this->gateway_status === 'proof_uploaded';
    }

    // Admin Status Helpers
    public function isAdminApproved(): bool
    {
        return $this->admin_status === 'approved';
    }

    public function isAdminRejected(): bool
    {
        return $this->admin_status === 'rejected';
    }

    public function isAdminUnseen(): bool
    {
        return $this->admin_status === 'unseen';
    }

    public function isAdminSeen(): bool
    {
        return $this->admin_status === 'seen';
    }

    // Composite Status Helpers
    public function isFullyCompleted(): bool
    {
        return $this->isGatewayPaid() && $this->isAdminApproved();
    }

    public function isAwaitingAdminApproval(): bool
    {
        return $this->isGatewayPaid() && !$this->isAdminApproved() && !$this->isAdminRejected();
    }

    public function canBeApproved(): bool
    {
        // For product request payments, allow approval if gateway_status is 'paid', 'pending', or 'processing'
        // because payment might be initiated but webhook hasn't updated status yet
        if ($this->product_request_id) {
            $allowedGatewayStatuses = ['paid', 'pending', 'processing', 'proof_uploaded'];
            return in_array($this->gateway_status, $allowedGatewayStatuses) && !$this->isAdminApproved();
        }
        
        // For regular orders, require gateway paid or proof uploaded
        return ($this->isGatewayPaid() || $this->hasProofUploaded()) && !$this->isAdminApproved();
    }

    public function canBeRejected(): bool
    {
        return !$this->isAdminRejected() && !$this->isAdminApproved();
    }

    // Backward compatibility - maps to gateway_status primarily
    public function getStatusAttribute(): string
    {
        if ($this->isFullyCompleted()) {
            return 'completed';
        }

        return match ($this->gateway_status) {
            'paid', 'proof_uploaded' => 'pending', // Awaiting admin approval
            'failed' => 'failed',
            'refunded' => 'refunded',
            default => 'pending'
        };
    }

    // Admin Actions
    public function markSeen(User $admin): void
    {
        \Log::info('PaymentTransaction markSeen called:', [
            'payment_id' => $this->id,
            'current_admin_status' => $this->admin_status,
            'is_admin_unseen' => $this->isAdminUnseen(),
            'admin_id' => $admin->id
        ]);
        
        if ($this->isAdminUnseen()) {
            $updated = $this->update([
                'admin_status' => 'seen',
                'admin_id' => $admin->id,
                'admin_action_at' => now(),
            ]);
            
            \Log::info('PaymentTransaction markSeen update result:', [
                'payment_id' => $this->id,
                'update_success' => $updated,
                'new_admin_status' => $this->fresh()->admin_status
            ]);
        } else {
            \Log::info('PaymentTransaction markSeen skipped - not unseen');
        }
    }

    public function approve(User $admin, ?string $notes = null): void
    {
        \Log::info('PaymentTransaction approve called:', [
            'payment_id' => $this->id,
            'current_admin_status' => $this->admin_status,
            'can_be_approved' => $this->canBeApproved(),
            'admin_id' => $admin->id
        ]);
        
        $updated = $this->update([
            'admin_status' => 'approved',
            'admin_id' => $admin->id,
            'admin_notes' => $notes,
            'admin_action_at' => now(),
        ]);
        
        \Log::info('PaymentTransaction approve update result:', [
            'payment_id' => $this->id,
            'update_success' => $updated,
            'new_admin_status' => $this->fresh()->admin_status
        ]);
    }

    public function reject(User $admin, ?string $notes = null, ?string $rejectionReasonCode = null): void
    {
        $this->update([
            'admin_status' => 'rejected',
            'admin_id' => $admin->id,
            'admin_notes' => $notes,
            'rejection_reason_code' => $rejectionReasonCode,
            'admin_action_at' => now(),
        ]);
    }

    /**
     * Retrieve the model for route model binding.
     * This ensures soft-deleted models can still be found for retry operations.
     */
    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where($field ?? $this->getRouteKeyName(), $value)->firstOrFail();
    }

    // Scopes
    public function scopeGatewayPaid($query)
    {
        return $query->where('gateway_status', 'paid');
    }

    public function scopeAdminApproved($query)
    {
        return $query->where('admin_status', 'approved');
    }

    public function scopeFullyCompleted($query)
    {
        return $query->where('gateway_status', 'paid')
                    ->where('admin_status', 'approved');
    }

    public function scopeAwaitingAdminApproval($query)
    {
        return $query->whereIn('gateway_status', ['paid', 'proof_uploaded'])
                    ->where('admin_status', '!=', 'approved')
                    ->where('admin_status', '!=', 'rejected');
    }

    public function scopeUnseen($query)
    {
        return $query->where('admin_status', 'unseen');
    }
}