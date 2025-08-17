<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfflinePaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'description',
        'instructions',
        'details',
        'logo',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'details' => 'array',
        'is_active' => 'boolean',
    ];

    public function submissions()
    {
        return $this->hasMany(OfflinePaymentSubmission::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
