<?php

namespace App\Models;

use App\Services\StockService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'payment_status',
        'payment_method',
        'payment_id',
        'currency',
        'subtotal',
        'tax_amount',
        'shipping_amount',
        'discount_amount',
        'total_amount',
        'shipping_method',
        'shipping_fullname',
        'shipping_email',
        'shipping_phone',
        'shipping_address',
        'shipping_city',
        'shipping_country',
        'billing_fullname',
        'billing_email',
        'billing_phone',
        'billing_address',
        'billing_city',
        'billing_country',
        'notes',
        'shipped_at',
        'delivered_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Boot method for auto-generating order number and handling stock
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($order) {
            $order->order_number = 'ORD-' . strtoupper(uniqid());
        });

        // When order is created, decrease stock if payment is completed
        static::created(function ($order) {
            if ($order->payment_status === 'completed') {
                try {
                    app(StockService::class)->decreaseStockForOrder($order);
                } catch (\Exception $e) {
                    Log::error('Failed to decrease stock for order: ' . $e->getMessage());
                }
            }
        });

        // When order payment status changes to completed, decrease stock
        static::updated(function ($order) {
            $stockService = app(StockService::class);
            
            // If payment was just completed
            if ($order->wasChanged('payment_status') && $order->payment_status === 'completed') {
                try {
                    $stockService->decreaseStockForOrder($order);
                } catch (\Exception $e) {
                    Log::error('Failed to decrease stock for order: ' . $e->getMessage());
                }
            }
            
            // If order was cancelled or refunded, restore stock
            if ($order->wasChanged('status') && in_array($order->status, ['cancelled', 'refunded'])) {
                try {
                    $stockService->restoreStockForOrder($order);
                } catch (\Exception $e) {
                    Log::error('Failed to restore stock for order: ' . $e->getMessage());
                }
            }
        });
    }

    public function scopeDateRange($query, $from, $to)
    {
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }
        return $query;
    }

    /**
     * Scope for orders by payment status
     */
    public function scopeByPaymentStatus($query, $paymentStatus)
    {
        return $query->where('payment_status', $paymentStatus);
    }

    /**
     * Scope for searching orders
     */
    public function scopeSearch($query, $searchTerm)
    {
        return $query->where(function ($q) use ($searchTerm) {
            $q->where('order_number', 'like', "%{$searchTerm}%")
            ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                $userQuery->where('name', 'like', "%{$searchTerm}%")
                        ->orWhere('email', 'like', "%{$searchTerm}%");
            });
        });
    }

    /**
     * Get formatted status for display
     */
    public function getFormattedStatusAttribute()
    {
        return ucfirst(str_replace('_', ' ', $this->status));
    }

    /**
     * Get formatted payment status for display
     */
    public function getFormattedPaymentStatusAttribute()
    {
        return ucfirst(str_replace('_', ' ', $this->payment_status));
    }

    /**
     * Check if order can be cancelled
     */
    public function canBeCancelled()
    {
        return in_array($this->status, ['processing']) && 
            in_array($this->payment_status, ['pending', 'failed']);
    }

    /**
     * Check if order can be shipped
     */
    public function canBeShipped()
    {
        return $this->status === 'processing' && $this->payment_status === 'paid';
    }

    /**
     * Check if order can be delivered
     */
    public function canBeDelivered()
    {
        return $this->status === 'shipped';
    }

    /**
     * Get total items count
     */
    public function getTotalItemsAttribute()
    {
        return $this->items->sum('quantity');
    }

    /**
     * Get order age in days
     */
    public function getOrderAgeAttribute()
    {
        return $this->created_at->diffInDays(now());
    }
}