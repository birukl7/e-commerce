<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\OfflinePaymentMethod;
use App\Models\ChapaPaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use App\Services\SiteConfigService; 

class AdminSiteConfigController extends Controller
{
    private SiteConfigService $siteConfig;

    public function __construct(SiteConfigService $siteConfig)
    {
        $this->siteConfig = $siteConfig;
    }

    /**
     * Display site configuration settings.
     */
    public function index()
    {
        $settings = Setting::pluck('value', 'key')->toArray();
        
        // Ensure all required settings exist with defaults
        $defaultSettings = [
            // Homepage Banner Settings
            'banner_main_title' => 'Back to school',
            'banner_main_subtitle' => 'For the first day and beyond',
            'banner_main_button_text' => 'Shop school supplies',
            'banner_main_button_link' => '/categories/school-supplies',
            'banner_main_image' => 'image/image-3.jpg',
            'banner_secondary_title' => 'Teacher Appreciation Gifts',
            'banner_secondary_button_text' => 'Shop now',
            'banner_secondary_button_link' => '/categories/gifts',
            'banner_secondary_image' => 'image/image-4.jpg',
            
            // About Section Settings
            'about_title' => 'What is Serdo?',
            'about_subtitle' => 'Discover our Ethiopian heritage story',
            'about_column1_title' => 'Celebrating Ethiopian Heritage',
            'about_column1_text' => 'Serdo is Ethiopia\'s premier marketplace, connecting artisans and modern creators with customers worldwide. We showcase the rich cultural heritage of Ethiopia through traditional crafts like Jebena coffee pots, handwoven textiles, and contemporary Ethiopian art, while also offering modern products for today\'s lifestyle.',
            'about_column2_title' => 'Supporting Local Artisans',
            'about_column2_text' => 'From the highlands of Ethiopia to your home, we bring you authentic Ethiopian craftsmanship. Our platform empowers local artisans, coffee farmers, and modern entrepreneurs to reach global markets while preserving traditional techniques and promoting sustainable practices.',
            'about_column3_title' => 'Quality & Authenticity',
            'about_column3_text' => 'Every product on Serdo is carefully curated to ensure authenticity and quality. Whether you\'re looking for traditional Ethiopian coffee ceremonies, contemporary Ethiopian fashion, or modern tech products, we guarantee genuine craftsmanship and exceptional service.',
            
            // Privacy Policy
            'privacy_policy_content' => $this->getDefaultPrivacyPolicy(),
            
            // Payment Settings
            'manual_payment_enabled' => true,
            'require_admin_approval' => true,
            'auto_approve_gateway_payments' => false,
            'tax_rate' => 0.15,
        ];
        
        $settings = array_merge($defaultSettings, $settings);
        
        // Load offline payment methods
        $offlinePaymentMethods = OfflinePaymentMethod::orderBy('sort_order')->get();
        
        // Load Chapa payment methods
        $chapaPaymentMethods = ChapaPaymentMethod::ordered()->get();

        return Inertia::render('admin/site-config/index', [
            'settings' => $settings,
            'offlinePaymentMethods' => $offlinePaymentMethods,
            'chapaPaymentMethods' => $chapaPaymentMethods,
        ]);
    }

    /**
     * Update site configuration settings.
     */
    public function update(Request $request)
    {
        // Get existing settings to check if images exist
        $existingBannerMainImage = $this->siteConfig->get('site.banner_main_image');
        $existingBannerSecondaryImage = $this->siteConfig->get('site.banner_secondary_image');
        
        // Handle file uploads first if they exist
        $bannerMainImagePath = null;
        $bannerSecondaryImagePath = null;
        
        if ($request->hasFile('banner_main_image')) {
            $bannerMainImagePath = $request->file('banner_main_image')->store('images', 'public');
        }
        
        if ($request->hasFile('banner_secondary_image')) {
            $bannerSecondaryImagePath = $request->file('banner_secondary_image')->store('images', 'public');
        }
        
        // Build validation rules - only validate as string if no file was uploaded
        $validationRules = [
            // Homepage Banner
            'banner_main_title' => 'required|string|max:255',
            'banner_main_subtitle' => 'required|string|max:255',
            'banner_main_button_text' => 'required|string|max:100',
            'banner_main_button_link' => 'required|string|max:255',
            'banner_secondary_title' => 'required|string|max:255',
            'banner_secondary_button_text' => 'required|string|max:100',
            'banner_secondary_button_link' => 'required|string|max:255',
        ];
        
        // Only validate image fields as strings if no file was uploaded
        if (!$request->hasFile('banner_main_image')) {
            $validationRules['banner_main_image'] = $existingBannerMainImage 
                ? 'nullable|string|max:255' 
                : 'required|string|max:255';
        }
        
        if (!$request->hasFile('banner_secondary_image')) {
            $validationRules['banner_secondary_image'] = $existingBannerSecondaryImage 
                ? 'nullable|string|max:255' 
                : 'required|string|max:255';
        }
        
        $validationRules = array_merge($validationRules, [
            // About Section
            'about_title' => 'required|string|max:255',
            'about_subtitle' => 'required|string|max:255',
            'about_column1_title' => 'required|string|max:255',
            'about_column1_text' => 'required|string|max:2000',
            'about_column2_title' => 'required|string|max:255',
            'about_column2_text' => 'required|string|max:2000',
            'about_column3_title' => 'required|string|max:255',
            'about_column3_text' => 'required|string|max:2000',
            
            // Privacy Policy
            'privacy_policy_content' => 'required|string',
            
            // Payment Settings
            'manual_payment_enabled' => 'boolean',
            'require_admin_approval' => 'boolean',
            'auto_approve_gateway_payments' => 'boolean',
            'tax_rate' => 'numeric|min:0|max:1',
        ]);
        
        $validated = $request->validate($validationRules);

        // Save each setting
        foreach ($validated as $key => $value) {
            $settingKey = "site.{$key}";
            
            // Handle image fields specially
            if ($key === 'banner_main_image') {
                if ($bannerMainImagePath) {
                    // New file was uploaded
                    $this->siteConfig->set($settingKey, $bannerMainImagePath, 'string', 'system');
                } elseif ($value === '' || $value === null) {
                    // Image was removed
                    $this->siteConfig->set($settingKey, '', 'string', 'system');
                } elseif (is_string($value) && $value !== '') {
                    // Existing image path was sent (no change)
                    $this->siteConfig->set($settingKey, $value, 'string', 'system');
                }
                continue;
            }
            
            if ($key === 'banner_secondary_image') {
                if ($bannerSecondaryImagePath) {
                    // New file was uploaded
                    $this->siteConfig->set($settingKey, $bannerSecondaryImagePath, 'string', 'system');
                } elseif ($value === '' || $value === null) {
                    // Image was removed
                    $this->siteConfig->set($settingKey, '', 'string', 'system');
                } elseif (is_string($value) && $value !== '') {
                    // Existing image path was sent (no change)
                    $this->siteConfig->set($settingKey, $value, 'string', 'system');
                }
                continue;
            }
            
            // Determine the type based on the key for other fields
            $type = match($key) {
                'payment_methods', 'admin_menu_groups' => 'json',
                'manual_payment_enabled', 'require_admin_approval', 'auto_approve_gateway_payments' => 'boolean',
                'tax_rate' => 'decimal',
                default => 'string'
            };
            
            $this->siteConfig->set($settingKey, $value, $type, 'system');
        }

        return redirect('/site-config')->with('success', 'Settings updated successfully');
    }

    public function storeOfflinePaymentMethod(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:bank,mobile',
            'description' => 'required|string|max:500',
            'instructions' => 'required|string|max:2000',
            'details' => 'required|array',
        ]);

        $sortOrder = OfflinePaymentMethod::max('sort_order') + 1;

        OfflinePaymentMethod::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'description' => $validated['description'],
            'instructions' => $validated['instructions'],
            'details' => $validated['details'],
            'is_active' => true,
            'sort_order' => $sortOrder,
        ]);

        return redirect()->route('admin.site-config.index')->with('success', 'Payment method created successfully');
    }

    public function updateOfflinePaymentMethod(Request $request, OfflinePaymentMethod $offlinePaymentMethod)
    {
        $validated = $request->validate([
            'is_active' => 'sometimes|boolean',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:500',
            'instructions' => 'sometimes|string|max:2000',
            'details' => 'sometimes|array',
        ]);

        $offlinePaymentMethod->update($validated);

        return redirect()->route('admin.site-config.index')->with('success', 'Payment method updated successfully');
    }

    /**
     * Store a new Chapa payment method.
     */
    public function storeChapaPaymentMethod(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:chapa_payment_methods,code',
            'description' => 'nullable|string|max:500',
            'logo' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        ChapaPaymentMethod::create($validated);
        $this->siteConfig->clearChapaPaymentMethodsCache();

        return redirect()->route('admin.site-config.index')->with('success', 'Chapa payment method created successfully');
    }

    /**
     * Update an existing Chapa payment method.
     */
    public function updateChapaPaymentMethod(Request $request, ChapaPaymentMethod $chapaPaymentMethod)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:255|unique:chapa_payment_methods,code,' . $chapaPaymentMethod->id,
            'description' => 'nullable|string|max:500',
            'logo' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        $chapaPaymentMethod->update($validated);
        $this->siteConfig->clearChapaPaymentMethodsCache();

        return redirect()->route('admin.site-config.index')->with('success', 'Chapa payment method updated successfully');
    }

    /**
     * Delete a Chapa payment method.
     */
    public function destroyChapaPaymentMethod(ChapaPaymentMethod $chapaPaymentMethod)
    {
        $chapaPaymentMethod->delete();
        $this->siteConfig->clearChapaPaymentMethodsCache();

        return redirect()->route('admin.site-config.index')->with('success', 'Chapa payment method deleted successfully');
    }

    /**
     * Get a specific setting value.
     */
    public static function getSetting($key, $default = null)
    {
        $setting = Setting::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Get all settings for public pages.
     */
    public static function getAllSettings()
    {
        $settings = Setting::pluck('value', 'key')->toArray();
        
        // Ensure all required settings exist with defaults
        $defaultSettings = [
            // Homepage Banner Settings
            'banner_main_title' => 'Back to school',
            'banner_main_subtitle' => 'For the first day and beyond',
            'banner_main_button_text' => 'Shop school supplies',
            'banner_main_button_link' => '/categories/school-supplies',
            'banner_main_image' => 'image/image-3.jpg',
            'banner_secondary_title' => 'Teacher Appreciation Gifts',
            'banner_secondary_button_text' => 'Shop now',
            'banner_secondary_button_link' => '/categories/gifts',
            'banner_secondary_image' => 'image/image-4.jpg',
            
            // About Section Settings
            'about_title' => 'What is Serdo?',
            'about_subtitle' => 'Discover our Ethiopian heritage story',
            'about_column1_title' => 'Celebrating Ethiopian Heritage',
            'about_column1_text' => 'Serdo is Ethiopia\'s premier marketplace, connecting artisans and modern creators with customers worldwide. We showcase the rich cultural heritage of Ethiopia through traditional crafts like Jebena coffee pots, handwoven textiles, and contemporary Ethiopian art, while also offering modern products for today\'s lifestyle.',
            'about_column2_title' => 'Supporting Local Artisans',
            'about_column2_text' => 'From the highlands of Ethiopia to your home, we bring you authentic Ethiopian craftsmanship. Our platform empowers local artisans, coffee farmers, and modern entrepreneurs to reach global markets while preserving traditional techniques and promoting sustainable practices.',
            'about_column3_title' => 'Quality & Authenticity',
            'about_column3_text' => 'Every product on Serdo is carefully curated to ensure authenticity and quality. Whether you\'re looking for traditional Ethiopian coffee ceremonies, contemporary Ethiopian fashion, or modern tech products, we guarantee genuine craftsmanship and exceptional service.',
            
            // Privacy Policy
            'privacy_policy_content' => (new self(app(SiteConfigService::class)))->getDefaultPrivacyPolicy(),
            
            // Payment Settings
            'manual_payment_enabled' => true,
            'require_admin_approval' => true,
            'auto_approve_gateway_payments' => false,
            'tax_rate' => 0.15,
        ];
        
        return array_merge($defaultSettings, $settings);
    }

    private function getDefaultPrivacyPolicy(): string
    {
        return '# Privacy Policy

## Information We Collect

We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.

## How We Use Your Information

We use the information we collect to:
- Process your orders and payments
- Communicate with you about your account or orders
- Improve our services and customer experience
- Send you promotional materials (with your consent)

## Information Sharing

We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

## Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## Contact Us

If you have any questions about this Privacy Policy, please contact us at:

**Serdo Ethiopia**
Email: support@serdo.et
Phone: +251 911 123 456
Address: Addis Ababa, Ethiopia
';
    }
}
