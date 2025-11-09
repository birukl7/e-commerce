<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentRejectionReason extends Model
{
    use HasFactory;

    protected $fillable = [
        'reason_code',
        'reason_text',
        'description',
        'applies_to',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'applies_to' => 'array',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('reason_text');
    }

    public function scopeForPaymentType($query, string $paymentType)
    {
        // paymentType can be 'product_request' or 'normal_purchase'
        return $query->where(function ($q) use ($paymentType) {
            $q->whereJsonContains('applies_to', 'both')
              ->orWhereJsonContains('applies_to', $paymentType);
        });
    }

    public function paymentTransactions()
    {
        return $this->hasMany(PaymentTransaction::class, 'rejection_reason_code', 'reason_code');
    }
}
