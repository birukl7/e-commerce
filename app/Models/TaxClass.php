<?php

namespace App\Models;

use App\Models\TaxSetting;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class TaxClass extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
        'is_default',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the tax settings associated with this tax class.
     */
    public function taxSettings()
    {
        return $this->hasMany(\App\Models\TaxSetting::class, 'tax_class_id');
    }

    /**
     * The "booting" method of the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Generate slug when creating a new tax class
        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
            
            // Ensure only one default tax class exists
            if ($model->is_default) {
                static::where('is_default', true)->update(['is_default' => false]);
            }
        });

        // Ensure only one default tax class exists when updating
        static::updating(function ($model) {
            if ($model->is_default) {
                static::where('id', '!=', $model->id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }
        });
    }

    /**
     * Get the tax rates associated with this tax class.
     */
    public function taxRates()
    {
        return $this->hasMany(TaxSetting::class);
    }

    /**
     * Get the products associated with this tax class.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Scope a query to only include active tax classes.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include the default tax class.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Get the default tax class.
     */
    public static function getDefault()
    {
        return static::default()->first() ?? static::first();
    }

    /**
     * Set this tax class as the default.
     */
    public function setAsDefault()
    {
        DB::transaction(function () {
            static::where('is_default', true)->update(['is_default' => false]);
            $this->is_default = true;
            $this->save();
        });
    }
}
