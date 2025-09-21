<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'type', 'rate', 'description', 'is_active'
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    /**
     * Scope to get only active tax settings
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Calculate tax amount for a given base amount
     */
    public function calculateTax(float $amount): float
    {
        if ($this->type === 'percentage') {
            return ($amount * $this->rate) / 100;
        }
        
        return $this->rate; // Fixed amount
    }

    /**
     * Get formatted rate display
     */
    public function getFormattedRateAttribute(): string
    {
        if ($this->type === 'percentage') {
            return $this->rate . '%';
        }
        
        return 'ETB ' . number_format($this->rate, 2);
    }
}