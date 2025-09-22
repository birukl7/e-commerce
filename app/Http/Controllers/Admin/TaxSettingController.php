<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TaxSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaxSettingController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the tax settings.
     */
    public function index()
    {
        $this->authorize('viewAny', TaxSetting::class);
        
        $taxSettings = TaxSetting::all();
        
        return Inertia::render('admin/tax-settings', [
            'taxSettings' => $taxSettings,
        ]);
    }

    /**
     * Update the specified tax setting.
     */
    public function update(Request $request, TaxSetting $taxSetting)
    {
        $this->authorize('update', $taxSetting);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:percentage,fixed',
            'rate' => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $taxSetting->update($validated);

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'message' => 'Tax setting updated successfully',
                'data' => $taxSetting
            ]);
        }

        return back()->with([
            'success' => true,
            'message' => 'Tax setting updated successfully',
            'data' => $taxSetting
        ]);
    }

    /**
     * Toggle the active status of a tax setting.
     */
    public function toggleStatus(Request $request, TaxSetting $taxSetting)
    {
        $this->authorize('update', $taxSetting);

        $taxSetting->update([
            'is_active' => !$taxSetting->is_active
        ]);

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'message' => 'Tax setting status updated successfully',
                'data' => $taxSetting
            ]);
        }

        return back()->with([
            'success' => true,
            'message' => 'Tax setting status updated successfully',
            'data' => $taxSetting
        ]);
    }

    /**
     * Get all active tax settings for use in the frontend.
     */
    public function getActiveTaxes()
    {
        $taxes = TaxSetting::where('is_active', true)->get();
        return response()->json($taxes);
    }
}