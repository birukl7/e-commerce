<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AdminCategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with(['parent', 'children'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
            
        $brands = Brand::orderBy('name')->get();

        return Inertia::render('admin/category/index', [
            'categories' => $categories,
            'brands' => $brands
        ]);
    }

    public function show(Category $category)
    {
        $category->load(['parent', 'children']);
        
        return Inertia::render('admin/category/show', [
            'category' => $category
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:categories,slug',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean'
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('categories', 'public');
        }

        $validated['image'] = $imagePath;

        Category::create($validated);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:categories,slug,' . $category->id,
            'description' => 'required|string',
            'image' => 'nullable', // We’ll handle validation manually below
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean'
        ]);
    
        // Prevent assigning itself as parent
        if ($validated['parent_id'] == $category->id) {
            return redirect()->back()->withErrors(['parent_id' => 'Category cannot be its own parent.']);
        }
    
        // Check if it's a file upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('categories', 'public');
        } elseif (is_string($request->input('image'))) {
            // Keep existing image path
            $validated['image'] = $request->input('image');
        } else {
            $validated['image'] = null;
        }
    
        $category->update($validated);
    
        return redirect()->back()->with('success', 'Category updated successfully.');
    }
    

    public function destroy(Request $request, Category $category)
    {
        // Validate password
        $request->validate([
            'password' => 'required|string'
        ]);

        $user = Auth::user();
        
        // Check if the provided password matches the user's password
        if (!Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'password' => 'The provided password is incorrect.'
            ])->withInput();
        }

        // Check if category has products associated with it
        $productCount = $category->products()->count();
        $childCategoryCount = $category->children()->count();

        // Delete the category (this will cascade delete products if configured)
        $category->delete();

        $message = 'Category deleted successfully.';
        if ($productCount > 0) {
            $message .= " {$productCount} associated product(s) were also deleted.";
        }
        if ($childCategoryCount > 0) {
            $message .= " {$childCategoryCount} child categor(ies) were also deleted.";
        }

        return redirect()->back()->with('success', $message);
    }
}