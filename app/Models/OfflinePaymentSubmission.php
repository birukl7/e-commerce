<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfflinePaymentSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_ref',
        'offline_payment_method_id',
        'order_id',
        'amount',
        'currency',
        'customer_name',
        'customer_email',
        'customer_phone',
        'payment_reference',
        'payment_notes',
        'payment_screenshot',
        'status',
        'admin_notes',
        'verified_at',
        'verified_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'verified_at' => 'datetime',
    ];

    public function paymentMethod()
    {
        return $this->belongsTo(OfflinePaymentMethod::class, 'offline_payment_method_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function getStatusBadgeClassAttribute()
    {
        return match($this->status) {
            'pending' => 'bg-yellow-100 text-yellow-800',
            'verified' => 'bg-green-100 text-green-800',
            'rejected' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }
}
