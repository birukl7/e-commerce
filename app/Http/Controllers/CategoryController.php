<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Category::all());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
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
    public function show(Request $request, Category $category)
    {
        Log::info('CategoryController@show method hit!', [
            'category' => $category->slug,
            'filters' => $request->all()
        ]);

        // Get filter parameters
        $brand = $request->get('brand');
        $minPrice = $request->get('min_price');
        $maxPrice = $request->get('max_price');
        $sortBy = $request->get('sort_by', 'relevance');
        $stockStatus = $request->get('stock_status');
        $featured = $request->get('featured');
        $perPage = $request->get('per_page', 12);

        // Load category with children (subcategories)
        $category->load('children');

        // Build the products query for this category
        $productsQuery = Product::query()
            ->with(['images' => function ($imageQuery) {
                $imageQuery->orderBy('sort_order');
            }, 'brand'])
            ->where('status', 'published')
            ->where('category_id', $category->id);

        // Apply filters
        if ($brand) {
            $productsQuery->where('brand_id', $brand);
        }

        if ($minPrice) {
            $productsQuery->where(function ($q) use ($minPrice) {
                $q->where('sale_price', '>=', $minPrice)
                  ->orWhere(function ($subQuery) use ($minPrice) {
                      $subQuery->whereNull('sale_price')
                               ->where('price', '>=', $minPrice);
                  });
            });
        }

        if ($maxPrice) {
            $productsQuery->where(function ($q) use ($maxPrice) {
                $q->where('sale_price', '<=', $maxPrice)
                  ->orWhere(function ($subQuery) use ($maxPrice) {
                      $subQuery->whereNull('sale_price')
                               ->where('price', '<=', $maxPrice);
                  });
            });
        }

        if ($stockStatus) {
            $productsQuery->where('stock_status', $stockStatus);
        }

        if ($featured) {
            $productsQuery->where('featured', true);
        }

        // Apply sorting
        $this->applySorting($productsQuery, $sortBy);

        // Get paginated products
        $products = $productsQuery->paginate($perPage);

        // Transform products data using your existing logic
        $transformedProducts = $products->getCollection()->map(function ($product) {
            return $this->transformProduct($product);
        });

        // Get available filters for this category
        $availableFilters = $this->getAvailableFilters($category->id);

        // Fix: Use 'image/' instead of 'storage/image/' for category image
        $category_image = asset('/image/' . $category->image);

        // temporary fix: remove "subcategories" sub path for image subcategories

        return Inertia::render('categories/show', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image' => $category_image,
                'subcategories' => $category->children->map(function ($subcategory) {
                    // Fix: Use 'image/' instead of 'storage/image/'
                    $subcategory_image = asset('/image/' . $subcategory->image);
                    return [
                        'id' => $subcategory->id,
                        'name' => $subcategory->name,
                        'slug' => $subcategory->slug,
                        'image' => $subcategory_image,
                        'product_count' => $subcategory->products()->where('status', 'published')->count(),
                    ];
                }),
                'product_count' => $category->products()->where('status', 'published')->count(),
            ],
            'products' => $transformedProducts,
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ],
            'filters' => $availableFilters,
            'currentFilters' => [
                'brand' => $brand,
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
                'sort_by' => $sortBy,
                'stock_status' => $stockStatus,
                'featured' => $featured,
            ],
            'sortOptions' => $this->getSortOptions(),
        ]);
    }

    /**
     * Apply sorting to the products query
     */
    private function applySorting($query, $sortBy)
    {
        switch ($sortBy) {
            case 'price_asc':
                $query->orderByRaw('COALESCE(sale_price, price) ASC');
                break;
            case 'price_desc':
                $query->orderByRaw('COALESCE(sale_price, price) DESC');
                break;
            case 'name_asc':
                $query->orderBy('name', 'ASC');
                break;
            case 'name_desc':
                $query->orderBy('name', 'DESC');
                break;
            case 'newest':
                $query->orderBy('created_at', 'DESC');
                break;
            case 'featured':
                $query->orderBy('featured', 'DESC')->orderBy('created_at', 'DESC');
                break;
            case 'rating':
                // If you have reviews relationship, uncomment this:
                // $query->withAvg('reviews', 'rating')->orderBy('reviews_avg_rating', 'DESC');
                $query->orderBy('featured', 'DESC')->orderBy('created_at', 'DESC');
                break;
            default: // relevance
                $query->orderBy('featured', 'DESC')->orderBy('created_at', 'DESC');
                break;
        }
    }

    /**
     * Transform product data using your existing logic
     */
    private function transformProduct($product)
    {
        // Get the primary image or first image (your existing logic)
        $primaryImage = $product->images->where('is_primary', true)->first()
                     ?? $product->images->first();
                            
        $product_image = $primaryImage
             ? asset('/image/' . $primaryImage->image_path)
            : asset('/image/placeholder.jpg'); // fallback image

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => (float) $product->price,
            'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
            'current_price' => (float) ($product->sale_price ?? $product->price),
            'description' => $product->description,
            'image' => $product_image,
            'images' => $product->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => asset('/image/' . $image->image_path),
                    'alt_text' => $image->alt_text,
                    'is_primary' => $image->is_primary,
                ];
            }),
            'featured' => $product->featured,
            'stock_status' => $product->stock_status,
            'category' => $product->category ? $product->category->name : null,
            'brand' => $product->brand ? $product->brand->name : null,
        ];
    }

    /**
     * Get available filters for the category with dynamic price ranges
     */
    private function getAvailableFilters($categoryId)
    {
        // Get price statistics for this category
        $priceStats = Product::where('category_id', $categoryId)
            ->where('status', 'published')
            ->selectRaw('
                MIN(COALESCE(sale_price, price)) as min_price,
                MAX(COALESCE(sale_price, price)) as max_price,
                AVG(COALESCE(sale_price, price)) as avg_price
            ')
            ->first();

        $minPrice = $priceStats->min_price ?? 0;
        $maxPrice = $priceStats->max_price ?? 1000;
        $avgPrice = $priceStats->avg_price ?? 500;

        // Generate dynamic price ranges based on actual prices
        $priceRanges = $this->generateDynamicPriceRanges($minPrice, $maxPrice, $avgPrice);

        return [
            'brands' => Brand::select('id', 'name')
                ->whereHas('products', function ($query) use ($categoryId) {
                    $query->where('status', 'published')
                          ->where('category_id', $categoryId);
                })
                ->get(),
            'price_ranges' => $priceRanges,
            'price_stats' => [
                'min' => (float) $minPrice,
                'max' => (float) $maxPrice,
                'avg' => (float) $avgPrice,
            ],
            'stock_statuses' => [
                ['value' => 'in_stock', 'label' => 'In Stock'],
                ['value' => 'out_of_stock', 'label' => 'Out of Stock'],
                ['value' => 'on_backorder', 'label' => 'On Backorder'],
            ]
        ];
    }

    /**
     * Generate dynamic price ranges based on actual product prices
     */
    private function generateDynamicPriceRanges($minPrice, $maxPrice, $avgPrice)
    {
        $ranges = [];
        
        // If price range is small, create smaller intervals
        if ($maxPrice <= 100) {
            $ranges = [
                ['min' => 0, 'max' => 25, 'label' => 'Under 25 ETB'],
                ['min' => 25, 'max' => 50, 'label' => '25 - 50 ETB'],
                ['min' => 50, 'max' => 75, 'label' => '50 - 75 ETB'],
                ['min' => 75, 'max' => 100, 'label' => '75 - 100 ETB'],
            ];
        } elseif ($maxPrice <= 1000) {
            $ranges = [
                ['min' => 0, 'max' => 100, 'label' => 'Under 100 ETB'],
                ['min' => 100, 'max' => 250, 'label' => '100 - 250 ETB'],
                ['min' => 250, 'max' => 500, 'label' => '250 - 500 ETB'],
                ['min' => 500, 'max' => 750, 'label' => '500 - 750 ETB'],
                ['min' => 750, 'max' => 1000, 'label' => '750 - 1,000 ETB'],
            ];
        } elseif ($maxPrice <= 10000) {
            $ranges = [
                ['min' => 0, 'max' => 500, 'label' => 'Under 500 ETB'],
                ['min' => 500, 'max' => 1000, 'label' => '500 - 1,000 ETB'],
                ['min' => 1000, 'max' => 2500, 'label' => '1,000 - 2,500 ETB'],
                ['min' => 2500, 'max' => 5000, 'label' => '2,500 - 5,000 ETB'],
                ['min' => 5000, 'max' => 10000, 'label' => '5,000 - 10,000 ETB'],
            ];
        } else {
            // For very high prices, create larger intervals
            $ranges = [
                ['min' => 0, 'max' => 1000, 'label' => 'Under 1,000 ETB'],
                ['min' => 1000, 'max' => 5000, 'label' => '1,000 - 5,000 ETB'],
                ['min' => 5000, 'max' => 10000, 'label' => '5,000 - 10,000 ETB'],
                ['min' => 10000, 'max' => 25000, 'label' => '10,000 - 25,000 ETB'],
                ['min' => 25000, 'max' => null, 'label' => 'Over 25,000 ETB'],
            ];
        }

        // Add "Over X" range for the maximum
        if ($maxPrice > 0) {
            $lastRange = end($ranges);
            if ($lastRange['max'] !== null && $maxPrice > $lastRange['max']) {
                $ranges[] = [
                    'min' => $lastRange['max'],
                    'max' => null,
                    'label' => 'Over ' . number_format($lastRange['max']) . ' ETB'
                ];
            }
        }

        return $ranges;
    }

    /**
     * Get available sort options
     */
    private function getSortOptions()
    {
        return [
            ['value' => 'relevance', 'label' => 'Relevance'],
            ['value' => 'price_asc', 'label' => 'Price: Low to High'],
            ['value' => 'price_desc', 'label' => 'Price: High to Low'],
            ['value' => 'name_asc', 'label' => 'Name: A to Z'],
            ['value' => 'name_desc', 'label' => 'Name: Z to A'],
            ['value' => 'newest', 'label' => 'Newest First'],
            ['value' => 'featured', 'label' => 'Featured First'],
            ['value' => 'rating', 'label' => 'Customer Rating'],
        ];
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
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
}
