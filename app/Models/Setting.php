<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'autoload',
        'description'
    ];

    protected $casts = [
        'autoload' => 'boolean',
    ];

    // Scope for autoloaded settings
    public function scopeAutoloaded($query)
    {
        return $query->where('autoload', true);
    }

    // Scope by group
    public function scopeByGroup($query, string $group)
    {
        return $query->where('group', $group);
    }

    // Helper to get typed value
    public function getTypedValue()
    {
        return match ($this->type) {
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $this->value,
            'float', 'decimal' => (float) $this->value,
            'array', 'json' => is_string($this->value) ? json_decode($this->value, true) : $this->value,
            default => $this->value
        };
    }

    // Static helper methods
    public static function get(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->getTypedValue() : $default;
    }

    public static function set(string $key, $value, string $type = 'string', string $group = 'general', bool $autoload = true): void
    {
        $processedValue = match ($type) {
            'array', 'json' => is_string($value) ? $value : json_encode($value),
            'boolean' => $value ? '1' : '0',
            default => (string) $value
        };

        static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $processedValue,
                'type' => $type,
                'group' => $group,
                'autoload' => $autoload
            ]
        );
    }
}