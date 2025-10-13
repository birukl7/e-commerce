<?php

namespace App\Models;

use App\Mail\ProductRequestNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

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
        'tracking_url'
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
        'payment_details' => 'array',
        'specifications' => 'array',
        'quantity' => 'integer'
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

        $order = new Order([
            'user_id' => $this->user_id,
            'status' => $markPaid ? 'processing' : 'pending',
            'payment_status' => $markPaid ? 'paid' : 'pending',
            'payment_method' => $this->payment_method,
            'currency' => $this->currency,
            'subtotal' => $amount,
            'shipping_amount' => $this->shipping_cost ?? 0,
            'total_amount' => $amount + ($this->shipping_cost ?? 0),
            'shipping_fullname' => optional($this->user)->name,
            'shipping_email' => optional($this->user)->email,
            'shipping_phone' => optional($this->user)->phone,
            'shipping_address' => $this->shipping_address,
            'notes' => 'Created from product request #' . $this->id,
        ]);

        $order->save();

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
            
            // Optionally notify admin about new request
            if ($admin = User::where('role', 'admin')->first()) {
                Mail::to($admin->email)
                    ->send(new ProductRequestNotification(
                        $productRequest,
                        $admin,
                        'admin_notification',
                        $admin
                    ));
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
    
    public function isReviewed()
    {
        return $this->status === 'reviewed';
    }
}