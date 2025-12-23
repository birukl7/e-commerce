<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SiteConfigService;
use App\Models\TaxClass;
use App\Models\TaxSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Services\TaxService;
use Illuminate\Support\Facades\Log;

class TaxSettingsController extends Controller
{
    protected $siteConfig;
    protected $taxService;

    public function __construct(SiteConfigService $siteConfig, TaxService $taxService)
    {
        $this->siteConfig = $siteConfig;
        $this->taxService = $taxService;
        
        // Apply middleware for authorization
        $this->middleware('can:viewAny,TaxSetting')->only(['index', 'getActiveTaxes']);
        $this->middleware('can:create,TaxSetting')->only(['storeRate']);
        $this->middleware('can:update,taxSetting')->only(['updateRate', 'toggleStatus']);
        $this->middleware('can:delete,taxSetting')->only(['destroyRate']);
        $this->middleware('can:create,TaxClass')->only(['storeClass']);
        $this->middleware('can:update,taxClass')->only(['updateClass', 'setAsDefault']);
        $this->middleware('can:delete,taxClass')->only(['destroyClass']);
    }
    /**
     * Display the tax settings dashboard with tabs
     */
    /**
     * Display the tax settings dashboard with tabs
     */
    /**
     * Display the tax settings dashboard with tabs
     * 
     * @param string|null $tab The active tab (classes, rates, settings)
     * @return \Inertia\Response
     */
    public function index($tab = 'classes')
    {
        // Trace admin access to tax settings for debugging 403s
        if (auth()->check()) {
            $user = auth()->user();
            Log::info('Tax settings index accessed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->toArray(),
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                'tab' => $tab,
            ]);
        } else {
            Log::warning('Tax settings index hit without auth', [
                'tab' => $tab,
            ]);
        }

        // If tab is not one of the allowed values, default to 'classes'
        if (!in_array($tab, ['classes', 'rates', 'settings'])) {
            return redirect()->route('admin.tax.settings.tab', 'classes');
        }
        
        $data = [
            'activeTab' => $tab,
            'tabs' => [
                'classes' => [
                    'label' => 'Tax Classes',
                    'route' => route('admin.tax.settings.tab', 'classes')
                ],
                'rates' => [
                    'label' => 'Tax Rates',
                    'route' => route('admin.tax.settings.tab', 'rates')
                ],
                'settings' => [
                    'label' => 'Configuration',
                    'route' => route('admin.tax.settings.tab', 'settings')
                ]
            ]
        ];

        // Load data for the active tab
        switch ($tab) {
            case 'classes':
                $data['classes'] = TaxClass::withCount('taxSettings')
                    ->orderBy('is_default', 'desc')
                    ->orderBy('name')
                    ->get();
                break;
                
            case 'rates':
                $data['taxRates'] = TaxSetting::with('taxClass')
                    ->orderBy('country')
                    ->orderBy('state')
                    ->orderBy('priority')
                    ->get();
                $data['taxClasses'] = TaxClass::orderBy('name')->get();
                $data['countries'] = config('countries');
                break;
                
            case 'settings':
                $data['settings'] = [
                    'pricesIncludeTax' => $this->siteConfig->get('tax.prices_include_tax', false),
                    'shippingTaxClass' => $this->siteConfig->get('tax.shipping_tax_class'),
                    'displayPricesInShop' => $this->siteConfig->get('tax.display_prices_in_shop', 'incl'),
                    'displayPricesInCart' => $this->siteConfig->get('tax.display_prices_in_cart', 'incl'),
                    'taxBasedOn' => $this->siteConfig->get('tax.tax_based_on', 'shipping'),
                    'shippingTaxStatus' => $this->siteConfig->get('tax.shipping_tax_status', 'taxable'),
                ];
                $data['taxClasses'] = TaxClass::orderBy('name')->get();
                break;
        }

        return Inertia::render('admin/Tax/settings', $data);
    }

    /**
     * Store a newly created tax class
     */
    /**
     * Store a newly created tax class
     */
    public function storeClass(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tax_classes,name',
            'description' => 'nullable|string',
            'is_default' => 'sometimes|boolean',
        ]);

        // If this is set as default, unset any existing default
        if (isset($validated['is_default']) && $validated['is_default']) {
            TaxClass::where('is_default', true)->update(['is_default' => false]);
        } else {
            $validated['is_default'] = false;
        }

        $taxClass = TaxClass::create($validated);

        return redirect()->route('admin.tax.settings.tab', 'classes')
            ->with('success', 'Tax class created successfully.');
    }

    /**
     * Update the specified tax class
     */
    /**
     * Update the specified tax class
     */
    public function updateClass(Request $request, TaxClass $taxClass)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tax_classes,name,' . $taxClass->id,
            'description' => 'nullable|string',
            'is_default' => 'sometimes|boolean',
        ]);

        // If this is set as default, unset any existing default
        if (isset($validated['is_default']) && $validated['is_default'] && !$taxClass->is_default) {
            TaxClass::where('is_default', true)->update(['is_default' => false]);
        } elseif (!isset($validated['is_default'])) {
            $validated['is_default'] = $taxClass->is_default;
        }

        $taxClass->update($validated);

        return redirect()->route('admin.tax.settings.tab', 'classes')
            ->with('success', 'Tax class updated successfully.');
    }

    /**
     * Remove the specified tax class
     */
    public function destroyClass(TaxClass $taxClass)
    {
        if ($taxClass->is_default) {
            return redirect()->back()
                ->with('error', 'Cannot delete the default tax class.');
        }

        if ($taxClass->taxSettings()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete tax class with associated tax rates.');
        }

        $taxClass->delete();

        return redirect()->route('admin.tax.settings.tab', 'classes')
            ->with('success', 'Tax class deleted successfully.');
    }
    
    /**
     * Set a tax class as the default
     */
    public function setAsDefault(TaxClass $taxClass)
    {
        // Unset current default
        TaxClass::where('is_default', true)->update(['is_default' => false]);
        
        // Set new default
        $taxClass->update(['is_default' => true]);
        
        return response()->json([
            'success' => true,
            'message' => 'Default tax class updated successfully.'
        ]);
    }

    /**
     * Store a new tax rate
     */
    public function storeRate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tax_class_id' => 'required|exists:tax_classes,id',
            'rate' => 'required|numeric|min:0|max:100',
            'type' => 'required|in:percentage,fixed',
            'country' => 'required|string|size:2',
            'state' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'priority' => 'integer|min:0',
            'compound' => 'boolean',
            'shipping_taxable' => 'boolean',
            'is_active' => 'boolean',
        ]);

        TaxSetting::create($validated);

        return redirect()->route('admin.tax.settings.tab', 'rates')
            ->with('success', 'Tax rate created successfully.');
    }

    /**
     * Update the specified tax rate
     */
    /**
     * Toggle the active status of a tax rate
     */
    public function toggleStatus(TaxSetting $taxSetting)
    {
        $taxSetting->update(['is_active' => !$taxSetting->is_active]);
        
        return response()->json([
            'success' => true,
            'message' => 'Tax rate status updated successfully.',
            'is_active' => $taxSetting->fresh()->is_active
        ]);
    }
    
    /**
     * Update the specified tax rate
     */
    public function updateRate(Request $request, TaxSetting $taxSetting)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tax_class_id' => 'required|exists:tax_classes,id',
            'rate' => 'required|numeric|min:0|max:100',
            'type' => 'required|in:percentage,fixed',
            'country' => 'required|string|size:2',
            'state' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'priority' => 'integer|min:0',
            'compound' => 'boolean',
            'shipping_taxable' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $taxSetting->update($validated);

        return redirect()->route('admin.tax.settings.tab', 'rates')
            ->with('success', 'Tax rate updated successfully.');
    }

    /**
     * Remove the specified tax rate
     */
    public function destroyRate(TaxSetting $taxSetting)
    {
        $taxSetting->delete();

        return redirect()->route('admin.tax.settings.tab', 'rates')
            ->with('success', 'Tax rate deleted successfully.');
    }

    /**
     * Update tax settings
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'prices_include_tax' => 'required|boolean',
            'shipping_tax_class' => 'nullable|exists:tax_classes,id',
            'display_prices_in_shop' => 'required|in:incl,excl',
            'display_prices_in_cart' => 'required|in:incl,excl',
            'tax_based_on' => 'required|in:shipping,billing,base',
            'shipping_tax_status' => 'required|in:taxable,none',
        ]);

        // Save settings using the SiteConfigService
        foreach ($validated as $key => $value) {
            $this->siteConfig->set("tax.{$key}", $value);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tax settings updated successfully.'
        ]);
    }
    
    /**
     * Get active taxes for the given location
     */
    public function getActiveTaxes(Request $request)
    {
        $validated = $request->validate([
            'country' => 'required|string|size:2',
            'state' => 'nullable|string',
            'city' => 'nullable|string',
            'postal_code' => 'nullable|string',
        ]);
        
        $taxes = $this->taxService->getTaxRatesForLocation($validated);
        
        return response()->json([
            'success' => true,
            'data' => $taxes
        ]);
    }
    
    /**
     * Calculate tax preview
     */
    public function calculatePreview(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'include_tax' => 'boolean',
            'tax_class_id' => 'nullable|exists:tax_classes,id',
            'country' => 'required_without:tax_rates|string|size:2',
            'state' => 'nullable|string',
            'city' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'tax_rates' => 'nullable|array',
            'tax_rates.*.id' => 'required|exists:tax_settings,id',
            'tax_rates.*.rate' => 'required|numeric|min:0',
            'tax_rates.*.type' => 'required|in:percentage,fixed',
            'tax_rates.*.compound' => 'boolean',
        ]);
        
        $amount = (float) $validated['amount'];
        $includeTax = $validated['include_tax'] ?? false;
        
        $taxRates = $validated['tax_rates'] ?? null;
        
        if (!$taxRates) {
            // If no specific rates provided, calculate based on location
            $location = [
                'country' => $validated['country'],
                'state' => $validated['state'] ?? null,
                'city' => $validated['city'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
            ];
            
            $taxClassId = $validated['tax_class_id'] ?? null;
            $taxRates = $this->taxService->getTaxRatesForLocation($location, $taxClassId);
        }
        
        // Calculate taxes
        $result = $this->taxService->calculateTaxes($amount, $taxRates, $includeTax);
        
        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

}
