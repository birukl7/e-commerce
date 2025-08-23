<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $categories = Category::with(['children' => function ($query) {
                $query->where('is_active', true)
                      ->orderBy('sort_order');
            }])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

            // Add product count for each category
            $categories->each(function ($category) {
                $category->product_count = $this->getProductCount($category);
                $category->image = asset('image/' . $category->image);
                
                if ($category->children) {
                    $category->children->each(function ($child) {
                        $child->product_count = $this->getProductCount($child);
                    });
                }
            });

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Categories retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        //
    }

    public function featured(Request $request): JsonResponse
    {
        try {
            $count = $request->get('count', 4);
            $count = min(max($count, 1), 12); // Limit between 1 and 12

            // Get random active categories with products
            $categories = Category::where('is_active', true)
                ->whereHas('products') // Only categories that have products
                ->inRandomOrder()
                ->limit($count)
                ->get();

            // Add product count and format image for each category
            $categories->each(function ($category) {
                $category->product_count = $this->getProductCount($category);
                if ($category->image) {
                    $category->image = $category->image;
                }
            });

            // If we don't have enough categories with products, fill with any active categories
            if ($categories->count() < $count) {
                $additionalCount = $count - $categories->count();
                $existingIds = $categories->pluck('id')->toArray();
                
                $additionalCategories = Category::where('is_active', true)
                    ->whereNotIn('id', $existingIds)
                    ->inRandomOrder()
                    ->limit($additionalCount)
                    ->get();

                $additionalCategories->each(function ($category) {
                    $category->product_count = $this->getProductCount($category);
                    if ($category->image) {
                        $category->image = asset('image/' . $category->image);
                    }
                });

                $categories = $categories->merge($additionalCategories);
            }

            return response()->json([
                'success' => true,
                'data' => $categories->shuffle(), // Shuffle again for extra randomness
                'message' => 'Featured categories retrieved successfully',
                'count' => $categories->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve featured categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get categories for showcase (different from featured)
     */
    public function showcase(Request $request): JsonResponse
    {
        try {
            $count = $request->get('count', 3);
            $count = min(max($count, 1), 6); // Limit between 1 and 6
            
            // Get excluded category IDs from request (these are from featured interests)
            $excludeCategories = $request->get('exclude_categories');
            $excludeCategoryIds = $excludeCategories ? explode(',', $excludeCategories) : [];

            $query = Category::where('is_active', true)
                ->whereHas('products'); // Only categories that have products

            // Exclude featured categories if provided
            if (!empty($excludeCategoryIds)) {
                $query->whereNotIn('id', $excludeCategoryIds);
            }

            $categories = $query->inRandomOrder()
                ->limit($count)
                ->get();

            // Add product count and format image for each category
            $categories->each(function ($category) {
                $category->product_count = $this->getProductCount($category);
                if ($category->image) {
                    $category->image = asset('image/' . $category->image);
                }
            });

            // If we don't have enough different categories, get some without the exclusion
            if ($categories->count() < $count) {
                $additionalCount = $count - $categories->count();
                $existingIds = $categories->pluck('id')->toArray();
                
                // Merge with excluded IDs to avoid duplicates
                $allExcludedIds = array_merge($excludeCategoryIds, $existingIds);
                
                $additionalCategories = Category::where('is_active', true)
                    ->whereNotIn('id', $allExcludedIds)
                    ->inRandomOrder()
                    ->limit($additionalCount)
                    ->get();

                $additionalCategories->each(function ($category) {
                    $category->product_count = $this->getProductCount($category);
                    if ($category->image) {
                        $category->image = asset('image/' . $category->image);
                    }
                });

                $categories = $categories->merge($additionalCategories);
            }

            return response()->json([
                'success' => true,
                'data' => $categories->shuffle(),
                'message' => 'Showcase categories retrieved successfully',
                'count' => $categories->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve showcase categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function trending(Request $request): JsonResponse
    {
        try {
            $count = $request->get('count', 6);
            $days = $request->get('days', 7); // Last 7 days by default

            // This is a placeholder - implement based on your analytics/tracking
            // You might track views, purchases, searches, etc.
            $categories = Category::where('is_active', true)
                ->whereHas('products')
                ->withCount(['products' => function ($query) use ($days) {
                    // Example: count products added in last X days
                    $query->where('created_at', '>=', now()->subDays($days));
                }])
                ->orderBy('products_count', 'desc')
                ->limit($count)
                ->get();

            $categories->each(function ($category) {
                $category->product_count = $this->getProductCount($category);
                if ($category->image) {
                    $category->image = asset('image/' . $category->image);
                }
            });

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Trending categories retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve trending categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get product count for a category
     */
    private function getProductCount(Category $category): int
    {
        // Assuming you have a products table with category_id
        // Adjust this based on your actual product model relationship
        return $category->products()->count();
    }
    
    /**
     * Get categories tree structure
     */
    public function tree(): JsonResponse
    {
        try {
            $categories = Category::whereNull('parent_id')
                ->where('is_active', true)
                ->with(['children' => function ($query) {
                    $query->where('is_active', true)->orderBy('sort_order');
                }])
                ->orderBy('sort_order')
                ->get();

            // Add product count and format image URLs for each category
            $categories->each(function ($category) {
                $category->product_count = $this->getProductCount($category);
                
                // Format image URL
                if ($category->image) {
                    $category->image = asset('image/' . $category->image);
                }

                // Process children if they exist
                if ($category->children) {
                    $category->children->each(function ($child) {
                        $child->product_count = $this->getProductCount($child);
                        
                        // Format image URL for children
                        if ($child->image) {
                            $child->image = asset('image/' . $child->image);
                        }
                    });
                }
            });

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Category tree retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve category tree',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
