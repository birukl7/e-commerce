<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupplierProfile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'business_name',
        'business_email',
        'phone',
        'tax_id',
        'address',
        'verification_status',
        'verification_notes',
        'default_commission_rate',
        'payout_method',
        'created_by_admin_id',
    ];

    protected $casts = [
        'address' => 'array',
        'payout_method' => 'array',
        'default_commission_rate' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function createdByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_admin_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'supplier_id');
    }

    public function scopePending($query)
    {
        return $query->where('verification_status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('verification_status', 'approved');
    }

    public function isApproved(): bool
    {
        return $this->verification_status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->verification_status === 'pending';
    }

    public function isBanned(): bool
    {
        return $this->verification_status === 'banned';
    }
}
