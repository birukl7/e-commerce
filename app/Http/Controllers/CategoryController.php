<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;


class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        // dd(Category::all());
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
    public function show(Category $category)
    {
        $category->load([
            'children',
            'products' => function ($query) {
                $query->with(['images' => function ($imageQuery) {
                    $imageQuery->orderBy('sort_order');
                }]);
            }
        ]);

        // Fix: Use 'image/' instead of 'storage/image/'
        $category_image = asset('image/' . $category->image);

        return Inertia::render('categories/show', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image' => $category_image,
                'subcategories' => $category->children->map(function ($subcategory) {
                    // Fix: Use 'image/' instead of 'storage/image/'
                    $subcategory_image = asset('image/' . $subcategory->image);
                    return [
                        'id' => $subcategory->id,
                        'name' => $subcategory->name,
                        'slug' => $subcategory->slug,
                        'image' => $subcategory_image,
                        'product_count' => $subcategory->products()->count(),
                    ];
                }),
                'products' => $category->products->map(function ($product) {
                    // Get the primary image or first image
                    $primaryImage = $product->images->where('is_primary', true)->first() 
                        ?? $product->images->first();
                    
                    $product_image = $primaryImage 
                        ? asset('image' . $primaryImage->image_path)
                        : asset('image/placeholder.jpg'); // fallback image

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
                                'url' => asset('image' . $image->image_path),
                                'alt_text' => $image->alt_text,
                                'is_primary' => $image->is_primary,
                            ];
                        }),
                        'featured' => $product->featured,
                        'stock_status' => $product->stock_status,
                    ];
                }),
                'product_count' => $category->products()->count(),
            ],
        ]);
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
