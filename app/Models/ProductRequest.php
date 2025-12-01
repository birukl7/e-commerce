<?php

namespace App\Models;

use App\Events\OrderCreatedFromAdvance;
use App\Events\ProductRequestCreated;
use App\Events\ProductRequestStatusChanged;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_name',
        'product_url',
        'description',
        'image',
        'status',
        'admin_response',
        'admin_id',
        'order_id',
        'amount',
        'estimated_arrival_date',
        'estimated_price',
        'max_budget',
        'currency',
        'payment_status',
        'payment_method',
        'payment_reference',
        'paid_at',
        'payment_details',
        'brand',
        'model',
        'color',
        'size',
        'quantity',
        'shipping_address',
        'shipping_method',
        'shipping_cost',
        'desired_delivery_date',
        'additional_notes',
        'specifications',
        'fulfillment_status',
        'tracking_number',
        'tracking_url',
        // New procurement fields
        'advance_amount',
        'final_amount',
        'advance_payment_status',
        'final_payment_status',
        'advance_paid_at',
        'final_paid_at',
        'procurement_status',
        'procurement_notes',
        'procurement_started_at',
        'procurement_expected_completion_date',
        'procurement_completed_at',
        'product_arrived_at',
        'arrival_notes',
        'customer_willing_to_buy',
        'willingness_confirmed_at',
        'rejection_reason',
        'lost_interest_at',
        'lost_interest_reason'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'estimated_price' => 'decimal:2',
        'max_budget' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'paid_at' => 'datetime',
        'desired_delivery_date' => 'date',
        'estimated_arrival_date' => 'date',
        'payment_details' => 'array',
        'specifications' => 'array',
        'quantity' => 'integer',
        // New procurement field casts
        'advance_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'advance_paid_at' => 'datetime',
        'final_paid_at' => 'datetime',
        'procurement_started_at' => 'datetime',
        'procurement_expected_completion_date' => 'date',
        'procurement_completed_at' => 'datetime',
        'product_arrived_at' => 'datetime',
        'willingness_confirmed_at' => 'datetime',
        'customer_willing_to_buy' => 'boolean',
        'lost_interest_at' => 'datetime'
    ];

    /**
     * Get the user that owns the product request.
     */
    /**
     * Get the user that owns the product request.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order associated with the product request.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Create an order from this product request.
     *
     * @return \App\Models\Order
     */
    public function createOrder(bool $markPaid = false)
    {
        $amount = $this->amount ?? $this->estimated_price ?? 0;

        // Calculate tax for the order
        $taxService = app(\App\Services\TaxService::class);
        $taxCalculation = $taxService->calculateTaxes($amount);
        
        // Wrap order and order item creation in a transaction to ensure atomicity
        // If order item creation fails, the order will be rolled back
        try {
            return \Illuminate\Support\Facades\DB::transaction(function () use ($amount, $taxCalculation, $markPaid) {
                \Illuminate\Support\Facades\Log::info('Starting order creation transaction for product request', [
                    'product_request_id' => $this->id,
                    'user_id' => $this->user_id,
                    'amount' => $amount
                ]);

                $order = new Order([
                    'user_id' => $this->user_id,
                    'status' => 'processing', // Orders created from product requests start as processing
                    'payment_status' => $markPaid ? 'paid' : 'pending',
                    'payment_method' => $this->payment_method ?? 'offline', // Default to offline if not set
                    'currency' => $this->currency,
                    'subtotal' => $amount,
                    'tax_amount' => round($taxCalculation['total_tax_amount'], 2),
                    'shipping_amount' => $this->shipping_cost ?? 0,
                    'total_amount' => round($taxCalculation['total'] + ($this->shipping_cost ?? 0), 2),
                    'shipping_fullname' => optional($this->user)->name,
                    'shipping_email' => optional($this->user)->email,
                    'shipping_phone' => optional($this->user)->phone,
                    'shipping_address' => $this->shipping_address,
                    'notes' => 'Created from product request #' . $this->id,
                ]);

                $order->save();
                \Illuminate\Support\Facades\Log::info('Order saved in transaction', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'product_request_id' => $this->id
                ]);

                // Create order item for the product request
                // For product requests, product_id can be null since it's not a regular product
                // This MUST succeed, otherwise the transaction will rollback and the order won't be created
                $orderItem = \App\Models\OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => null, // Product requests don't have a product_id
                    'product_snapshot' => [
                        'id' => null,
                        'name' => $this->product_name,
                        'price' => (float) $amount,
                        'image' => $this->image ? \App\Services\ImageUrlService::formatImageUrl($this->image) : null,
                        'product_request_id' => $this->id,
                        'description' => $this->description,
                        'created_at' => now()->toDateTimeString(),
                        'updated_at' => now()->toDateTimeString(),
                    ],
                    'quantity' => $this->quantity ?? 1,
                    'price' => (float) $amount,
                    'total' => (float) $amount * ($this->quantity ?? 1),
                ]);

                \Illuminate\Support\Facades\Log::info('Order item created in transaction', [
                    'order_item_id' => $orderItem->id ?? null,
                    'order_id' => $order->id,
                    'product_request_id' => $this->id
                ]);

                // Verify order item was created successfully
                if (!$orderItem || !$orderItem->id) {
                    throw new \RuntimeException('Failed to create order item for product request #' . $this->id);
                }

                // Update product request with order_id (only after successful order and item creation)
                $this->order_id = $order->id;
                $this->save();

                \Illuminate\Support\Facades\Log::info('Product request updated with order_id', [
                    'product_request_id' => $this->id,
                    'order_id' => $order->id
                ]);

                // Emit advance-created order event (non-critical, so wrap in try-catch)
                try {
                    event(new OrderCreatedFromAdvance($order));
                } catch (\Throwable $e) {
                    // Log but don't fail the transaction
                    \Illuminate\Support\Facades\Log::warning('Failed to emit OrderCreatedFromAdvance event', [
                        'product_request_id' => $this->id,
                        'order_id' => $order->id,
                        'error' => $e->getMessage()
                    ]);
                }

                \Illuminate\Support\Facades\Log::info('Order creation transaction completed successfully', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'product_request_id' => $this->id
                ]);

                return $order;
            }, 3); // Retry up to 3 times on deadlock
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Order creation transaction failed for product request', [
                'product_request_id' => $this->id,
                'user_id' => $this->user_id,
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get the admin who processed the request.
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    

    /**
     * Scope a query to only include pending requests.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved requests.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include rejected requests.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope a query to only include paid requests.
     */
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * Get the total cost including shipping.
     */
    public function getTotalCostAttribute()
    {
        return $this->amount + ($this->shipping_cost ?? 0);
    }

    /**
     * Check if the request requires payment.
     */
    public function requiresPayment()
    {
        return $this->status === 'approved' && $this->payment_status !== 'paid' && $this->amount > 0;
    }

    /**
     * Check if advance payment is required.
     */
    public function requiresAdvancePayment()
    {
        return $this->status === 'approved' && 
               $this->advance_payment_status !== 'paid' && 
               $this->advance_payment_status !== 'processing' && // Don't require payment if already processing
               $this->advance_amount > 0 &&
               $this->customer_willing_to_buy;
    }

    /**
     * Check if final payment is required.
     */
    public function requiresFinalPayment()
    {
        // Ensure advance payment is paid first
        if ($this->advance_payment_status !== 'paid') {
            return false;
        }
        
        return $this->procurement_status === 'completed' && 
               $this->product_arrived_at !== null &&
               $this->final_payment_status !== 'paid' && 
               $this->final_amount > 0;
    }

    /**
     * Check if customer has shown willingness to buy.
     */
    public function hasCustomerWillingness()
    {
        return $this->customer_willing_to_buy && $this->willingness_confirmed_at !== null;
    }

    /**
     * Check if the product request is terminated (rejected or customer lost interest).
     * Terminated requests should not allow further workflow updates.
     */
    public function isTerminated(): bool
    {
        return $this->status === 'rejected' || $this->lost_interest_at !== null;
    }

    /**
     * Check if the product request is active and can continue workflow.
     */
    public function isActive(): bool
    {
        return !$this->isTerminated();
    }

    /**
     * Mark customer willingness to buy.
     */
    public function markCustomerWillingness()
    {
        // Prevent workflow updates if request is terminated
        if ($this->isTerminated()) {
            \Log::warning('Attempted to mark customer willingness on terminated request', [
                'product_request_id' => $this->id,
                'status' => $this->status,
                'lost_interest_at' => $this->lost_interest_at,
            ]);
            throw new \Exception('Cannot update willingness: Product request is terminated.');
        }

        $this->update([
            'customer_willing_to_buy' => true,
            'willingness_confirmed_at' => now()
        ]);
    }

    /**
     * Mark advance payment as paid.
     */
    public function markAdvancePaid($paymentMethod, $reference, array $details = [])
    {
        // Prevent workflow updates if request is terminated
        if ($this->isTerminated()) {
            \Log::warning('Attempted to mark advance payment as paid on terminated request', [
                'product_request_id' => $this->id,
                'status' => $this->status,
                'lost_interest_at' => $this->lost_interest_at,
                'new_reference' => $reference,
            ]);
            return false;
        }

        // Prevent duplicate payments - check if already paid
        if ($this->advance_payment_status === 'paid') {
            \Log::warning('Attempted to mark advance payment as paid when already paid', [
                'product_request_id' => $this->id,
                'current_status' => $this->advance_payment_status,
                'new_reference' => $reference,
            ]);
            return false;
        }

        $this->update([
            'advance_payment_status' => 'paid',
            'advance_paid_at' => now(),
            'payment_method' => $paymentMethod,
            'payment_reference' => $reference,
            'payment_details' => $details,
        ]);
        
        return true;
    }

    /**
     * Mark final payment as paid.
     */
    public function markFinalPaid($paymentMethod, $reference, array $details = [])
    {
        // Prevent workflow updates if request is terminated
        if ($this->isTerminated()) {
            \Log::warning('Attempted to mark final payment as paid on terminated request', [
                'product_request_id' => $this->id,
                'status' => $this->status,
                'lost_interest_at' => $this->lost_interest_at,
                'new_reference' => $reference,
            ]);
            return false;
        }

        // Prevent duplicate payments - check if already paid
        if ($this->final_payment_status === 'paid') {
            \Log::warning('Attempted to mark final payment as paid when already paid', [
                'product_request_id' => $this->id,
                'current_status' => $this->final_payment_status,
                'new_reference' => $reference,
            ]);
            return false;
        }

        // Ensure advance payment is paid first
        if ($this->advance_payment_status !== 'paid') {
            \Log::error('Attempted to mark final payment as paid before advance payment', [
                'product_request_id' => $this->id,
                'advance_payment_status' => $this->advance_payment_status,
            ]);
            throw new \Exception('Advance payment must be completed before final payment can be marked as paid.');
        }

        $this->update([
            'final_payment_status' => 'paid',
            'final_paid_at' => now(),
            'payment_method' => $paymentMethod,
            'payment_reference' => $reference,
            'payment_details' => $details,
        ]);
        
        return true;
    }

    /**
     * Start procurement process.
     */
    public function startProcurement($expectedCompletionDate = null, $notes = null)
    {
        // Prevent workflow updates if request is terminated
        if ($this->isTerminated()) {
            \Log::warning('Attempted to start procurement on terminated request', [
                'product_request_id' => $this->id,
                'status' => $this->status,
                'lost_interest_at' => $this->lost_interest_at,
            ]);
            throw new \Exception('Cannot start procurement: Product request is terminated.');
        }

        $this->update([
            'procurement_status' => 'in_progress',
            'procurement_started_at' => now(),
            'procurement_expected_completion_date' => $expectedCompletionDate,
            'procurement_notes' => $notes
        ]);
    }

    /**
     * Complete procurement process.
     */
    public function completeProcurement($notes = null)
    {
        // Prevent workflow updates if request is terminated
        if ($this->isTerminated()) {
            \Log::warning('Attempted to complete procurement on terminated request', [
                'product_request_id' => $this->id,
                'status' => $this->status,
                'lost_interest_at' => $this->lost_interest_at,
            ]);
            throw new \Exception('Cannot complete procurement: Product request is terminated.');
        }

        $this->update([
            'procurement_status' => 'completed',
            'procurement_completed_at' => now(),
            'procurement_notes' => $notes
        ]);
    }

    /**
     * Mark product as arrived.
     */
    public function markProductArrived()
    {
        // Prevent workflow updates if request is terminated
        if ($this->isTerminated()) {
            \Log::warning('Attempted to mark product as arrived on terminated request', [
                'product_request_id' => $this->id,
                'status' => $this->status,
                'lost_interest_at' => $this->lost_interest_at,
            ]);
            throw new \Exception('Cannot mark product as arrived: Product request is terminated.');
        }

        $this->update([
            'product_arrived_at' => now()
        ]);
    }

    /**
     * Get the current workflow status.
     */
    public function getWorkflowStatus()
    {
        // Handle null/empty states gracefully
        if ($this->status === 'pending') return 'pending_approval';
        if ($this->status === 'rejected') return 'rejected';
        
        if ($this->status === 'approved') {
            // Check if customer has lost interest (this should take priority)
            if ($this->lost_interest_at) {
                return 'customer_lost_interest';
            }
            
            // Check customer willingness (handle null as false)
            if (!$this->customer_willing_to_buy) {
                return 'awaiting_customer_willingness';
            }
            
            // Check advance payment status (handle null as 'pending')
            $advanceStatus = $this->advance_payment_status ?? 'pending';
            
            // If payment is processing (awaiting payment approval), return appropriate status
            if ($advanceStatus === 'processing') {
                return 'awaiting_admin_approval';
            }
            
            // If payment hasn't been paid yet, customer is awaiting to pay advance
            if ($advanceStatus !== 'paid') {
                return 'awaiting_advance_payment';
            }
            
            // Check procurement status (handle null as 'not_started')
            $procurementStatus = $this->procurement_status ?? 'not_started';
            if ($procurementStatus === 'not_started' || $procurementStatus === null) {
                return 'awaiting_procurement';
            }
            
            if ($procurementStatus === 'in_progress') {
                return 'procurement_in_progress';
            }
            
            if ($procurementStatus === 'completed') {
                // Check if product arrived
                if (!$this->product_arrived_at) {
                    return 'awaiting_delivery';
                }
                
                // Check final payment status (handle null as 'pending')
                $finalStatus = $this->final_payment_status ?? 'pending';
                
                // If final payment is processing (awaiting payment approval), return appropriate status
                if ($finalStatus === 'processing') {
                    return 'awaiting_admin_approval';
                }
                
                // If final payment hasn't been paid yet, customer is awaiting to pay final
                if ($finalStatus !== 'paid') {
                    return 'awaiting_final_payment';
                }
                
                return 'completed';
            }
        }
        
        return 'unknown';
    }

    /**
     * Mark the payment as paid.
     */
    public function markAsPaid($paymentMethod, $reference, array $details = [])
    {
        $this->update([
            'payment_status' => 'paid',
            'payment_method' => $paymentMethod,
            'payment_reference' => $reference,
            'paid_at' => now(),
            'payment_details' => $details,
            'fulfillment_status' => $this->fulfillment_status ?: 'processing',
        ]);

        // You can add additional logic here, like sending notifications
    }

    /**
     * Retrieve the model for route model binding.
     * Add logging to track when model is being resolved.
     */
    public function resolveRouteBinding($value, $field = null)
    {
        \Log::info('=== ProductRequest::resolveRouteBinding ===', [
            'value' => $value,
            'field' => $field,
            'path' => request()->path(),
            'method' => request()->method(),
            'route_name' => request()->route()?->getName(),
            'user_id' => Auth::id(),
        ]);
        
        $model = parent::resolveRouteBinding($value, $field);
        
        if ($model) {
            \Log::info('ProductRequest::resolveRouteBinding - Model found', [
                'product_request_id' => $model->id,
                'user_id' => $model->user_id,
                'status' => $model->status,
            ]);
        } else {
            \Log::warning('ProductRequest::resolveRouteBinding - Model NOT found', [
                'value' => $value,
            ]);
        }
        
        return $model;
    }

    protected static function booted()
    {
        static::created(function ($productRequest) {
            // Dispatch event for product request creation
            try {
                event(new ProductRequestCreated($productRequest));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning(
                    'ProductRequestCreated event dispatch failed: ' . $e->getMessage()
                );
            }
        });

        static::updated(function ($productRequest) {
            // Check if status was changed
            if ($productRequest->isDirty('status')) {
                $oldStatus = $productRequest->getOriginal('status');
                $newStatus = $productRequest->status;
                $admin = $productRequest->admin ?? Auth::user();
                
                // Dispatch event for status change
                try {
                    event(new ProductRequestStatusChanged($productRequest, $oldStatus, $newStatus, $admin));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning(
                        'ProductRequestStatusChanged event dispatch failed: ' . $e->getMessage()
                    );
                }
            }
        });
    }

    // Status Helpers
    public function isPending()
    {
        return $this->status === 'pending';
    }
    
    public function isApproved()
    {
        return $this->status === 'approved';
    }
    
    public function isRejected()
    {
        return $this->status === 'rejected';
    }
    
}