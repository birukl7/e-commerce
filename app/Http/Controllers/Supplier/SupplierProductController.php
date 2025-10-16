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
        
        // Only update slug if name has changed
        if ($product->name !== $data['name']) {
            $data['slug'] = $this->createSlug($data['name'], $product->id);
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        // Handle additional images
        if (isset($data['images']) && is_array($data['images'])) {
            $this->uploadProductImages($product, $data['images']);
        }

        return back()->with('success', 'Product updated successfully.');
    }

    public function submitForReview(Product $product)
    {
        $this->authorize('submitForReview', $product);

        $product->update([
            'moderation_status' => 'pending_review',
            'submitted_for_review_at' => now(),
        ]);

        // Notify admin about the submission
        // event(new ProductSubmittedForReview($product));

        return back()->with('success', 'Product submitted for review. It will be visible after approval.');
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        // Soft delete the product
        $product->delete();

        return redirect()
            ->route('supplier.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    protected function createSlug($title, $id = 0)
    {
        $slug = Str::slug($title);
        
        $allSlugs = $this->getRelatedSlugs($slug, $id);
        
        if (! $allSlugs->contains('slug', $slug)){
            return $slug;
        }
        
        for ($i = 1; $i <= 10; $i++) {
            $newSlug = $slug.'-'.$i;
            if (! $allSlugs->contains('slug', $newSlug)) {
                return $newSlug;
            }
        }
        
        return $slug.'-'.time();
    }
    
    protected function getRelatedSlugs($slug, $id = 0)
    {
        return Product::select('slug')
            ->where('slug', 'like', $slug.'%')
            ->where('id', '<>', $id)
            ->get();
    }
    
    protected function uploadProductImages($product, $images)
    {
        foreach ($images as $image) {
            if (is_file($image)) {
                $path = $image->store('products/' . $product->id, 'public');
                $product->images()->create([
                    'image_path' => $path,
                    'is_primary' => false,
                ]);
            }
        }
    }
}
