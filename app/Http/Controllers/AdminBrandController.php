<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AdminBrandController extends Controller
{
    public function index()
    {
        return redirect()->route('admin.categories.index');
    }

    public function show(Brand $brand)
    {
        return Inertia::render('admin/brand/show', [
            'brand' => $brand
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:brands,slug',
            'description' => 'required|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:10240',
            'is_active' => 'boolean'
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('brands', 'public');
        }

        $validated['logo'] = $logoPath;
        Brand::create($validated);

        return redirect()->back()->with('success', 'Brand created successfully.');
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:brands,slug,' . $brand->id,
            'description' => 'required|string',
            'logo' => 'nullable', // We'll handle validation manually below
            'is_active' => 'boolean'
        ]);

        // Check if it's a file upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($brand->logo && Storage::disk('public')->exists($brand->logo)) {
                Storage::disk('public')->delete($brand->logo);
            }
            $validated['logo'] = $request->file('logo')->store('brands', 'public');
        } elseif (is_string($request->input('logo'))) {
            // Keep existing logo path
            $validated['logo'] = $request->input('logo');
        } else {
            $validated['logo'] = null;
        }

        $brand->update($validated);

        return redirect()->back()->with('success', 'Brand updated successfully.');
    }

    public function destroy(Brand $brand)
    {
        // Delete associated logo
        if ($brand->logo && Storage::disk('public')->exists($brand->logo)) {
            Storage::disk('public')->delete($brand->logo);
        }
        
        $brand->delete();
        return redirect()->back()->with('success', 'Brand deleted successfully.');
    }
}