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
        dd(Category::all());
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
            'products' => function ($query){
                $query->with(['images', 'variants']);
            }
        ]);

        return Inertia::render('categories/show', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image' => $category->image,
                'subcategories' => $category->children->map(function ($subcategory) {
                    return [
                        'id' => $subcategory->id,
                        'name' => $subcategory->name,
                        'slug' => $subcategory->slug,
                        'image' => $subcategory->image,
                        'product_count' => $subcategory->products()->count(),
                    ];
                }),
                'products' => $category->products->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'price' => $product->price,
                        'description' => $product->description,
                        'image' => $product->image
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
