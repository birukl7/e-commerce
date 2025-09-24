<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TaxClassRequest;
use App\Models\TaxClass;
use App\Http\Resources\TaxClassResource;
use App\Http\Resources\TaxClassCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TaxClassController extends Controller
{
    /**
     * Display a listing of tax classes.
     */
    /**
     * Display a listing of tax classes with pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', TaxClass::class);
        
        $perPage = $request->input('per_page', 15);
        $taxClasses = TaxClass::withCount('taxRates')
            ->orderBy('sort_order')
            ->paginate($perPage);
            
        return new TaxClassCollection($taxClasses);
    }

    /**
     * Store a newly created tax class in storage.
     */
    /**
     * Store a newly created tax class in storage.
     */
    /**
     * Store a newly created tax class in storage.
     */
    public function store(TaxClassRequest $request): JsonResponse
    {
        // Start transaction to ensure data consistency
        return DB::transaction(function () use ($request) {
            $taxClass = TaxClass::create($request->validated());
            
            // If this is set as default, update other records
            if ($taxClass->is_default) {
                TaxClass::where('id', '!=', $taxClass->id)
                    ->update(['is_default' => false]);
            }
            
            return (new TaxClassResource($taxClass))
                ->response()
                ->setStatusCode(201);
        });
    }

    /**
     * Display the specified tax class.
     */
    /**
     * Display the specified tax class.
     */
    public function show(TaxClass $taxClass): JsonResponse
    {
        $this->authorize('view', $taxClass);
        
        return response()->json([
            'data' => new TaxClassResource($taxClass->load('taxRates')),
            'message' => 'Tax class retrieved successfully.'
        ]);
    }

    /**
     * Update the specified tax class in storage.
     */
    /**
     * Update the specified tax class in storage.
     */
    /**
     * Update the specified tax class in storage.
     */
    public function update(TaxClassRequest $request, TaxClass $taxClass): JsonResponse
    {
        // Start transaction to ensure data consistency
        return DB::transaction(function () use ($request, $taxClass) {
            $taxClass->update($request->validated());
            
            // If this is set as default, update other records
            if ($taxClass->is_default) {
                TaxClass::where('id', '!=', $taxClass->id)
                    ->update(['is_default' => false]);
            }
            
            return response()->json([
                'data' => new TaxClassResource($taxClass->refresh()),
                'message' => 'Tax class updated successfully.'
            ]);
        });
    }

    /**
     * Remove the specified tax class from storage.
     */
    public function destroy(TaxClass $taxClass): JsonResponse
    {
        $this->authorize('delete', $taxClass);
        
        // Prevent deletion of default tax class
        if ($taxClass->is_default) {
            return response()->json([
                'message' => 'Cannot delete the default tax class.'
            ], 422);
        }
        
        // Check if there are any associated tax rates
        if ($taxClass->taxRates()->exists()) {
            return response()->json([
                'message' => 'Cannot delete tax class with associated tax rates.'
            ], 422);
        }
        
        $taxClass->delete();
        
        return response()->json([
            'message' => 'Tax class deleted successfully.'
        ]);
    }
    
    /**
     * Set the specified tax class as default.
     */
    /**
     * Set the specified tax class as default.
     */
    public function setAsDefault(TaxClass $taxClass): JsonResponse
    {
        $this->authorize('update', $taxClass);
        
        // Start transaction to ensure data consistency
        return DB::transaction(function () use ($taxClass) {
            // First, set all other tax classes to not default
            TaxClass::where('id', '!=', $taxClass->id)
                ->update(['is_default' => false]);
                
            // Then update the selected tax class
            $taxClass->update(['is_default' => true]);
            
            return response()->json([
                'data' => new TaxClassResource($taxClass->refresh()),
                'message' => 'Tax class set as default successfully.'
            ]);
        });
    }
}
