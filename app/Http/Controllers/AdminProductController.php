<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'images']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category')) {
            $query->where('category_id', $request->get('category'));
        }

        // Brand filter
        if ($request->filled('brand')) {
            $query->where('brand_id', $request->get('brand'));
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        // Stock status filter
        if ($request->filled('stock_status')) {
            $query->where('stock_status', $request->get('stock_status'));
        }

        // Featured filter
        if ($request->filled('featured')) {
            $query->where('featured', $request->boolean('featured'));
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->get('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->get('max_price'));
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        
        $allowedSorts = ['created_at', 'name', 'price', 'stock_quantity', 'updated_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $products = $query->paginate(12)->withQueryString();

        $categories = Category::where('is_active', true)->orderBy('name')->get();
        $brands = Brand::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('admin/product/index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'filters' => $request->only([
                'search', 'category', 'brand', 'status', 'stock_status', 
                'featured', 'min_price', 'max_price', 'sort_by', 'sort_direction'
            ])
        ]);
    }

    public function show(Product $product)
    {
        $product->load(['category', 'brand', 'images', 'attributes', 'tags']);

        $categories = Category::where('is_active', true)->orderBy('name')->get();
        $brands = Brand::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('admin/product/show', [
            'product' => $product,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Product store request received', [
            'has_images' => $request->hasFile('images'),
            'image_count' => $request->hasFile('images') ? count($request->file('images')) : 0,
            'all_files' => $request->allFiles(),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'sku' => 'required|string|unique:products,sku',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'manage_stock' => 'boolean',
            'stock_status' => 'required|in:in_stock,out_of_stock,on_backorder',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'featured' => 'boolean',
            'status' => 'required|in:draft,published,archived',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ], [
            'images.*.image' => 'Each file must be a valid image.',
            'images.*.mimes' => 'Images must be JPEG, PNG, JPG, GIF, or WebP format.',
            'images.*.max' => 'Each image must be less than 2MB.',
            'images.max' => 'You can upload a maximum of 10 images.',
            'category_id.required' => 'Please select a category.',
            'category_id.exists' => 'The selected category is invalid.',
            'brand_id.required' => 'Please select a brand.',
            'brand_id.exists' => 'The selected brand is invalid.',
            'sku.unique' => 'This SKU is already in use. Please choose a different one.',
            'price.min' => 'Price must be greater than or equal to 0.',
            'stock_quantity.min' => 'Stock quantity cannot be negative.',
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        $product = Product::create($validated);

        // Handle image uploads
        if ($request->hasFile('images')) {
            Log::info('Processing image uploads', ['count' => count($request->file('images'))]);
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                Log::info('Image stored', ['path' => $path, 'index' => $index]);
                $product->images()->create([
                    'image_path' => $path,
                    'alt_text' => $validated['name'],
                    'is_primary' => $index === 0, // First image is primary
                    'sort_order' => $index
                ]);
            }
        }

        return redirect()->back()->with('success', 'Product created successfully.');
    }

    public function update(Request $request, Product $product)
    {
        Log::info('Product update request received', [
            'product_id' => $product->id,
            'has_images' => $request->hasFile('images'),
            'image_count' => $request->hasFile('images') ? count($request->file('images')) : 0,
            'all_files' => $request->allFiles(),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'sku' => 'required|string|unique:products,sku,' . $product->id,
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'manage_stock' => 'boolean',
            'stock_status' => 'required|in:in_stock,out_of_stock,on_backorder',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'featured' => 'boolean',
            'status' => 'required|in:draft,published,archived',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ], [
            'images.*.image' => 'Each file must be a valid image.',
            'images.*.mimes' => 'Images must be JPEG, PNG, JPG, GIF, or WebP format.',
            'images.*.max' => 'Each image must be less than 2MB.',
            'images.max' => 'You can upload a maximum of 10 images.',
            'category_id.required' => 'Please select a category.',
            'category_id.exists' => 'The selected category is invalid.',
            'brand_id.required' => 'Please select a brand.',
            'brand_id.exists' => 'The selected brand is invalid.',
            'sku.unique' => 'This SKU is already in use. Please choose a different one.',
            'price.min' => 'Price must be greater than or equal to 0.',
            'stock_quantity.min' => 'Stock quantity cannot be negative.',
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        $product->update($validated);

        // Handle image uploads
        if ($request->hasFile('images')) {
            Log::info('Processing update image uploads', ['count' => count($request->file('images'))]);
            // Delete existing images if new ones are uploaded
            $product->images()->delete();
            
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                Log::info('Update image stored', ['path' => $path, 'index' => $index]);
                $product->images()->create([
                    'image_path' => $path,
                    'alt_text' => $validated['name'],
                    'is_primary' => $index === 0,
                    'sort_order' => $index
                ]);
            }
        }

        return redirect()->back()->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->back()->with('success', 'Product deleted successfully.');
    }
}
