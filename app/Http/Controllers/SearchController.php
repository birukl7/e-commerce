<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log; // Import the Log facade

class SearchController extends Controller
{
    /**
     * Handle search requests - returns Inertia response for the main search results page
     */
    public function search(Request $request)
    {
        Log::info('SearchController@search method hit!', ['query' => $request->get('q'), 'headers' => $request->headers->all()]); // Debug log
        $searchData = $this->performSearch($request);
        
        Log::info('SearchController@search: Preparing Inertia render.', ['data_keys' => array_keys($searchData)]); // Debug log

        return Inertia::render('Search/Results', array_merge($searchData, [
            'query' => $request->get('q', ''),
            'currentFilters' => [
                'category' => $request->get('category'),
                'brand' => $request->get('brand'),
                'min_price' => $request->get('min_price'),
                'max_price' => $request->get('max_price'),
                'sort_by' => $request->get('sort_by', 'relevance'),
            ]
        ]));
    }

    /**
     * Get search suggestions for autocomplete - ALWAYS returns JSON
     */
    public function suggestions(Request $request)
    {
        Log::info('SearchController@suggestions method hit!', ['query' => $request->get('q'), 'headers' => $request->headers->all()]); // Debug log
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            Log::info('SearchController@suggestions: Query too short, returning empty JSON.'); // Debug log
            return response()->json(['suggestions' => []]);
        }

        $suggestions = $this->getSearchSuggestions($query, 8);
        
        Log::info('SearchController@suggestions: Returning JSON suggestions.', ['suggestions_count' => count($suggestions)]); // Debug log
        return response()->json(['suggestions' => $suggestions]);
    }

    /**
     * Perform the actual search logic
     */
    private function performSearch(Request $request)
    {
        $query = $request->get('q', '');
        $category = $request->get('category');
        $brand = $request->get('brand');
        $minPrice = $request->get('min_price');
        $maxPrice = $request->get('max_price');
        $sortBy = $request->get('sort_by', 'relevance');
        $perPage = $request->get('per_page', 12);

        if (empty($query) && !$category && !$brand && !$minPrice && !$maxPrice) {
            return [
                'products' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $perPage,
                    'total' => 0,
                    'from' => 0,
                    'to' => 0,
                ],
                'suggestions' => [],
                'filters' => $this->getAvailableFilters(),
                'active_filters' => [],
                'sort_options' => $this->getSortOptions()
            ];
        }

        // Build the search query
        $productsQuery = Product::query()
            ->with(['images', 'category', 'brand'])
            ->where('status', 'published');

        // Text search with better relevance
        if (!empty($query)) {
            $productsQuery->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhere('sku', 'LIKE', "%{$query}%")
                  ->orWhereHas('category', function ($categoryQuery) use ($query) {
                      $categoryQuery->where('name', 'LIKE', "%{$query}%");
                  })
                  ->orWhereHas('brand', function ($brandQuery) use ($query) {
                      $brandQuery->where('name', 'LIKE', "%{$query}%");
                  });
            });
        }

        // Apply filters
        if ($category) {
            $productsQuery->where('category_id', $category);
        }

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

        // Apply sorting
        $this->applySorting($productsQuery, $sortBy, $query);

        $products = $productsQuery->paginate($perPage);

        // Transform products data
        $transformedProducts = $products->getCollection()->map(function ($product) {
            return $this->transformProduct($product);
        });

        // Get search suggestions if query is provided
        $suggestions = [];
        if (!empty($query) && strlen($query) >= 2) {
            $suggestions = $this->getSearchSuggestions($query);
        }

        // Get active filters for the current search
        $activeFilters = $this->getActiveFilters($productsQuery, $query);

        return [
            'products' => $transformedProducts,
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ],
            'suggestions' => $suggestions,
            'filters' => $this->getAvailableFilters(),
            'active_filters' => $activeFilters,
            'sort_options' => $this->getSortOptions()
        ];
    }

    private function applySorting($query, $sortBy, $searchQuery)
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
            default: // relevance
                if (!empty($searchQuery)) {
                    $query->orderByRaw("
                        CASE 
                            WHEN name LIKE ? THEN 1
                            WHEN name LIKE ? THEN 2
                            WHEN description LIKE ? THEN 3
                            ELSE 4
                        END ASC
                    ", ["{$searchQuery}%", "%{$searchQuery}%", "%{$searchQuery}%"]);
                } else {
                    $query->orderBy('featured', 'DESC')->orderBy('created_at', 'DESC');
                }
                break;
        }
    }

    private function transformProduct($product)
    {
        $primaryImage = $product->images->where('is_primary', true)->first();
        
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => $product->price,
            'sale_price' => $product->sale_price,
            'current_price' => $product->sale_price ?? $product->price,
            'description' => $product->description,
            'image' => $primaryImage ? asset('storage/' . $primaryImage->image_path) : null,
            'images' => $product->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => asset('storage/' . $image->image_path),
                    'alt_text' => $image->alt_text ?? '',
                    'is_primary' => $image->is_primary,
                ];
            }),
            'featured' => $product->featured,
            'stock_status' => $product->stock_status,
            'category' => $product->category ? $product->category->name : null,
            'brand' => $product->brand ? $product->brand->name : null,
        ];
    }

    private function getSearchSuggestions($query, $limit = 5)
    {
        $suggestions = [];

        // Product name suggestions
        $productSuggestions = Product::where('status', 'published')
            ->where('name', 'LIKE', "%{$query}%")
            ->select('name')
            ->distinct()
            ->limit($limit)
            ->get()
            ->map(function ($product) {
                return [
                    'text' => $product->name,
                    'type' => 'product'
                ];
            });

        // Category suggestions
        $categorySuggestions = Category::where('name', 'LIKE', "%{$query}%")
            ->select('name')
            ->limit(3)
            ->get()
            ->map(function ($category) {
                return [
                    'text' => $category->name,
                    'type' => 'category'
                ];
            });

        // Brand suggestions
        $brandSuggestions = Brand::where('name', 'LIKE', "%{$query}%")
            ->select('name')
            ->limit(3)
            ->get()
            ->map(function ($brand) {
                return [
                    'text' => $brand->name,
                    'type' => 'brand'
                ];
            });

        $suggestions = $productSuggestions
            ->concat($categorySuggestions)
            ->concat($brandSuggestions)
            ->take($limit);

        return $suggestions;
    }

    private function getAvailableFilters()
    {
        return [
            'categories' => Category::select('id', 'name')
                ->whereHas('products', function ($query) {
                    $query->where('status', 'published');
                })
                ->get(),
            'brands' => Brand::select('id', 'name')
                ->whereHas('products', function ($query) {
                    $query->where('status', 'published');
                })
                ->get(),
            'price_ranges' => [
                ['min' => 0, 'max' => 25, 'label' => 'Under $25'],
                ['min' => 25, 'max' => 50, 'label' => '$25 - $50'],
                ['min' => 50, 'max' => 100, 'label' => '$50 - $100'],
                ['min' => 100, 'max' => 200, 'label' => '$100 - $200'],
                ['min' => 200, 'max' => null, 'label' => 'Over $200'],
            ]
        ];
    }

    private function getActiveFilters($query, $searchQuery)
    {
        $baseQuery = clone $query;
        
        return [
            'total_results' => $baseQuery->count(),
            'in_stock' => $baseQuery->where('stock_status', 'in_stock')->count(),
            'on_sale' => $baseQuery->whereNotNull('sale_price')->count(),
            'featured' => $baseQuery->where('featured', true)->count(),
        ];
    }

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
        ];
    }
}
