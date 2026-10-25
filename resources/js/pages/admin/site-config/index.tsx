/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import React from 'react';
import { FileImage, FileText, Globe, Info, Palette, Settings, CreditCard, Plus, X, Edit } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';

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

interface ChapaPaymentMethod {
    id: number;
    name: string;
    code: string;
    description?: string;
    logo?: string;
    is_active: boolean;
    sort_order: number;
}

interface SiteConfigProps {
    settings: Record<string, string>;
    offlinePaymentMethods: OfflinePaymentMethod[];
    chapaPaymentMethods: ChapaPaymentMethod[];
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

export default function SiteConfig({ settings, offlinePaymentMethods, chapaPaymentMethods }: SiteConfigProps) {
    const [showAddPaymentModal, setShowAddPaymentModal] = React.useState(false);
    const [showAddChapaPaymentModal, setShowAddChapaPaymentModal] = React.useState(false);
    const [editingOfflineMethod, setEditingOfflineMethod] = React.useState<OfflinePaymentMethod | null>(null);
    
    const paymentForm = useForm({
        name: '',
        type: 'bank',
        description: '',
        instructions: '',
        details: {} as Record<string, any>,
    });

    const editPaymentForm = useForm({
        name: '',
        type: 'bank',
        description: '',
        instructions: '',
        is_active: true,
        details: {} as Record<string, any>,
    });

    const chapaPaymentForm = useForm({
        name: '',
        code: '',
        description: '',
        logo: '',
        is_active: true,
        sort_order: 0,
    });
    
    const [removedImages, setRemovedImages] = React.useState<{
        banner_main_image?: boolean;
        banner_secondary_image?: boolean;
    }>({});
    
    const [uploadProgress, setUploadProgress] = React.useState<{
        banner_main_image?: number;
        banner_secondary_image?: number;
    }>({});

    const { data, setData, post, processing, errors, transform } = useForm({
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
        about_cta_button_link: settings.about_cta_button_link || '',
        
        // Footer
        footer_brand_description: settings.footer_brand_description || '',
        footer_download_text: settings.footer_download_text || '',
        footer_download_link: settings.footer_download_link || '',
        footer_location_text: settings.footer_location_text || '',
        footer_language_text: settings.footer_language_text || '',
        footer_currency_text: settings.footer_currency_text || '',
        footer_copyright_text: settings.footer_copyright_text || '',
        footer_columns: (() => {
            try {
                const cols = settings.footer_columns ? (typeof settings.footer_columns === 'string' ? JSON.parse(settings.footer_columns) : settings.footer_columns) : [];
                return Array.isArray(cols) ? cols : [];
            } catch {
                return [];
            }
        })(),
        social_links: (() => {
            try {
                const links = settings.social_links ? (typeof settings.social_links === 'string' ? JSON.parse(settings.social_links) : settings.social_links) : {};
                return typeof links === 'object' && links !== null ? links : {};
            } catch {
                return {};
            }
        })(),
        
        // Legal Content
        privacy_policy_content: settings.privacy_policy_content || '',
        terms_conditions_content: settings.terms_conditions_content || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Transform data to send existing image paths when no new file is selected
        transform((formData) => {
            const transformed: any = { ...formData };
            
            // Handle banner_main_image
            if (removedImages.banner_main_image) {
                transformed.banner_main_image = '';
            } else if (!formData.banner_main_image || !(formData.banner_main_image instanceof File)) {
                // No new file selected, send existing image path
                transformed.banner_main_image = settings.banner_main_image || '';
            }
            // If it's a File, keep it for upload (Inertia will handle it)
            
            // Handle banner_secondary_image
            if (removedImages.banner_secondary_image) {
                transformed.banner_secondary_image = '';
            } else if (!formData.banner_secondary_image || !(formData.banner_secondary_image instanceof File)) {
                // No new file selected, send existing image path
                transformed.banner_secondary_image = settings.banner_secondary_image || '';
            }
            // If it's a File, keep it for upload (Inertia will handle it)
            
            // Convert footer_columns array to JSON string
            if (formData.footer_columns && Array.isArray(formData.footer_columns)) {
                transformed.footer_columns = JSON.stringify(formData.footer_columns);
            }
            
            // Convert social_links object to JSON string
            if (formData.social_links && typeof formData.social_links === 'object') {
                transformed.social_links = JSON.stringify(formData.social_links);
            }
            
            return transformed;
        });
        
        post('/site-config', {
            preserveScroll: true,
            forceFormData: true,
            onProgress: (progress) => {
                // Calculate progress percentage
                const percentage = progress && progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0;
                
                // Determine which image is being uploaded based on form data
                if (data.banner_main_image instanceof File) {
                    setUploadProgress(prev => ({ ...prev, banner_main_image: percentage }));
                }
                if (data.banner_secondary_image instanceof File) {
                    setUploadProgress(prev => ({ ...prev, banner_secondary_image: percentage }));
                }
            },
            onSuccess: () => {
                // Reset file inputs and removed images after successful upload
                setData(prev => ({
                    ...prev,
                    banner_main_image: null,
                    banner_secondary_image: null,
                }));
                setRemovedImages({});
                setUploadProgress({});
            },
            onError: () => {
                // Clear progress on error
                setUploadProgress({});
            },
        });
    };

    const handleFileChange = (field: 'banner_main_image' | 'banner_secondary_image', file: File | null) => {
        setData(field, file);
        // Clear removed flag if a new file is selected
        if (file) {
            setRemovedImages(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const handleImageRemove = (field: 'banner_main_image' | 'banner_secondary_image') => {
        setData(field, null);
        setRemovedImages(prev => ({
            ...prev,
            [field]: true,
        }));
    };

    const [primaryColor, setPrimaryColor] = React.useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('serdo_dashboard_primary_color') || '#1E5338';
        }
        return '#1E5338';
    });

    React.useEffect(() => {
        const handler = (e: any) => {
            const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
            if (color) setPrimaryColor(color);
        };
        window.addEventListener('serdo:theme-color-changed', handler);
        return () => window.removeEventListener('serdo:theme-color-changed', handler);
    }, []);

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
                <Head title="Site Configuration" />
                
                <div className="min-h-screen bg-[#F6F8FA] p-6 lg:p-8 font-sans">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Store Settings & Branding</span>
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                <span className="text-xs font-medium text-emerald-600">Saved</span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 mt-1">Site Configuration</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Customize homepage hero banners, company story, footer links, payment accounts, and legal terms</p>
                        </div>
                    </div>

                    {/* 5 Donezo Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                        {/* Primary Hero Metric */}
                        <div 
                            className="relative overflow-hidden rounded-[26px] p-5 text-white shadow-lg transition-transform hover:-translate-y-0.5"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <div className="absolute top-0 right-0 -mr-6 -mt-6 h-28 w-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Homepage</span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                                    <Globe className="h-4 w-4 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 relative z-10">
                                <h3 className="text-2xl font-black tracking-tight text-white">2 Banners</h3>
                                <p className="text-[11px] font-medium text-white/80 mt-0.5">Main hero & promo</p>
                            </div>
                        </div>

                        {/* About Section Metric */}
                        <div className="rounded-[26px] border border-gray-200/80 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">About Story</span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50">
                                    <Info className="h-4 w-4 text-emerald-600" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-2xl font-black tracking-tight text-emerald-600">3 Sections</h3>
                                <p className="text-[11px] font-medium text-gray-500 mt-0.5">Pillars & vision</p>
                            </div>
                        </div>

                        {/* Footer Metric */}
                        <div className="rounded-[26px] border border-gray-200/80 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Store Footer</span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-50">
                                    <Palette className="h-4 w-4 text-purple-600" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-2xl font-black tracking-tight text-purple-600">6 Fields</h3>
                                <p className="text-[11px] font-medium text-gray-500 mt-0.5">Links & social contacts</p>
                            </div>
                        </div>

                        {/* Offline Pay Metric */}
                        <div className="rounded-[26px] border border-gray-200/80 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Manual Pay</span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-red-50">
                                    <CreditCard className="h-4 w-4 text-red-600" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-2xl font-black tracking-tight text-red-600">{offlinePaymentMethods.length} Methods</h3>
                                <p className="text-[11px] font-medium text-gray-500 mt-0.5">Bank transfer / CBE / Telebirr</p>
                            </div>
                        </div>

                        {/* Legal Metric */}
                        <div className="rounded-[26px] border border-gray-200/80 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Legal Terms</span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-2xl font-black tracking-tight text-blue-600">2 Pages</h3>
                                <p className="text-[11px] font-medium text-gray-500 mt-0.5">Privacy policy & terms</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-white rounded-[26px] border border-gray-200/80 shadow-sm overflow-hidden p-6">
                            <Tabs defaultValue="homepage" className="w-full space-y-6">
                                <div className="overflow-x-auto pb-2">
                                    <TabsList className="h-11 bg-gray-200/60 p-1 rounded-2xl border border-gray-200/50 inline-flex min-w-full sm:min-w-0">
                                        <TabsTrigger value="homepage" className="rounded-xl px-4 py-2 font-semibold text-xs tracking-wide data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all cursor-pointer">
                                            <Globe className="h-3.5 w-3.5 mr-2" />
                                            <span>Homepage</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="about" className="rounded-xl px-4 py-2 font-semibold text-xs tracking-wide data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all cursor-pointer">
                                            <Info className="h-3.5 w-3.5 mr-2" />
                                            <span>About Story</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="footer" className="rounded-xl px-4 py-2 font-semibold text-xs tracking-wide data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all cursor-pointer">
                                            <Palette className="h-3.5 w-3.5 mr-2" />
                                            <span>Footer & Links</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="chapa-payments" className="rounded-xl px-4 py-2 font-semibold text-xs tracking-wide data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all cursor-pointer">
                                            <CreditCard className="h-3.5 w-3.5 mr-2" />
                                            <span>Chapa Gateways</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="offline-payments" className="rounded-xl px-4 py-2 font-semibold text-xs tracking-wide data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all cursor-pointer">
                                            <FileImage className="h-3.5 w-3.5 mr-2" />
                                            <span>Offline Accounts</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="legal" className="rounded-xl px-4 py-2 font-semibold text-xs tracking-wide data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all cursor-pointer">
                                            <FileText className="h-3.5 w-3.5 mr-2" />
                                            <span>Legal Pages</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* Homepage Banner Tab */}
                                <TabsContent value="homepage" className="space-y-8 mt-0 outline-none">
                                    <div className="rounded-[22px] bg-blue-50/70 p-5 border border-blue-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-blue-950">Homepage Banners</h3>
                                                <p className="text-xs text-blue-700">Configure your hero promotions, banners, buttons, and call-to-actions</p>
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
                                                        onRemove={() => handleImageRemove('banner_main_image')}
                                                        currentImage={removedImages.banner_main_image ? undefined : settings.banner_main_image}
                                                        accept="image/*"
                                                        maxSize={5 * 1024 * 1024}
                                                        className="h-full"
                                                        uploadProgress={uploadProgress.banner_main_image}
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
                                                        onRemove={() => handleImageRemove('banner_secondary_image')}
                                                        currentImage={removedImages.banner_secondary_image ? undefined : settings.banner_secondary_image}
                                                        accept="image/*"
                                                        maxSize={5 * 1024 * 1024}
                                                        className="h-full"
                                                        uploadProgress={uploadProgress.banner_secondary_image}
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
                                                placeholder="e.g., What is Serdo?"
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
                                    <div>
                                        <Label htmlFor="about_cta_button_link">CTA Button Link</Label>
                                        <Input
                                            id="about_cta_button_link"
                                            value={data.about_cta_button_link}
                                            onChange={(e) => setData('about_cta_button_link', e.target.value)}
                                            placeholder="e.g., /contact or https://example.com/contact"
                                        />
                                        {errors.about_cta_button_link && (
                                            <p className="text-sm text-red-600">{errors.about_cta_button_link}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Footer Tab */}
                        <TabsContent value="footer" className="space-y-6">
                            {/* Basic Footer Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Footer Settings</CardTitle>
                                    <CardDescription>Configure basic footer content</CardDescription>
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
                                                placeholder="e.g., Download Serdo App"
                                            />
                                            {errors.footer_download_text && (
                                                <p className="text-sm text-red-600">{errors.footer_download_text}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="footer_download_link">Download Button Link</Label>
                                            <Input
                                                id="footer_download_link"
                                                value={data.footer_download_link}
                                                onChange={(e) => setData('footer_download_link', e.target.value)}
                                                placeholder="e.g., https://play.google.com/store/apps or /download"
                                            />
                                            {errors.footer_download_link && (
                                                <p className="text-sm text-red-600">{errors.footer_download_link}</p>
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
                                                placeholder="e.g., © 2025 Serdo Ethiopia"
                                            />
                                            {errors.footer_copyright_text && (
                                                <p className="text-sm text-red-600">{errors.footer_copyright_text}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Footer Columns */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Footer Columns</CardTitle>
                                            <CardDescription>Manage footer link columns (max 5 columns)</CardDescription>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (data.footer_columns.length < 5) {
                                                    setData('footer_columns', [
                                                        ...data.footer_columns,
                                                        { title: '', links: [] }
                                                    ]);
                                                }
                                            }}
                                            disabled={data.footer_columns.length >= 5}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Column
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {data.footer_columns.map((column: any, columnIndex: number) => (
                                        <div key={columnIndex} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-gray-900">Column {columnIndex + 1}</h4>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newColumns = data.footer_columns.filter((_: any, i: number) => i !== columnIndex);
                                                        setData('footer_columns', newColumns);
                                                    }}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Remove Column
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Column Title</Label>
                                                    <Input
                                                        value={column.title || ''}
                                                        onChange={(e) => {
                                                            const newColumns = [...data.footer_columns];
                                                            newColumns[columnIndex] = { ...newColumns[columnIndex], title: e.target.value };
                                                            setData('footer_columns', newColumns);
                                                        }}
                                                        placeholder="e.g., Shop, Sell, About, Help"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Label>Links</Label>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const newColumns = [...data.footer_columns];
                                                                newColumns[columnIndex] = {
                                                                    ...newColumns[columnIndex],
                                                                    links: [...(newColumns[columnIndex].links || []), { text: '', url: '' }]
                                                                };
                                                                setData('footer_columns', newColumns);
                                                            }}
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            Add Link
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {(column.links || []).map((link: any, linkIndex: number) => (
                                                            <div key={linkIndex} className="flex gap-2 items-start">
                                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                                    <Input
                                                                        value={link.text || ''}
                                                                        onChange={(e) => {
                                                                            const newColumns = [...data.footer_columns];
                                                                            const newLinks = [...(newColumns[columnIndex].links || [])];
                                                                            newLinks[linkIndex] = { ...newLinks[linkIndex], text: e.target.value };
                                                                            newColumns[columnIndex] = { ...newColumns[columnIndex], links: newLinks };
                                                                            setData('footer_columns', newColumns);
                                                                        }}
                                                                        placeholder="Link text"
                                                                    />
                                                                    <Input
                                                                        value={link.url || ''}
                                                                        onChange={(e) => {
                                                                            const newColumns = [...data.footer_columns];
                                                                            const newLinks = [...(newColumns[columnIndex].links || [])];
                                                                            newLinks[linkIndex] = { ...newLinks[linkIndex], url: e.target.value };
                                                                            newColumns[columnIndex] = { ...newColumns[columnIndex], links: newLinks };
                                                                            setData('footer_columns', newColumns);
                                                                        }}
                                                                        placeholder="Link URL (e.g., /shop or https://...)"
                                                                    />
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const newColumns = [...data.footer_columns];
                                                                        const newLinks = (newColumns[columnIndex].links || []).filter((_: any, i: number) => i !== linkIndex);
                                                                        newColumns[columnIndex] = { ...newColumns[columnIndex], links: newLinks };
                                                                        setData('footer_columns', newColumns);
                                                                    }}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        {(!column.links || column.links.length === 0) && (
                                                            <p className="text-sm text-gray-500 italic">No links added yet. Click "Add Link" to add one.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {data.footer_columns.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No footer columns added yet.</p>
                                            <p className="text-sm mt-1">Click "Add Column" to create your first footer column.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Social Media Links */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Social Media Links</CardTitle>
                                    <CardDescription>Configure social media links for the footer</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'tiktok'].map((platform) => (
                                            <div key={platform}>
                                                <Label htmlFor={`social_${platform}`} className="capitalize">
                                                    {platform === 'twitter' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                </Label>
                                                <Input
                                                    id={`social_${platform}`}
                                                    value={data.social_links[platform] || ''}
                                                    onChange={(e) => {
                                                        setData('social_links', {
                                                            ...data.social_links,
                                                            [platform]: e.target.value
                                                        });
                                                    }}
                                                    placeholder={`https://${platform}.com/yourpage`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                                {/* Chapa Payment Methods Tab */}
                                <TabsContent value="chapa-payments" className="space-y-8 mt-0">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <CreditCard className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-blue-900">Chapa Payment Methods</h3>
                                                <p className="text-sm text-blue-700">Manage available Chapa payment methods (Telebirr, CBE, etc.) for online payments</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                                            <CardTitle className="flex items-center gap-2 text-gray-800">
                                                <div className="p-1.5 bg-blue-100 rounded-md">
                                                    <CreditCard className="h-4 w-4 text-blue-600" />
                                                </div>
                                                Available Chapa Payment Methods
                                            </CardTitle>
                                            <CardDescription>These methods will be shown to customers during Chapa payment selection</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                {chapaPaymentMethods.length > 0 ? (
                                                    chapaPaymentMethods.map((method) => (
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
                                                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                                            Code: {method.code}
                                                                        </span>
                                                                    </div>
                                                                    {method.description && (
                                                                        <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                                                                    )}
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                // TODO: Implement edit functionality
                                                                                console.log('Edit method', method.id);
                                                                            }}
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                // TODO: Implement delete functionality
                                                                                if (confirm(`Are you sure you want to delete ${method.name}?`)) {
                                                                                    router.delete(route('admin.chapa-payment-methods.destroy', method.id));
                                                                                }
                                                                            }}
                                                                            className="text-red-600 hover:text-red-700"
                                                                        >
                                                                            Delete
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                        <p>No Chapa payment methods configured yet.</p>
                                                        <p className="text-sm mt-1">Add payment methods to allow customers to choose from available options.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quick Add Form */}
                                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                                <h5 className="font-medium text-gray-900 mb-3">Add Chapa Payment Method</h5>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Add new Chapa payment methods (e.g., Telebirr, CBE, M-Pesa) for customers to use during checkout.
                                                </p>
                                                <Button 
                                                    type="button" 
                                                    variant="outline"
                                                    onClick={() => setShowAddChapaPaymentModal(true)}
                                                    className="w-full"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Chapa Payment Method
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Offline Payments Tab */}
                                <TabsContent value="offline-payments" className="space-y-8 mt-0">
                                    <div className="bg-gradient-to-r from-primary-50 to-red-50 rounded-xl p-6 border border-primary-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-primary-100 rounded-lg">
                                                <FileImage className="h-5 w-5 text-primary-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-primary-900">Offline Payment Methods</h3>
                                                <p className="text-sm text-primary-700">Manage available offline payment methods for manual payment submissions</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                        <CardHeader className="bg-gradient-to-r from-primary-50 to-red-50 rounded-t-lg">
                                            <CardTitle className="flex items-center gap-2 text-gray-800">
                                                <div className="p-1.5 bg-primary-100 rounded-md">
                                                    <FileImage className="h-4 w-4 text-primary-600" />
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
                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                            {method.details && Object.keys(method.details).length > 0 && (
                                                                                Object.entries(method.details).map(([key, value]) => (
                                                                                    <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-800 border">
                                                                                        <strong className="mr-1 capitalize font-sans">{key.replace('_', ' ')}:</strong> {String(value)}
                                                                                    </span>
                                                                                ))
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setEditingOfflineMethod(method);
                                                                                    editPaymentForm.setData({
                                                                                        name: method.name || '',
                                                                                        type: method.type || 'bank',
                                                                                        description: method.description || '',
                                                                                        instructions: method.instructions || '',
                                                                                        is_active: method.is_active ?? true,
                                                                                        details: method.details ? { ...method.details } : {},
                                                                                    });
                                                                                }}
                                                                                className="h-8 gap-1.5 text-xs text-primary hover:text-primary hover:border-primary"
                                                                            >
                                                                                <Edit className="h-3.5 w-3.5" />
                                                                                Edit Numbers & Details
                                                                            </Button>
                                                                        </div>
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
                                                    Add new offline payment methods for customers to use during checkout.
                                                </p>
                                                <Button 
                                                    type="button" 
                                                    variant="outline"
                                                    onClick={() => setShowAddPaymentModal(true)}
                                                    className="w-full"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Payment Method
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

                    {/* Add Payment Method Modal */}
                    <Dialog open={showAddPaymentModal} onOpenChange={setShowAddPaymentModal}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-gray-900">Add Offline Payment Method</DialogTitle>
                                <DialogDescription className="text-gray-600">
                                    Create a new offline payment method for customers to use during checkout.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                paymentForm.post('/admin/offline-payment-methods', {
                                    onSuccess: () => {
                                        setShowAddPaymentModal(false);
                                        paymentForm.reset();
                                    }
                                });
                            }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="payment_name" className="text-sm font-medium text-gray-700">
                                            Payment Method Name *
                                        </Label>
                                        <Input
                                            id="payment_name"
                                            type="text"
                                            value={paymentForm.data.name}
                                            onChange={(e) => paymentForm.setData('name', e.target.value)}
                                            placeholder="e.g., CBE Bank Transfer"
                                            className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            required
                                        />
                                        {paymentForm.errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{paymentForm.errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="payment_type" className="text-sm font-medium text-gray-700">
                                            Payment Type *
                                        </Label>
                                        <Select 
                                            value={paymentForm.data.type} 
                                            onValueChange={(value) => paymentForm.setData('type', value)}
                                        >
                                            <SelectTrigger className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                                <SelectValue placeholder="Select payment type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bank">Bank Transfer</SelectItem>
                                                <SelectItem value="mobile">Mobile Money</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {paymentForm.errors.type && (
                                            <p className="mt-1 text-sm text-red-600">{paymentForm.errors.type}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="payment_description" className="text-sm font-medium text-gray-700">
                                        Description *
                                    </Label>
                                    <Input
                                        id="payment_description"
                                        type="text"
                                        value={paymentForm.data.description}
                                        onChange={(e) => paymentForm.setData('description', e.target.value)}
                                        placeholder="Brief description of the payment method"
                                        className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        required
                                    />
                                    {paymentForm.errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{paymentForm.errors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="payment_instructions" className="text-sm font-medium text-gray-700">
                                        Payment Instructions *
                                    </Label>
                                    <Textarea
                                        id="payment_instructions"
                                        value={paymentForm.data.instructions}
                                        onChange={(e) => paymentForm.setData('instructions', e.target.value)}
                                        placeholder="Detailed instructions for customers on how to make the payment..."
                                        className="mt-1 min-h-[100px] focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        required
                                    />
                                    {paymentForm.errors.instructions && (
                                        <p className="mt-1 text-sm text-red-600">{paymentForm.errors.instructions}</p>
                                    )}
                                </div>

                                {paymentForm.data.type === 'bank' && (
                                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                                        <h4 className="font-medium text-gray-900">Bank Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Bank Name</Label>
                                                <Input
                                                    type="text"
                                                    value={paymentForm.data.details.bank_name || ''}
                                                    onChange={(e) => paymentForm.setData('details', {
                                                        ...paymentForm.data.details,
                                                        bank_name: e.target.value
                                                    })}
                                                    placeholder="e.g., Commercial Bank of Ethiopia"
                                                    className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                                                <Input
                                                    type="text"
                                                    value={paymentForm.data.details.account_number || ''}
                                                    onChange={(e) => paymentForm.setData('details', {
                                                        ...paymentForm.data.details,
                                                        account_number: e.target.value
                                                    })}
                                                    placeholder="Account number"
                                                    className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Account Holder</Label>
                                                <Input
                                                    type="text"
                                                    value={paymentForm.data.details.account_holder || ''}
                                                    onChange={(e) => paymentForm.setData('details', {
                                                        ...paymentForm.data.details,
                                                        account_holder: e.target.value
                                                    })}
                                                    placeholder="Account holder name"
                                                    className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Branch</Label>
                                                <Input
                                                    type="text"
                                                    value={paymentForm.data.details.branch || ''}
                                                    onChange={(e) => paymentForm.setData('details', {
                                                        ...paymentForm.data.details,
                                                        branch: e.target.value
                                                    })}
                                                    placeholder="Branch name/location"
                                                    className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentForm.data.type === 'mobile' && (
                                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                                        <h4 className="font-medium text-gray-900">Mobile Money Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Provider</Label>
                                                <Input
                                                    type="text"
                                                    value={paymentForm.data.details.provider || ''}
                                                    onChange={(e) => paymentForm.setData('details', {
                                                        ...paymentForm.data.details,
                                                        provider: e.target.value
                                                    })}
                                                    placeholder="e.g., M-Birr, HelloCash"
                                                    className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                                                <Input
                                                    type="text"
                                                    value={paymentForm.data.details.phone_number || ''}
                                                    onChange={(e) => paymentForm.setData('details', {
                                                        ...paymentForm.data.details,
                                                        phone_number: e.target.value
                                                    })}
                                                    placeholder="Mobile money phone number"
                                                    className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Account Name</Label>
                                                <Input
                                                    type="text"
                                                    value={paymentForm.data.details.account_name || ''}
                                                    onChange={(e) => paymentForm.setData('details', {
                                                        ...paymentForm.data.details,
                                                        account_name: e.target.value
                                                    })}
                                                    placeholder="Account holder name"
                                                    className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <DialogFooter className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddPaymentModal(false);
                                            paymentForm.reset();
                                        }}
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={paymentForm.processing}
                                        className="bg-primary hover:bg-primary/90 text-white font-medium"
                                        style={{ backgroundColor: '#ef4e2a' }}
                                    >
                                        {paymentForm.processing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Creating...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                Create Payment Method
                                            </div>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Offline Payment Method Modal */}
                    <Dialog open={!!editingOfflineMethod} onOpenChange={(open) => {
                        if (!open) {
                            setEditingOfflineMethod(null);
                            editPaymentForm.reset();
                        }
                    }}>
                        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-gray-900">
                                    Edit {editingOfflineMethod?.name}
                                </DialogTitle>
                                <DialogDescription className="text-gray-600">
                                    Update bank account or mobile money phone numbers and details displayed to customers during checkout.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (!editingOfflineMethod) return;
                                editPaymentForm.patch(route('admin.offline-payment-methods.update', editingOfflineMethod.id), {
                                    onSuccess: () => {
                                        setEditingOfflineMethod(null);
                                        editPaymentForm.reset();
                                    }
                                });
                            }} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="edit_payment_name" className="text-sm font-medium text-gray-700">
                                            Payment Method Name *
                                        </Label>
                                        <Input
                                            id="edit_payment_name"
                                            type="text"
                                            value={editPaymentForm.data.name}
                                            onChange={(e) => editPaymentForm.setData('name', e.target.value)}
                                            required
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="edit_payment_type" className="text-sm font-medium text-gray-700">
                                            Type *
                                        </Label>
                                        <Select 
                                            value={editPaymentForm.data.type} 
                                            onValueChange={(value) => editPaymentForm.setData('type', value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bank">Bank Transfer</SelectItem>
                                                <SelectItem value="mobile">Mobile Money</SelectItem>
                                                <SelectItem value="cash">Cash on Delivery</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="edit_payment_desc" className="text-sm font-medium text-gray-700">
                                        Description
                                    </Label>
                                    <Input
                                        id="edit_payment_desc"
                                        type="text"
                                        value={editPaymentForm.data.description}
                                        onChange={(e) => editPaymentForm.setData('description', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="edit_payment_instr" className="text-sm font-medium text-gray-700">
                                        Instructions for Customer
                                    </Label>
                                    <Textarea
                                        id="edit_payment_instr"
                                        value={editPaymentForm.data.instructions}
                                        onChange={(e) => editPaymentForm.setData('instructions', e.target.value)}
                                        rows={2}
                                        className="mt-1"
                                    />
                                </div>

                                {/* Dynamic Details Section */}
                                <div className="p-4 bg-slate-50 border rounded-xl space-y-4">
                                    <h5 className="font-semibold text-sm text-slate-900 flex items-center justify-between">
                                        <span>Account & Phone Number Details</span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            These are shown directly in the checkout dialog
                                        </span>
                                    </h5>

                                    {editPaymentForm.data.type === 'bank' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs font-semibold text-gray-700">
                                                    Account Number *
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={editPaymentForm.data.details?.account_number || ''}
                                                    onChange={(e) => editPaymentForm.setData('details', {
                                                        ...editPaymentForm.data.details,
                                                        account_number: e.target.value
                                                    })}
                                                    placeholder="e.g., 1000123456789"
                                                    className="mt-1 font-mono text-sm"
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-xs font-semibold text-gray-700">
                                                    Account Name *
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={editPaymentForm.data.details?.account_name || ''}
                                                    onChange={(e) => editPaymentForm.setData('details', {
                                                        ...editPaymentForm.data.details,
                                                        account_name: e.target.value
                                                    })}
                                                    placeholder="e.g., Serdo E-commerce"
                                                    className="mt-1 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-xs font-semibold text-gray-700">
                                                    Bank Name
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={editPaymentForm.data.details?.bank_name || ''}
                                                    onChange={(e) => editPaymentForm.setData('details', {
                                                        ...editPaymentForm.data.details,
                                                        bank_name: e.target.value
                                                    })}
                                                    placeholder="e.g., Commercial Bank of Ethiopia"
                                                    className="mt-1 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-xs font-semibold text-gray-700">
                                                    Branch (optional)
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={editPaymentForm.data.details?.branch || ''}
                                                    onChange={(e) => editPaymentForm.setData('details', {
                                                        ...editPaymentForm.data.details,
                                                        branch: e.target.value
                                                    })}
                                                    placeholder="e.g., Main Branch"
                                                    className="mt-1 text-sm"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs font-semibold text-gray-700">
                                                    Mobile Number / Phone *
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={editPaymentForm.data.details?.phone_number || ''}
                                                    onChange={(e) => editPaymentForm.setData('details', {
                                                        ...editPaymentForm.data.details,
                                                        phone_number: e.target.value
                                                    })}
                                                    placeholder="e.g., +251911234567 or 0911234567"
                                                    className="mt-1 font-mono text-sm"
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-xs font-semibold text-gray-700">
                                                    Account Name / Receiver
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={editPaymentForm.data.details?.account_name || ''}
                                                    onChange={(e) => editPaymentForm.setData('details', {
                                                        ...editPaymentForm.data.details,
                                                        account_name: e.target.value
                                                    })}
                                                    placeholder="e.g., Serdo Store"
                                                    className="mt-1 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-xs font-semibold text-gray-700">
                                                    Service Name
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={editPaymentForm.data.details?.service || ''}
                                                    onChange={(e) => editPaymentForm.setData('details', {
                                                        ...editPaymentForm.data.details,
                                                        service: e.target.value
                                                    })}
                                                    placeholder="e.g., Telebirr"
                                                    className="mt-1 text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="edit_is_active"
                                        checked={editPaymentForm.data.is_active}
                                        onChange={(e) => editPaymentForm.setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="edit_is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                                        Method is Active (available during checkout)
                                    </Label>
                                </div>

                                <DialogFooter className="flex gap-3 pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingOfflineMethod(null);
                                            editPaymentForm.reset();
                                        }}
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={editPaymentForm.processing}
                                        className="bg-primary hover:bg-primary/90 text-white font-medium"
                                        style={{ backgroundColor: '#ef4e2a' }}
                                    >
                                        {editPaymentForm.processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Add Chapa Payment Method Modal */}
                    <Dialog open={showAddChapaPaymentModal} onOpenChange={setShowAddChapaPaymentModal}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-gray-900">Add Chapa Payment Method</DialogTitle>
                                <DialogDescription className="text-gray-600">
                                    Create a new Chapa payment method (e.g., Telebirr, CBE) for customers to use during checkout.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                chapaPaymentForm.post(route('admin.chapa-payment-methods.store'), {
                                    onSuccess: () => {
                                        setShowAddChapaPaymentModal(false);
                                        chapaPaymentForm.reset();
                                    }
                                });
                            }}>
                                <div className="space-y-4 py-4">
                                    <div>
                                        <Label htmlFor="chapa_name" className="text-sm font-medium text-gray-700">Name *</Label>
                                        <Input
                                            id="chapa_name"
                                            value={chapaPaymentForm.data.name}
                                            onChange={(e) => chapaPaymentForm.setData('name', e.target.value)}
                                            placeholder="e.g., Telebirr"
                                            className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            required
                                        />
                                        {chapaPaymentForm.errors.name && (
                                            <p className="text-sm text-red-600 mt-1">{chapaPaymentForm.errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="chapa_code" className="text-sm font-medium text-gray-700">Code *</Label>
                                        <Input
                                            id="chapa_code"
                                            value={chapaPaymentForm.data.code}
                                            onChange={(e) => chapaPaymentForm.setData('code', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                            placeholder="e.g., telebirr"
                                            className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Unique code used in API calls (lowercase, no spaces)</p>
                                        {chapaPaymentForm.errors.code && (
                                            <p className="text-sm text-red-600 mt-1">{chapaPaymentForm.errors.code}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="chapa_description" className="text-sm font-medium text-gray-700">Description</Label>
                                        <Textarea
                                            id="chapa_description"
                                            value={chapaPaymentForm.data.description}
                                            onChange={(e) => chapaPaymentForm.setData('description', e.target.value)}
                                            placeholder="Brief description of the payment method"
                                            rows={3}
                                            className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                        {chapaPaymentForm.errors.description && (
                                            <p className="text-sm text-red-600 mt-1">{chapaPaymentForm.errors.description}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="chapa_logo" className="text-sm font-medium text-gray-700">Logo URL</Label>
                                        <Input
                                            id="chapa_logo"
                                            type="text"
                                            value={chapaPaymentForm.data.logo}
                                            onChange={(e) => chapaPaymentForm.setData('logo', e.target.value)}
                                            placeholder="e.g., /image/telebirr-logo.png"
                                            className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                        {chapaPaymentForm.errors.logo && (
                                            <p className="text-sm text-red-600 mt-1">{chapaPaymentForm.errors.logo}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="chapa_sort_order" className="text-sm font-medium text-gray-700">Sort Order</Label>
                                            <Input
                                                id="chapa_sort_order"
                                                type="number"
                                                value={chapaPaymentForm.data.sort_order}
                                                onChange={(e) => chapaPaymentForm.setData('sort_order', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                className="mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                min="0"
                                            />
                                            {chapaPaymentForm.errors.sort_order && (
                                                <p className="text-sm text-red-600 mt-1">{chapaPaymentForm.errors.sort_order}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 pt-8">
                                            <input
                                                type="checkbox"
                                                id="chapa_is_active"
                                                checked={chapaPaymentForm.data.is_active}
                                                onChange={(e) => chapaPaymentForm.setData('is_active', e.target.checked)}
                                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                            />
                                            <Label htmlFor="chapa_is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                                                Active
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddChapaPaymentModal(false);
                                            chapaPaymentForm.reset();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={chapaPaymentForm.processing}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        {chapaPaymentForm.processing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Creating...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                Create Payment Method
                                            </div>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </AppLayout>
        </>
    );
}
