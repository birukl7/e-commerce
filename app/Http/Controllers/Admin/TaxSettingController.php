<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TaxSettingRequest;
use App\Http\Resources\TaxSettingResource;
use App\Http\Resources\TaxSettingCollection;
use App\Models\TaxSetting;
use App\Models\TaxClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaxSettingController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the tax settings.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', TaxSetting::class);
        
        // For API requests, return JSON response
        if ($request->wantsJson() || $request->is('api/*')) {
            $perPage = $request->input('per_page', 15);
            $query = TaxSetting::with('taxClass')
                ->when($request->has('search'), function($query) use ($request) {
                    $search = $request->input('search');
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('country', 'like', "%{$search}%");
                })
                ->when($request->has('is_active'), function($query) use ($request) {
                    $query->where('is_active', $request->boolean('is_active'));
                })
                ->when($request->has('tax_class_id'), function($query) use ($request) {
                    $query->where('tax_class_id', $request->input('tax_class_id'));
                })
                ->orderBy('priority', 'asc')
                ->orderBy('created_at', 'desc');
            
            return new TaxSettingCollection($query->paginate($perPage));
        }
        
        // For web requests, return Inertia response
        $taxSettings = TaxSetting::with('taxClass')->get();
        $taxClasses = TaxClass::active()->get();
        
        return Inertia::render('admin/tax/settings/Index', [
            'taxSettings' => $taxSettings,
            'taxClasses' => $taxClasses,
        ]);
    }

    /**
     * Store a newly created tax setting in storage.
     */
    public function store(TaxSettingRequest $request): JsonResponse
    {
        // Start transaction to ensure data consistency
        return DB::transaction(function () use ($request) {
            $validated = $request->validated();
            
            // Set default priority if not provided
            if (!isset($validated['priority'])) {
                $maxPriority = TaxSetting::max('priority') ?? 0;
                $validated['priority'] = $maxPriority + 1;
            }
            
            $taxSetting = TaxSetting::create($validated);
            
            return (new TaxSettingResource($taxSetting->load('taxClass')))
                ->response()
                ->setStatusCode(201);
        });
    }

    /**
     * Display the specified tax setting.
     */
    public function show(TaxSetting $taxSetting): JsonResponse
    {
        $this->authorize('view', $taxSetting);
        
        return response()->json([
            'data' => new TaxSettingResource($taxSetting->load('taxClass')),
            'message' => 'Tax setting retrieved successfully.'
        ]);
    }

    /**
     * Update the specified tax setting in storage.
     */
    public function update(TaxSettingRequest $request, TaxSetting $taxSetting): JsonResponse
    {
        // Start transaction to ensure data consistency
        return DB::transaction(function () use ($request, $taxSetting) {
            $validated = $request->validated();
            
            // If changing the tax class, ensure the new tax class exists
            if (isset($validated['tax_class_id'])) {
                $taxClass = TaxClass::findOrFail($validated['tax_class_id']);
            }
            
            $taxSetting->update($validated);
            
            return response()->json([
                'data' => new TaxSettingResource($taxSetting->load('taxClass')),
                'message' => 'Tax setting updated successfully.'
            ]);
        });
    }

    /**
     * Remove the specified tax setting from storage.
     */
    public function destroy(TaxSetting $taxSetting): JsonResponse
    {
        $this->authorize('delete', $taxSetting);
        
        // Check if there are any products using this tax setting
        if ($taxSetting->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete tax setting because it is in use by one or more products.'
            ], 422);
        }
        
        $taxSetting->delete();
        
        return response()->json([
            'message' => 'Tax setting deleted successfully.'
        ]);
    }
    
    /**
     * Toggle the active status of the specified tax setting.
     */
    public function toggleStatus(TaxSetting $taxSetting): JsonResponse
    {
        $this->authorize('update', $taxSetting);
        
        $taxSetting->update([
            'is_active' => !$taxSetting->is_active
        ]);
        
        return response()->json([
            'data' => new TaxSettingResource($taxSetting->load('taxClass')),
            'message' => 'Tax setting status updated successfully.'
        ]);
    }
    
    /**
     * Reorder tax settings by priority.
     */
    public function reorder(Request $request): JsonResponse
    {
        $this->authorize('update', TaxSetting::class);
        
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tax_settings,id'
        ]);
        
        foreach ($request->ids as $index => $id) {
            TaxSetting::where('id', $id)->update(['priority' => $index + 1]);
        }
        
        return response()->json([
            'message' => 'Tax settings reordered successfully.'
        ]);
    }

    /**
     * Get all active tax settings for use in the frontend.
     */
    public function getActiveTaxes(): JsonResponse
    {
        $taxes = TaxSetting::with('taxClass')
            ->where('is_active', true)
            ->orderBy('priority', 'asc')
            ->get();
            
        return response()->json([
            'data' => TaxSettingResource::collection($taxes),
            'message' => 'Active tax settings retrieved successfully.'
        ]);
    }
}