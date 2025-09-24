<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SiteConfigService;
use App\Models\TaxClass;
use App\Models\TaxSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TaxSettingsController extends Controller
{
    protected $siteConfig;

    public function __construct(SiteConfigService $siteConfig)
    {
        $this->siteConfig = $siteConfig;
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

        return Inertia::render('admin/tax/settings', $data);
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
            'pricesIncludeTax' => 'required|boolean',
            'shippingTaxClass' => 'nullable|exists:tax_classes,id',
            'displayPricesInShop' => 'required|in:incl,excl',
            'displayPricesInCart' => 'required|in:incl,excl',
        ]);

        // Save settings using the SiteConfigService
        $this->siteConfig->set('tax.prices_include_tax', $validated['pricesIncludeTax']);
        $this->siteConfig->set('tax.shipping_tax_class', $validated['shippingTaxClass']);
        $this->siteConfig->set('tax.display_prices_in_shop', $validated['displayPricesInShop']);
        $this->siteConfig->set('tax.display_prices_in_cart', $validated['displayPricesInCart']);

        return redirect()->route('admin.tax.settings.tab', 'settings')
            ->with('success', 'Tax settings updated successfully.');
    }

    /**
     * Toggle tax rate status
     */
    public function toggleStatus(TaxSetting $taxSetting)
    {
        $taxSetting->update([
            'is_active' => !$taxSetting->is_active
        ]);

        return response()->json([
            'success' => true,
            'is_active' => $taxSetting->is_active
        ]);
    }
}
