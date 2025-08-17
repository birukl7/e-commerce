<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SiteConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
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

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'type' => 'string'
                ]
            );
        }
    }

    private function getDefaultPrivacyPolicy()
    {
        return '<h2>Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include:</p>
<ul>
<li>Name, email address, and phone number</li>
<li>Billing and shipping addresses</li>
<li>Payment information (processed securely through our payment partners)</li>
<li>Order history and preferences</li>
<li>Communications with our customer service team</li>
</ul>

<h2>How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Process your orders and payments</li>
<li>Communicate with you about your orders and account</li>
<li>Send you marketing communications (with your consent)</li>
<li>Improve our services and develop new features</li>
<li>Protect against fraud and ensure security</li>
<li>Comply with legal obligations</li>
</ul>

<h2>Information Sharing</h2>
<p>We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:</p>
<ul>
<li>With your explicit consent</li>
<li>To process payments (payment processors)</li>
<li>To fulfill orders (shipping partners)</li>
<li>To comply with legal requirements</li>
<li>To protect our rights and safety</li>
</ul>

<h2>Data Security</h2>
<p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>

<h2>Contact Us</h2>
<p>If you have any questions about this privacy policy or our data practices, please contact us at:</p>
<blockquote>
<p><strong>ShopHub Ethiopia</strong><br>
Email: privacy@shophub.et<br>
Phone: +251 911 123 456<br>
Address: Addis Ababa, Ethiopia<br>
Data Protection Officer: dpo@shophub.et</p>
</blockquote>';
    }

    private function getDefaultTermsConditions()
    {
        return '<h2>Acceptance of Terms</h2>
<p>By accessing and using ShopHub Ethiopia ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement.</p>

<h2>Description of Service</h2>
<p>ShopHub is an Ethiopian e-commerce platform that connects buyers with sellers of traditional Ethiopian crafts, modern products, and authentic Ethiopian goods including coffee, textiles, and artwork.</p>

<h2>User Accounts</h2>
<p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>

<h2>Product Information</h2>
<p>While we strive to provide accurate product information, we do not warrant that product descriptions, prices, or other content is accurate, complete, reliable, current, or error-free.</p>

<h2>Pricing and Payment</h2>
<p>All prices are in Ethiopian Birr (ETB) unless otherwise stated. Payment must be made at the time of purchase. We reserve the right to modify prices at any time.</p>

<h2>Shipping and Delivery</h2>
<p>Delivery times may vary depending on your location and the type of product. We will provide estimated delivery times at checkout.</p>

<h2>Returns and Refunds</h2>
<p>Returns are accepted within 14 days of delivery for most items. Some products may have different return policies as specified in the product description.</p>

<h2>Contact Information</h2>
<p>If you have any questions about these Terms and Conditions, please contact us at:</p>
<blockquote>
<p><strong>ShopHub Ethiopia</strong><br>
Email: support@shophub.et<br>
Phone: +251 911 123 456<br>
Address: Addis Ababa, Ethiopia</p>
</blockquote>';
    }
}
