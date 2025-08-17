import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RichTextEditor from '@/components/ui/rich-text-editor';
import ImageUpload from '@/components/ui/image-upload';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { adminNavItems } from '../dashboard';
import { Settings, FileImage, FileText, Info, Palette, Globe } from 'lucide-react';

interface OfflinePaymentMethod {
    id: number;
    name: string;
    type: string;
    description: string;
    instructions: string;
    details: Record<string, any>;
    logo?: string;
    is_active: boolean;
    sort_order: number;
}

interface SiteConfigProps {
    settings: Record<string, string>;
    offlinePaymentMethods: OfflinePaymentMethod[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin-dashboard',
    },
    {
        title: 'Site Configuration',
        href: '/admin/site-config',
    },
];

export default function SiteConfig({ settings, offlinePaymentMethods }: SiteConfigProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        // Homepage Banner
        banner_main_title: settings.banner_main_title || '',
        banner_main_subtitle: settings.banner_main_subtitle || '',
        banner_main_button_text: settings.banner_main_button_text || '',
        banner_main_button_link: settings.banner_main_button_link || '',
        banner_main_image: null as File | null,
        banner_secondary_title: settings.banner_secondary_title || '',
        banner_secondary_button_text: settings.banner_secondary_button_text || '',
        banner_secondary_button_link: settings.banner_secondary_button_link || '',
        banner_secondary_image: null as File | null,
        
        // About Section
        about_title: settings.about_title || '',
        about_subtitle: settings.about_subtitle || '',
        about_column1_title: settings.about_column1_title || '',
        about_column1_text: settings.about_column1_text || '',
        about_column2_title: settings.about_column2_title || '',
        about_column2_text: settings.about_column2_text || '',
        about_column3_title: settings.about_column3_title || '',
        about_column3_text: settings.about_column3_text || '',
        about_cta_text: settings.about_cta_text || '',
        about_cta_button_text: settings.about_cta_button_text || '',
        
        // Footer
        footer_brand_description: settings.footer_brand_description || '',
        footer_download_text: settings.footer_download_text || '',
        footer_location_text: settings.footer_location_text || '',
        footer_language_text: settings.footer_language_text || '',
        footer_currency_text: settings.footer_currency_text || '',
        footer_copyright_text: settings.footer_copyright_text || '',
        
        // Legal Content
        privacy_policy_content: settings.privacy_policy_content || '',
        terms_conditions_content: settings.terms_conditions_content || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/site-config', {
            preserveScroll: true,
            onSuccess: () => {
                // Reset file inputs after successful upload
                setData(prev => ({
                    ...prev,
                    banner_main_image: null,
                    banner_secondary_image: null,
                }));
            },
        });
    };

    const handleFileChange = (field: 'banner_main_image' | 'banner_secondary_image', file: File | null) => {
        setData(field, file);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Site Configuration" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="flex w-full flex-col p-6 font-sans max-w-7xl mx-auto">
                    {/* Enhanced Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Settings className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    Site Configuration
                                </h1>
                                <p className="text-lg text-muted-foreground mt-1">
                                    Customize your website's content, appearance, and legal pages
                                </p>
                            </div>
                        </div>
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
                            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Globe className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Homepage</p>
                                        <p className="text-lg font-bold text-gray-900">2 Banners</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Info className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">About</p>
                                        <p className="text-lg font-bold text-gray-900">3 Sections</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Palette className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Footer</p>
                                        <p className="text-lg font-bold text-gray-900">6 Fields</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <FileImage className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Offline Pay</p>
                                        <p className="text-lg font-bold text-gray-900">{offlinePaymentMethods.length} Methods</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <FileText className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Legal</p>
                                        <p className="text-lg font-bold text-gray-900">2 Pages</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                            <Tabs defaultValue="homepage" className="w-full">
                                <div className="border-b border-gray-200/50 bg-white/30 px-6 py-4">
                                    <TabsList className="grid w-full grid-cols-5 bg-gray-100/50 p-1 rounded-xl">
                                        <TabsTrigger value="homepage" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all cursor-pointer">
                                            <Globe className="h-4 w-4" />
                                            <span className="hidden sm:inline">Homepage</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="about" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all cursor-pointer">
                                            <Info className="h-4 w-4" />
                                            <span className="hidden sm:inline">About</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="footer" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all cursor-pointer">
                                            <Palette className="h-4 w-4" />
                                            <span className="hidden sm:inline">Footer</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="offline-payments" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all cursor-pointer">
                                            <FileImage className="h-4 w-4" />
                                            <span className="hidden sm:inline">Offline Submit</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="legal" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all cursor-pointer">
                                            <FileText className="h-4 w-4" />
                                            <span className="hidden sm:inline">Legal</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* <div className="p-6"> */}

                                {/* Homepage Banner Tab */}
                                <TabsContent value="homepage" className="space-y-8 mt-0">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Globe className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-blue-900">Homepage Banners</h3>
                                                <p className="text-sm text-blue-700">Configure your main homepage banners and call-to-actions</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                                            <CardTitle className="flex items-center gap-2 text-gray-800">
                                                <div className="p-1.5 bg-blue-100 rounded-md">
                                                    <FileImage className="h-4 w-4 text-blue-600" />
                                                </div>
                                                Main Banner
                                            </CardTitle>
                                            <CardDescription>Primary banner displayed prominently on your homepage</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6 p-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="banner_main_title" className="text-sm font-medium text-gray-700">Banner Title</Label>
                                                        <Input
                                                            id="banner_main_title"
                                                            value={data.banner_main_title}
                                                            onChange={(e) => setData('banner_main_title', e.target.value)}
                                                            placeholder="e.g., Back to school"
                                                            className="mt-1.5 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                        />
                                                        {errors.banner_main_title && (
                                                            <p className="text-sm text-red-600 mt-1">{errors.banner_main_title}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="banner_main_subtitle" className="text-sm font-medium text-gray-700">Subtitle</Label>
                                                        <Input
                                                            id="banner_main_subtitle"
                                                            value={data.banner_main_subtitle}
                                                            onChange={(e) => setData('banner_main_subtitle', e.target.value)}
                                                            placeholder="e.g., For the first day and beyond"
                                                            className="mt-1.5 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                        />
                                                        {errors.banner_main_subtitle && (
                                                            <p className="text-sm text-red-600 mt-1">{errors.banner_main_subtitle}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="banner_main_button_text" className="text-sm font-medium text-gray-700">Button Text</Label>
                                                        <Input
                                                            id="banner_main_button_text"
                                                            value={data.banner_main_button_text}
                                                            onChange={(e) => setData('banner_main_button_text', e.target.value)}
                                                            placeholder="e.g., Shop school supplies"
                                                            className="mt-1.5 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                        />
                                                        {errors.banner_main_button_text && (
                                                            <p className="text-sm text-red-600 mt-1">{errors.banner_main_button_text}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="banner_main_button_link" className="text-sm font-medium text-gray-700">Button Link</Label>
                                                        <Input
                                                            id="banner_main_button_link"
                                                            value={data.banner_main_button_link}
                                                            onChange={(e) => setData('banner_main_button_link', e.target.value)}
                                                            placeholder="e.g., /categories/school-supplies"
                                                            className="mt-1.5 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                        />
                                                        {errors.banner_main_button_link && (
                                                            <p className="text-sm text-red-600 mt-1">{errors.banner_main_button_link}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <ImageUpload
                                                        label="Banner Image"
                                                        onFileSelect={(file) => handleFileChange('banner_main_image', file)}
                                                        currentImage={settings.banner_main_image}
                                                        accept="image/*"
                                                        maxSize={5 * 1024 * 1024}
                                                        className="h-full"
                                                    />
                                                    {errors.banner_main_image && (
                                                        <p className="text-sm text-red-600 mt-2">{errors.banner_main_image}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                                            <CardTitle className="flex items-center gap-2 text-gray-800">
                                                <div className="p-1.5 bg-purple-100 rounded-md">
                                                    <FileImage className="h-4 w-4 text-purple-600" />
                                                </div>
                                                Secondary Banner
                                            </CardTitle>
                                            <CardDescription>Secondary promotional banner for additional content</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6 p-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="banner_secondary_title" className="text-sm font-medium text-gray-700">Banner Title</Label>
                                                        <Input
                                                            id="banner_secondary_title"
                                                            value={data.banner_secondary_title}
                                                            onChange={(e) => setData('banner_secondary_title', e.target.value)}
                                                            placeholder="e.g., Teacher Appreciation Gifts"
                                                            className="mt-1.5 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                                        />
                                                        {errors.banner_secondary_title && (
                                                            <p className="text-sm text-red-600 mt-1">{errors.banner_secondary_title}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="banner_secondary_button_text" className="text-sm font-medium text-gray-700">Button Text</Label>
                                                        <Input
                                                            id="banner_secondary_button_text"
                                                            value={data.banner_secondary_button_text}
                                                            onChange={(e) => setData('banner_secondary_button_text', e.target.value)}
                                                            placeholder="e.g., Shop now"
                                                            className="mt-1.5 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                                        />
                                                        {errors.banner_secondary_button_text && (
                                                            <p className="text-sm text-red-600 mt-1">{errors.banner_secondary_button_text}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="banner_secondary_button_link" className="text-sm font-medium text-gray-700">Button Link</Label>
                                                        <Input
                                                            id="banner_secondary_button_link"
                                                            value={data.banner_secondary_button_link}
                                                            onChange={(e) => setData('banner_secondary_button_link', e.target.value)}
                                                            placeholder="e.g., /categories/gifts"
                                                            className="mt-1.5 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                                        />
                                                        {errors.banner_secondary_button_link && (
                                                            <p className="text-sm text-red-600 mt-1">{errors.banner_secondary_button_link}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <ImageUpload
                                                        label="Banner Image"
                                                        onFileSelect={(file) => handleFileChange('banner_secondary_image', file)}
                                                        currentImage={settings.banner_secondary_image}
                                                        accept="image/*"
                                                        maxSize={5 * 1024 * 1024}
                                                        className="h-full"
                                                    />
                                                    {errors.banner_secondary_image && (
                                                        <p className="text-sm text-red-600 mt-2">{errors.banner_secondary_image}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                        </TabsContent>

                        {/* About Section Tab */}
                        <TabsContent value="about" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>About Section</CardTitle>
                                    <CardDescription>Configure the about section content</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="about_title">Main Title</Label>
                                            <Input
                                                id="about_title"
                                                value={data.about_title}
                                                onChange={(e) => setData('about_title', e.target.value)}
                                                placeholder="e.g., What is ShopHub?"
                                            />
                                            {errors.about_title && (
                                                <p className="text-sm text-red-600">{errors.about_title}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="about_subtitle">Subtitle</Label>
                                            <Input
                                                id="about_subtitle"
                                                value={data.about_subtitle}
                                                onChange={(e) => setData('about_subtitle', e.target.value)}
                                                placeholder="e.g., Discover our Ethiopian heritage story"
                                            />
                                            {errors.about_subtitle && (
                                                <p className="text-sm text-red-600">{errors.about_subtitle}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Column 1 */}
                                    <div className="space-y-2">
                                        <Label htmlFor="about_column1_title">Column 1 Title</Label>
                                        <Input
                                            id="about_column1_title"
                                            value={data.about_column1_title}
                                            onChange={(e) => setData('about_column1_title', e.target.value)}
                                            placeholder="e.g., Celebrating Ethiopian Heritage"
                                        />
                                        {errors.about_column1_title && (
                                            <p className="text-sm text-red-600">{errors.about_column1_title}</p>
                                        )}
                                        <Label htmlFor="about_column1_text">Column 1 Text</Label>
                                        <Textarea
                                            id="about_column1_text"
                                            value={data.about_column1_text}
                                            onChange={(e) => setData('about_column1_text', e.target.value)}
                                            rows={4}
                                            placeholder="Describe your first key point..."
                                        />
                                        {errors.about_column1_text && (
                                            <p className="text-sm text-red-600">{errors.about_column1_text}</p>
                                        )}
                                    </div>

                                    {/* Column 2 */}
                                    <div className="space-y-2">
                                        <Label htmlFor="about_column2_title">Column 2 Title</Label>
                                        <Input
                                            id="about_column2_title"
                                            value={data.about_column2_title}
                                            onChange={(e) => setData('about_column2_title', e.target.value)}
                                            placeholder="e.g., Supporting Local Artisans"
                                        />
                                        {errors.about_column2_title && (
                                            <p className="text-sm text-red-600">{errors.about_column2_title}</p>
                                        )}
                                        <Label htmlFor="about_column2_text">Column 2 Text</Label>
                                        <Textarea
                                            id="about_column2_text"
                                            value={data.about_column2_text}
                                            onChange={(e) => setData('about_column2_text', e.target.value)}
                                            rows={4}
                                            placeholder="Describe your second key point..."
                                        />
                                        {errors.about_column2_text && (
                                            <p className="text-sm text-red-600">{errors.about_column2_text}</p>
                                        )}
                                    </div>

                                    {/* Column 3 */}
                                    <div className="space-y-2">
                                        <Label htmlFor="about_column3_title">Column 3 Title</Label>
                                        <Input
                                            id="about_column3_title"
                                            value={data.about_column3_title}
                                            onChange={(e) => setData('about_column3_title', e.target.value)}
                                            placeholder="e.g., Quality & Authenticity"
                                        />
                                        {errors.about_column3_title && (
                                            <p className="text-sm text-red-600">{errors.about_column3_title}</p>
                                        )}
                                        <Label htmlFor="about_column3_text">Column 3 Text</Label>
                                        <Textarea
                                            id="about_column3_text"
                                            value={data.about_column3_text}
                                            onChange={(e) => setData('about_column3_text', e.target.value)}
                                            rows={4}
                                            placeholder="Describe your third key point..."
                                        />
                                        {errors.about_column3_text && (
                                            <p className="text-sm text-red-600">{errors.about_column3_text}</p>
                                        )}
                                    </div>

                                    {/* CTA Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="about_cta_text">CTA Text</Label>
                                            <Input
                                                id="about_cta_text"
                                                value={data.about_cta_text}
                                                onChange={(e) => setData('about_cta_text', e.target.value)}
                                                placeholder="e.g., Questions about our products?"
                                            />
                                            {errors.about_cta_text && (
                                                <p className="text-sm text-red-600">{errors.about_cta_text}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="about_cta_button_text">CTA Button Text</Label>
                                            <Input
                                                id="about_cta_button_text"
                                                value={data.about_cta_button_text}
                                                onChange={(e) => setData('about_cta_button_text', e.target.value)}
                                                placeholder="e.g., Contact Our Team"
                                            />
                                            {errors.about_cta_button_text && (
                                                <p className="text-sm text-red-600">{errors.about_cta_button_text}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Footer Tab */}
                        <TabsContent value="footer" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Footer Settings</CardTitle>
                                    <CardDescription>Configure footer content and settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="footer_brand_description">Brand Description</Label>
                                            <Input
                                                id="footer_brand_description"
                                                value={data.footer_brand_description}
                                                onChange={(e) => setData('footer_brand_description', e.target.value)}
                                                placeholder="e.g., Discover Ethiopian treasures and modern essentials"
                                            />
                                            {errors.footer_brand_description && (
                                                <p className="text-sm text-red-600">{errors.footer_brand_description}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="footer_download_text">Download Button Text</Label>
                                            <Input
                                                id="footer_download_text"
                                                value={data.footer_download_text}
                                                onChange={(e) => setData('footer_download_text', e.target.value)}
                                                placeholder="e.g., Download ShopHub App"
                                            />
                                            {errors.footer_download_text && (
                                                <p className="text-sm text-red-600">{errors.footer_download_text}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="footer_location_text">Location Text</Label>
                                            <Input
                                                id="footer_location_text"
                                                value={data.footer_location_text}
                                                onChange={(e) => setData('footer_location_text', e.target.value)}
                                                placeholder="e.g., Ethiopia"
                                            />
                                            {errors.footer_location_text && (
                                                <p className="text-sm text-red-600">{errors.footer_location_text}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="footer_language_text">Language Text</Label>
                                            <Input
                                                id="footer_language_text"
                                                value={data.footer_language_text}
                                                onChange={(e) => setData('footer_language_text', e.target.value)}
                                                placeholder="e.g., Amharic / English"
                                            />
                                            {errors.footer_language_text && (
                                                <p className="text-sm text-red-600">{errors.footer_language_text}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="footer_currency_text">Currency Text</Label>
                                            <Input
                                                id="footer_currency_text"
                                                value={data.footer_currency_text}
                                                onChange={(e) => setData('footer_currency_text', e.target.value)}
                                                placeholder="e.g., (ETB)"
                                            />
                                            {errors.footer_currency_text && (
                                                <p className="text-sm text-red-600">{errors.footer_currency_text}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="footer_copyright_text">Copyright Text</Label>
                                            <Input
                                                id="footer_copyright_text"
                                                value={data.footer_copyright_text}
                                                onChange={(e) => setData('footer_copyright_text', e.target.value)}
                                                placeholder="e.g., © 2025 ShopHub Ethiopia"
                                            />
                                            {errors.footer_copyright_text && (
                                                <p className="text-sm text-red-600">{errors.footer_copyright_text}</p>
                                            )}
                                        </div>
                                    </div>
                                                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Offline Payments Tab */}
                                <TabsContent value="offline-payments" className="space-y-8 mt-0">
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-orange-100 rounded-lg">
                                                <FileImage className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-orange-900">Offline Payment Methods</h3>
                                                <p className="text-sm text-orange-700">Manage available offline payment methods for manual payment submissions</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                                            <CardTitle className="flex items-center gap-2 text-gray-800">
                                                <div className="p-1.5 bg-orange-100 rounded-md">
                                                    <FileImage className="h-4 w-4 text-orange-600" />
                                                </div>
                                                Available Payment Methods
                                            </CardTitle>
                                            <CardDescription>Customers can use these methods to pay offline and upload payment screenshots</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                {offlinePaymentMethods.length > 0 ? (
                                                    offlinePaymentMethods.map((method) => (
                                                        <div key={method.id} className="border rounded-lg p-4 bg-white">
                                                            <div className="flex items-start gap-4">
                                                                {method.logo && (
                                                                    <img
                                                                        src={method.logo}
                                                                        alt={method.name}
                                                                        className="w-12 h-12 object-cover rounded-lg"
                                                                    />
                                                                )}
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <h4 className="font-semibold text-gray-900">{method.name}</h4>
                                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                                            method.is_active 
                                                                                ? 'bg-green-100 text-green-800' 
                                                                                : 'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                            {method.is_active ? 'Active' : 'Inactive'}
                                                                        </span>
                                                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
                                                                            {method.type}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                                                                    <div className="text-xs text-gray-500">
                                                                        <p><strong>Instructions:</strong> {method.instructions}</p>
                                                                        {method.details && Object.keys(method.details).length > 0 && (
                                                                            <div className="mt-1">
                                                                                <strong>Details:</strong>
                                                                                {Object.entries(method.details).map(([key, value]) => (
                                                                                    <span key={key} className="ml-2">
                                                                                        {key}: {String(value)}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                        <p>No offline payment methods configured yet.</p>
                                                        <p className="text-sm mt-1">Add payment methods to allow customers to pay offline.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quick Add Form */}
                                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                                <h5 className="font-medium text-gray-900 mb-3">Quick Add Payment Method</h5>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    You can add payment methods like Bank Transfer, Mobile Money, etc. 
                                                    For full management, visit the dedicated payment methods page.
                                                </p>
                                                <Button 
                                                    type="button" 
                                                    variant="outline"
                                                    onClick={() => window.open('/admin/offline-payment-methods', '_blank')}
                                                    className="w-full"
                                                >
                                                    Manage Offline Payment Methods
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Legal Content Tab */}
                        <TabsContent value="legal" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Privacy Policy</CardTitle>
                                    <CardDescription>Edit your privacy policy content with rich text formatting</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="privacy_policy_content">Privacy Policy Content</Label>
                                        <div className="mt-2">
                                            <RichTextEditor
                                                content={data.privacy_policy_content}
                                                onUpdate={(content) => setData('privacy_policy_content', content)}
                                                placeholder="Enter your privacy policy content here..."
                                                className="min-h-[300px]"
                                            />
                                        </div>
                                        {errors.privacy_policy_content && (
                                            <p className="text-sm text-red-600 mt-2">{errors.privacy_policy_content}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Terms and Conditions</CardTitle>
                                    <CardDescription>Edit your terms and conditions content with rich text formatting</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="terms_conditions_content">Terms and Conditions Content</Label>
                                        <div className="mt-2">
                                            <RichTextEditor
                                                content={data.terms_conditions_content}
                                                onUpdate={(content) => setData('terms_conditions_content', content)}
                                                placeholder="Enter your terms and conditions content here..."
                                                className="min-h-[300px]"
                                            />
                                        </div>
                                        {errors.terms_conditions_content && (
                                            <p className="text-sm text-red-600 mt-2">{errors.terms_conditions_content}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Enhanced Submit Button */}
                        <div className="flex justify-center pt-6">
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="px-12 py-3  font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                size="lg"
                                // variant="default"
                            >
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Saving Changes...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Save Configuration
                                    </div>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
