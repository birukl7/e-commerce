<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Notifications\ProductOutOfStock;
use App\Notifications\ProductLowStock;
use App\Events\ProductStockUpdated;
use App\Services\StockNotificationService;
use App\Models\TaxSetting;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'slug',
        'sku',
        'price',
        'stock_quantity',
        'stock_status',
        'manage_stock',
        'low_stock_threshold', 
        'sale_price',
        'cost_price',
        'stock_quantity',
        'manage_stock',
        'stock_status',
        'weight',
        'length',
        'width',
        'height',
        'category_id',
        'brand_id',
        'featured',
        'status',
        'meta_title',
        'meta_description',
        'tax_setting_id',
        // Supplier fields
        'supplier_id',
        'moderation_status',
        'visibility',
        'rejection_reason',
        'listing_fee_applied',
    ];

    protected $casts = [
        'price' => 'float',
        'sale_price' => 'float',
        'cost_price' => 'float',
        'featured' => 'boolean',
        'status' => 'string',
        'stock_quantity' => 'integer',
        'manage_stock' => 'boolean',
        'low_stock_threshold' => 'integer',
    ];

    protected $appends = ['is_in_stock'];

    protected static function booted()
    {
        static::saving(function ($product) {
            // Update stock status based on quantity if manage_stock is true
            if ($product->manage_stock) {
                if ($product->stock_quantity <= 0) {
                    $product->stock_status = 'out_of_stock';
                } elseif ($product->stock_quantity <= $product->low_stock_threshold) {
                    $product->stock_status = 'low_stock';
                } else {
                    $product->stock_status = 'in_stock';
                }
            }
        });
    }

    /**
     * Check if the product is in stock
     */
    public function getIsInStockAttribute()
    {
        if (!$this->manage_stock) {
            return true;
        }
        return $this->stock_quantity > 0;
    }

    /**
     * Decrease the product stock
     */
    public function decreaseStock(int $quantity = 1)
    {
        if (!$this->manage_stock) {
            return true;
        }

        return DB::transaction(function () use ($quantity) {
            $this->decrement('stock_quantity', $quantity);
            
            // Check if we need to update stock status
            if ($this->stock_quantity <= 0) {
                $this->stock_status = 'out_of_stock';
                $this->save();
                
                // Notify admin about out of stock
                $this->notifyAdminsAboutOutOfStock();
            } 
            // Check if we're below low stock threshold
            elseif ($this->stock_quantity <= $this->low_stock_threshold) {
                $this->stock_status = 'low_stock';
                $this->save();
                
                // Notify admin about low stock
                $this->notifyAdminsAboutLowStock();
            }
            
            // Dispatch stock updated event
            event(new ProductStockUpdated($this));
            
            return true;
        });
    }

    /**
     * Increase the product stock
     */
    public function increaseStock(int $quantity = 1)
    {
        if (!$this->manage_stock) {
            return true;
        }

        return DB::transaction(function () use ($quantity) {
            $wasOutOfStock = $this->stock_quantity <= 0;
            
            $this->increment('stock_quantity', $quantity);
            
            // Update stock status if needed
            if ($this->stock_quantity > 0) {
                $this->stock_status = 'in_stock';
                $this->save();
                
                // If product was out of stock and now has stock, notify subscribers
                if ($wasOutOfStock) {
                    $this->notifyBackInStock();
                }
            }
            
            // Dispatch stock updated event
            event(new ProductStockUpdated($this));
            
            return true;
        });
    }

    /**
     * Check if the requested quantity is available
     */
    public function hasStock(int $quantity = 1): bool
    {
        if (!$this->manage_stock) {
            return true;
        }
        
        return $this->stock_quantity >= $quantity;
    }

    /**
     * Get the available stock quantity
     */
    public function getAvailableStock(): int
    {
        if (!$this->manage_stock) {
            return 9999; // Arbitrary large number for products not managing stock
        }
        
        return $this->stock_quantity;
    }

    /**
     * Notify admins when product is out of stock
     */
    protected function notifyAdminsAboutOutOfStock()
    {
        $admins = \App\Models\User::where('is_admin', true)->get();
        
        foreach ($admins as $admin) {
            $admin->notify(new ProductOutOfStock($this));
        }
    }

    /**
     * Notify admins when product is low in stock
     */
    protected function notifyAdminsAboutLowStock()
    {
        $admins = \App\Models\User::where('is_admin', true)->get();
        
        foreach ($admins as $admin) {
            $admin->notify(new ProductLowStock($this));
        }
    }

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }
    
    /**
     * Get the tax setting associated with the product.
     */
    public function taxSetting()
    {
        return $this->belongsTo(TaxSetting::class);
    }

    public function supplier()
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'product_tags');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_status', 'in_stock');
    }

    // Accessors
    public function getCurrentPriceAttribute()
    {
        return $this->sale_price ?? $this->price;
    }

    public function getPrimaryImageAttribute()
    {
        $primaryImage = $this->images()->where('is_primary', true)->first();
        if ($primaryImage) {
            return \App\Services\ImageUrlService::formatImageUrl($primaryImage->image_path);
        }
        
        // Fallback to first image if no primary image
        $firstImage = $this->images()->first();
        if ($firstImage) {
            return \App\Services\ImageUrlService::formatImageUrl($firstImage->image_path);
        }
        
        return null;
    }

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    public function getReviewsCountAttribute()
    {
        return $this->reviews()->count();
    }

        /**
     * Get the wishlist items for the product.
     */
    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * Get the users who have this product in their wishlist.
     */
    public function wishlistedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'wishlists')
                    ->withTimestamps();
    }

    /**
     * Get the wishlist count for this product.
     */
    public function getWishlistCountAttribute(): int
    {
        return $this->wishlists()->count();
    }



    /**
     * Get approved reviews for this product.
     */
    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class)->approved();
    }



    /**
     * Get rating breakdown (count of each rating).
     */
    public function getRatingBreakdownAttribute(): array
    {
        $breakdown = [];
        for ($i = 1; $i <= 5; $i++) {
            $breakdown[$i] = $this->reviews()->approved()->where('rating', $i)->count();
        }
        return $breakdown;
    }

    /**
     * Check if a user has reviewed this product.
     */
    public function hasReviewFrom(int $userId): bool
    {
        return $this->reviews()->where('user_id', $userId)->exists();
    }

    /**
     * Notify subscribers when product is back in stock
     */
    protected function notifyBackInStock(): void
    {
        try {
            $stockNotificationService = app(StockNotificationService::class);
            $notifiedCount = $stockNotificationService->checkAndNotifyBackInStock($this);
            
            if ($notifiedCount > 0) {
                Log::info('Notified users about product back in stock', [
                    'product_id' => $this->id,
                    'product_name' => $this->name,
                    'notified_count' => $notifiedCount,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to notify users about product back in stock', [
                'product_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get out of stock notifications for this product
     */
    public function outOfStockNotifications()
    {
        return $this->hasMany(OutOfStockNotification::class);
    }

    /**
     * Get notification statistics for this product
     */
    public function getNotificationStats(): array
    {
        $stockNotificationService = app(StockNotificationService::class);
        return $stockNotificationService->getProductNotificationStats($this);
    }
}