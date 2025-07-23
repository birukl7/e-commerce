<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
     public function show($slug)
    {
        // Find product by slug with all necessary relationships
        $product = Product::where('slug', $slug)
            ->with([
                'images' => function ($query) {
                    $query->orderBy('sort_order');
                },
                'category',
                'brand',
                'reviews' => function ($query) {
                    $query->latest()->take(10);
                }
            ])
            ->firstOrFail();

        // Get related products from the same category
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'published')
            ->with(['images' => function ($query) {
                $query->where('is_primary', true)->orWhere('sort_order', 1);
            }])
            ->take(4)
            ->get();

        return Inertia::render('products/show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'sku' => $product->sku,
                'price' => (float) $product->price,
                'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                'current_price' => (float) ($product->sale_price ?? $product->price),
                'cost_price' => $product->cost_price ? (float) $product->cost_price : null,
                'stock_quantity' => $product->stock_quantity,
                'stock_status' => $product->stock_status,
                'featured' => $product->featured,
                'status' => $product->status,
                'meta_title' => $product->meta_title,
                'meta_description' => $product->meta_description,
                'images' => $product->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => asset('image' . $image->image_path),
                        'alt_text' => $image->alt_text,
                        'is_primary' => $image->is_primary,
                        'sort_order' => $image->sort_order,
                    ];
                }),
                'primary_image' => $product->images->where('is_primary', true)->first() 
                    ? asset('image' . $product->images->where('is_primary', true)->first()->image_path)
                    : ($product->images->first() 
                        ? asset('image' . $product->images->first()->image_path)
                        : asset('image/placeholder.jpg')),
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ],
                'brand' => [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                    'slug' => $product->brand->slug ?? null,
                ],
                'reviews' => $product->reviews->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'user_name' => $review->user->name ?? 'Anonymous',
                        'created_at' => $review->created_at->format('M d, Y'),
                    ];
                }),
                'average_rating' => round($product->reviews->avg('rating') ?? 0, 1),
                'reviews_count' => $product->reviews->count(),
            ],
            'related_products' => $relatedProducts->map(function ($product) {
                $primaryImage = $product->images->where('is_primary', true)->first() 
                    ?? $product->images->first();
                
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'current_price' => (float) ($product->sale_price ?? $product->price),
                    'description' => $product->description,
                    'image' => $primaryImage 
                        ? asset('image' . $primaryImage->image_path)
                        : asset('image/placeholder.jpg'),
                    'images' => $product->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => asset('image' . $image->image_path),
                            'alt_text' => $image->alt_text,
                            'is_primary' => $image->is_primary,
                        ];
                    }),
                    'featured' => $product->featured,
                    'stock_status' => $product->stock_status,
                ];
            }),
        ]);
    } 

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        //
    }
}
