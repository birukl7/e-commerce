<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\OfflinePaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AdminSiteConfigController extends Controller
{
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
            'about_title' => 'What is ShopHub?',
            'about_subtitle' => 'Discover our Ethiopian heritage story',
            'about_column1_title' => 'Celebrating Ethiopian Heritage',
            'about_column1_text' => 'ShopHub is Ethiopia\'s premier marketplace, connecting artisans and modern creators with customers worldwide. We showcase the rich cultural heritage of Ethiopia through traditional crafts like Jebena coffee pots, handwoven textiles, and contemporary Ethiopian art, while also offering modern products for today\'s lifestyle.',
            'about_column2_title' => 'Supporting Local Artisans',
            'about_column2_text' => 'From the highlands of Ethiopia to your home, we bring you authentic Ethiopian craftsmanship. Our platform empowers local artisans, coffee farmers, and modern entrepreneurs to reach global markets while preserving traditional techniques and promoting sustainable practices.',
            'about_column3_title' => 'Quality & Authenticity',
            'about_column3_text' => 'Every product on ShopHub is carefully curated to ensure authenticity and quality. Whether you\'re looking for traditional Ethiopian coffee ceremonies, contemporary Ethiopian fashion, or modern tech products, we guarantee genuine craftsmanship and exceptional service.',
            'about_cta_text' => 'Questions about our products or Ethiopian culture?',
            'about_cta_button_text' => 'Contact Our Team',
            
            // Footer Settings
            'footer_brand_description' => 'Discover Ethiopian treasures and modern essentials',
            'footer_download_text' => 'Download ShopHub App',
            'footer_location_text' => 'Ethiopia',
            'footer_language_text' => 'Amharic / English',
            'footer_currency_text' => ' (ETB)',
            'footer_copyright_text' => '© 2025 ShopHub Ethiopia',
            
            // Legal Content
            'privacy_policy_content' => $this->getDefaultPrivacyPolicy(),
            'terms_conditions_content' => $this->getDefaultTermsConditions(),
        ];
        
        // Merge defaults with existing settings
        foreach ($defaultSettings as $key => $defaultValue) {
            if (!isset($settings[$key])) {
                $settings[$key] = $defaultValue;
            }
        }
        
        // Get offline payment methods
        $offlinePaymentMethods = OfflinePaymentMethod::ordered()->get();
        
        return Inertia::render('admin/site-config/index', [
            'settings' => $settings,
            'offlinePaymentMethods' => $offlinePaymentMethods
        ]);
    }

    /**
     * Update site configuration settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            // Homepage Banner
            'banner_main_title' => 'required|string|max:255',
            'banner_main_subtitle' => 'required|string|max:255',
            'banner_main_button_text' => 'required|string|max:100',
            'banner_main_button_link' => 'required|string|max:255',
            'banner_main_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'banner_secondary_title' => 'required|string|max:255',
            'banner_secondary_button_text' => 'required|string|max:100',
            'banner_secondary_button_link' => 'required|string|max:255',
            'banner_secondary_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            
            // About Section
            'about_title' => 'required|string|max:255',
            'about_subtitle' => 'required|string|max:255',
            'about_column1_title' => 'required|string|max:255',
            'about_column1_text' => 'required|string',
            'about_column2_title' => 'required|string|max:255',
            'about_column2_text' => 'required|string',
            'about_column3_title' => 'required|string|max:255',
            'about_column3_text' => 'required|string',
            'about_cta_text' => 'required|string|max:255',
            'about_cta_button_text' => 'required|string|max:100',
            
            // Footer
            'footer_brand_description' => 'required|string|max:255',
            'footer_download_text' => 'required|string|max:100',
            'footer_location_text' => 'required|string|max:100',
            'footer_language_text' => 'required|string|max:100',
            'footer_currency_text' => 'required|string|max:50',
            'footer_copyright_text' => 'required|string|max:255',
            
            // Legal Content
            'privacy_policy_content' => 'required|string',
            'terms_conditions_content' => 'required|string',
        ]);

        // Handle image uploads
        if ($request->hasFile('banner_main_image')) {
            $path = $request->file('banner_main_image')->store('banners', 'public');
            $validated['banner_main_image'] = 'storage/' . $path;
        } else {
            unset($validated['banner_main_image']);
        }

        if ($request->hasFile('banner_secondary_image')) {
            $path = $request->file('banner_secondary_image')->store('banners', 'public');
            $validated['banner_secondary_image'] = 'storage/' . $path;
        } else {
            unset($validated['banner_secondary_image']);
        }

        // Update or create settings
        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'type' => 'string'
                ]
            );
        }

        return redirect()->back()->with('success', 'Site configuration updated successfully!');
    }

    /**
     * Store a new offline payment method.
     */
    public function storeOfflinePaymentMethod(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:bank,mobile,cash',
            'description' => 'required|string',
            'instructions' => 'required|string',
            'details' => 'required|array',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('offline-payment-logos', 'public');
            $validated['logo'] = 'storage/' . $path;
        }

        OfflinePaymentMethod::create($validated);

        return redirect()->back()->with('success', 'Offline payment method created successfully!');
    }

    /**
     * Update an existing offline payment method.
     */
    public function updateOfflinePaymentMethod(Request $request, OfflinePaymentMethod $offlinePaymentMethod)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:bank,mobile,cash',
            'description' => 'required|string',
            'instructions' => 'required|string',
            'details' => 'required|array',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($offlinePaymentMethod->logo && Storage::disk('public')->exists(str_replace('storage/', '', $offlinePaymentMethod->logo))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $offlinePaymentMethod->logo));
            }
            
            $path = $request->file('logo')->store('offline-payment-logos', 'public');
            $validated['logo'] = 'storage/' . $path;
        }

        $offlinePaymentMethod->update($validated);

        return redirect()->back()->with('success', 'Offline payment method updated successfully!');
    }

    /**
     * Delete an offline payment method.
     */
    public function deleteOfflinePaymentMethod(OfflinePaymentMethod $offlinePaymentMethod)
    {
        // Delete logo if exists
        if ($offlinePaymentMethod->logo && Storage::disk('public')->exists(str_replace('storage/', '', $offlinePaymentMethod->logo))) {
            Storage::disk('public')->delete(str_replace('storage/', '', $offlinePaymentMethod->logo));
        }

        $offlinePaymentMethod->delete();

        return redirect()->back()->with('success', 'Offline payment method deleted successfully!');
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
     * Get all settings as an array.
     */
    public static function getAllSettings()
    {
        return Setting::pluck('value', 'key')->toArray();
    }

    private function getDefaultPrivacyPolicy()
    {
        return '
## Information We Collect

We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include:

- Name, email address, and phone number
- Billing and shipping addresses
- Payment information (processed securely through our payment partners)
- Order history and preferences
- Communications with our customer service team

## How We Use Your Information

We use the information we collect to:

- Process your orders and payments
- Communicate with you about your orders and account
- Send you marketing communications (with your consent)
- Improve our services and develop new features
- Protect against fraud and ensure security
- Comply with legal obligations

## Information Sharing

We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:

- With your explicit consent
- To process payments (payment processors)
- To fulfill orders (shipping partners)
- To comply with legal requirements
- To protect our rights and safety

## Data Security

We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.

## Contact Us

If you have any questions about this privacy policy or our data practices, please contact us at:

**ShopHub Ethiopia**
Email: privacy@shophub.et
Phone: +251 911 123 456
Address: Addis Ababa, Ethiopia
';
    }

    private function getDefaultTermsConditions()
    {
        return '
## Acceptance of Terms

By accessing and using ShopHub Ethiopia ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement.

## Description of Service

ShopHub is an Ethiopian e-commerce platform that connects buyers with sellers of traditional Ethiopian crafts, modern products, and authentic Ethiopian goods including coffee, textiles, and artwork.

## User Accounts

You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.

## Product Information

While we strive to provide accurate product information, we do not warrant that product descriptions, prices, or other content is accurate, complete, reliable, current, or error-free.

## Pricing and Payment

All prices are in Ethiopian Birr (ETB) unless otherwise stated. Payment must be made at the time of purchase. We reserve the right to modify prices at any time.

## Shipping and Delivery

Delivery times may vary depending on your location and the type of product. We will provide estimated delivery times at checkout.

## Returns and Refunds

Returns are accepted within 14 days of delivery for most items. Some products may have different return policies as specified in the product description.

## Contact Information

If you have any questions about these Terms and Conditions, please contact us at:

**ShopHub Ethiopia**
Email: support@shophub.et
Phone: +251 911 123 456
Address: Addis Ababa, Ethiopia
';
    }
}
