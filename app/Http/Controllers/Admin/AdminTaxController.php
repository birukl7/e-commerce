<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TaxSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Services\TaxService;

class AdminTaxController extends TaxSettingController
{
    protected $taxService;

    public function __construct(TaxService $taxService)
    {
        $this->taxService = $taxService;
        parent::__construct();
    }

    /**
     * Display the tax management dashboard with tabs
     */
    public function dashboard()
    {
        $this->authorize('viewAny', TaxSetting::class);
        
        $taxRates = TaxSetting::all();
        $taxClasses = []; // To be implemented with tax classes
        $taxRules = []; // To be implemented with tax rules
        
        return Inertia::render('admin/Tax/Index', [
            'activeTab' => request()->get('tab', 'rates'),
            'tabs' => [
                'rates' => 'Tax Rates',
                'classes' => 'Tax Classes',
                'rules' => 'Tax Rules',
            ],
            'taxRates' => $taxRates,
            'taxClasses' => $taxClasses,
            'taxRules' => $taxRules,
        ]);
    }

    /**
     * Store a new tax rate
     */
    public function storeRate(Request $request)
    {
        $this->authorize('create', TaxSetting::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'rate' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'country' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
        ]);

        $taxSetting = TaxSetting::create($validated);

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'message' => 'Tax rate created successfully',
                'data' => $taxSetting
            ]);
        }

        return back()->with('success', 'Tax rate created successfully');
    }

    /**
     * Get tax calculation preview
     */
    public function calculatePreview(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'include_tax' => 'boolean',
        ]);

        $result = $this->taxService->calculateTaxes(
            $validated['amount'],
            $validated['include_tax'] ?? false
        );

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }
}
