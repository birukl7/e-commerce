<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutOfStockNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'email',
        'is_notified',
        'notified_at',
    ];

    protected $casts = [
        'is_notified' => 'boolean',
        'notified_at' => 'datetime',
    ];

    /**
     * Get the product that is out of stock
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user who requested the notification
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get notifications that haven't been sent yet
     */
    public function scopePending($query)
    {
        return $query->where('is_notified', false);
    }

    /**
     * Scope to get notifications that have been sent
     */
    public function scopeNotified($query)
    {
        return $query->where('is_notified', true);
    }

    /**
     * Mark notification as sent
     */
    public function markAsNotified(): void
    {
        $this->update([
            'is_notified' => true,
            'notified_at' => now(),
        ]);
    }

    /**
     * Check if notification is for a specific product and email combination
     */
    public static function existsForProductAndEmail(int $productId, string $email): bool
    {
        return static::where('product_id', $productId)
            ->where('email', $email)
            ->exists();
    }

    /**
     * Create or get existing notification for product and email
     */
    public static function createOrGet(int $productId, ?int $userId, string $email): self
    {
        return static::firstOrCreate(
            [
                'product_id' => $productId,
                'email' => $email,
            ],
            [
                'user_id' => $userId,
                'is_notified' => false,
            ]
        );
    }
}
