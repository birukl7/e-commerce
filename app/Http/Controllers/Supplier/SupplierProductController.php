<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Http\Requests\Supplier\ProductRequest;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SupplierProductController extends Controller
{
    public function __construct()
    {
        $this->middleware('role:supplier');
        $this->middleware('verified');
    }

    public function index(Request $request)
    {
        $products = $request->user()->supplierProducts()
            ->with(['category', 'brand'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Supplier/Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search']),
            'statuses' => [
                'draft' => 'Draft',
                'pending_review' => 'Pending Review',
                'approved' => 'Approved',
                'rejected' => 'Rejected',
                'suspended' => 'Suspended',
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('create', Product::class);

        return Inertia::render('Supplier/Products/Create', [
            'categories' => Category::active()->get(['id', 'name']),
            'brands' => Brand::active()->get(['id', 'name']),
        ]);
    }

    public function store(ProductRequest $request)
    {
        $this->authorize('create', Product::class);

        $data = $request->validated();
        $data['slug'] = $this->createSlug($data['name']);
        $data['supplier_id'] = $request->user()->id;
        $data['moderation_status'] = 'draft';
        
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($data);

        if (isset($data['images']) && is_array($data['images'])) {
            $this->uploadProductImages($product, $data['images']);
        }

        return redirect()
            ->route('supplier.products.edit', $product->id)
            ->with('success', 'Product created successfully. You can now add more details.');
    }

    public function show(Product $product)
    {
        $this->authorize('view', $product);

        $product->load(['category', 'brand', 'images', 'reviews']);

        return Inertia::render('Supplier/Products/Show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product)
    {
        $this->authorize('update', $product);

        $product->load(['category', 'brand', 'images']);

        return Inertia::render('Supplier/Products/Edit', [
            'product' => $product,
            'categories' => Category::active()->get(['id', 'name']),
            'brands' => Brand::active()->get(['id', 'name']),
        ]);
    }

    public function update(ProductRequest $request, Product $product)
    {
        $this->authorize('update', $product);

        $data = $request->validated();
        $data['slug'] = $this->createSlug($data['name'], $product->id);

        // Handle image uploads
        if ($request->hasFile('images')) {
            $this->uploadProductImages($product, $request->file('images'));
        }

        $product->update($data);

        return redirect()
            ->route('supplier.products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        // Delete associated images
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }
        $product->images()->delete();

        $product->delete();

        return redirect()
            ->route('supplier.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    public function submitForReview(Product $product)
    {
        $this->authorize('update', $product);

        if ($product->moderation_status !== 'draft') {
            return redirect()
                ->route('supplier.products.index')
                ->with('error', 'Only draft products can be submitted for review.');
        }

        $product->update([
            'moderation_status' => 'pending_review',
            'visibility' => 'public',
        ]);

        return redirect()
            ->route('supplier.products.index')
            ->with('success', 'Product submitted for review successfully.');
    }

    /**
     * Create a unique slug for the product
     */
    protected function createSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (Product::where('slug', $slug)->when($excludeId, function ($query) use ($excludeId) {
            return $query->where('id', '!=', $excludeId);
        })->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Upload product images
     */
    protected function uploadProductImages(Product $product, array $images): void
    {
        foreach ($images as $index => $image) {
            if ($image->isValid()) {
                $path = $image->store('products', 'public');
                $product->images()->create([
                    'image_path' => $path,
                    'is_primary' => false,
                ]);
            }
        }
    }
}