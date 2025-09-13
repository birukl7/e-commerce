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
        'title',
        'description',
        'image',
        'status',
        'admin_response',
        'admin_id',
        'amount',
        'currency',
        'payment_status',
        'payment_method',
        'payment_reference',
        'paid_at',
        'payment_details'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'payment_details' => 'array',
    ];

    /**
     * Get the user that owns the product request.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who processed the request.
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
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


    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
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