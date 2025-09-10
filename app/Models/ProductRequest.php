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
    ];

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

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
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