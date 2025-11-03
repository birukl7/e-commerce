<?php

namespace App\Models;

use App\Mail\ProductRequestNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use App\Events\OrderCreatedFromAdvance;

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
        
        $order = new Order([
            'user_id' => $this->user_id,
            'status' => 'processing', // Orders created from product requests start as processing
            'payment_status' => $markPaid ? 'paid' : 'pending',
            'payment_method' => $this->payment_method,
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

        // Emit advance-created order event
        try {
            event(new OrderCreatedFromAdvance($order));
        } catch (\Throwable $e) {
            // ignore
        }

        $this->order_id = $order->id;
        $this->save();

        return $order;
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
     * Mark customer willingness to buy.
     */
    public function markCustomerWillingness()
    {
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
                return 'pending_payment_approval';
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
                    return 'pending_payment_approval';
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

    protected static function booted()
    {
        static::created(function ($productRequest) {
            // Send notification when a new request is created
            Mail::to($productRequest->user->email)
                ->send(new ProductRequestNotification(
                    $productRequest,
                    $productRequest->user,
                    'submitted'
                ));
            
            // Optionally notify admin about new request (Spatie roles)
            try {
                $admin = null;
                // Try common admin role names
                foreach (['admin', 'administrator', 'super-admin', 'super admin'] as $roleName) {
                    $admin = \App\Models\User::role($roleName)->first();
                    if ($admin) break;
                }

                // Fallback: any user with a role containing 'admin'
                if (!$admin) {
                    $admin = \App\Models\User::whereHas('roles', function($q) {
                        $q->where('name', 'like', '%admin%');
                    })->first();
                }

                if ($admin) {
                    Mail::to($admin->email)
                        ->send(new ProductRequestNotification(
                            $productRequest,
                            $admin,
                            'admin_notification',
                            $admin
                        ));
                }
            } catch (\Throwable $e) {
                // Silently skip admin notification if roles are not set up
            }
        });

        static::updated(function ($productRequest) {
            // Check if status was changed
            if ($productRequest->isDirty('status')) {
                $admin = $productRequest->admin ?? Auth::user();
                
                Mail::to($productRequest->user->email)
                    ->send(new ProductRequestNotification(
                        $productRequest,
                        $productRequest->user,
                        'status_updated',
                        $admin
                    ));
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