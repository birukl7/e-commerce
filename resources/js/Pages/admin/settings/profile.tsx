/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout';
import { adminNavItems } from '@/constants/adminNavItems';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState, FormEventHandler, useRef } from 'react';
import {
    User,
    Mail,
    Phone,
    Shield,
    KeyRound,
    MapPin,
    Building,
    Compass,
    CheckCircle2,
    Camera,
    Save,
    Sparkles,
    Calendar,
    BadgeCheck,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Address {
    id?: number;
    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
    phone?: string | null;
}

interface AdminProfileProps {
    mustVerifyEmail: boolean;
    status?: string;
    address?: Address | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin-dashboard',
    },
    {
        title: 'Admin Settings',
        href: '/settings/admin/profile',
    },
];

export default function AdminProfile({ mustVerifyEmail, status, address }: AdminProfileProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // Theme color state with localStorage persistence and real-time syncing
    const [primaryColor, setPrimaryColor] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            try {
                return localStorage.getItem('serdo_dashboard_primary_color') || '#1E5338';
            } catch {
                return '#1E5338';
            }
        }
        return '#1E5338';
    });

    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'address'>('profile');
    const [imagePreview, setImagePreview] = useState<string | null>(
        user?.avatar || (user as any)?.profile_image_url || null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleThemeChange = (e: any) => {
            const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
            if (color) setPrimaryColor(color);
        };
        window.addEventListener('serdo:theme-color-changed', handleThemeChange);
        window.addEventListener('theme-color-changed', handleThemeChange);
        return () => {
            window.removeEventListener('serdo:theme-color-changed', handleThemeChange);
            window.removeEventListener('theme-color-changed', handleThemeChange);
        };
    }, []);

    // Profile form
    const profileForm = useForm<{
        name: string;
        email: string;
        phone: string;
        profile_image: File | null;
        _method: string;
    }>({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        profile_image: null,
        _method: 'PATCH',
    });

    // Password form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Address form
    const addressForm = useForm({
        address_line_1: address?.address_line_1 || '',
        address_line_2: address?.address_line_2 || '',
        city: address?.city || '',
        state: address?.state || '',
        postal_code: address?.postal_code || '',
        country: address?.country || 'Ethiopia',
        phone: address?.phone || (user as any).phone || '',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setData('profile_image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submitProfile: FormEventHandler = (e) => {
        e.preventDefault();
        profileForm.post(route('admin.profile.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const submitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put(route('admin.password.update'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const submitAddress: FormEventHandler = (e) => {
        e.preventDefault();
        addressForm.put(route('settings.address.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Admin Profile & Settings | Serdo Admin" />

            <div className="min-h-screen bg-[#F6F8FA] p-4 sm:p-6 lg:p-8 font-sans text-neutral-900 transition-colors duration-300">
                <div className="max-w-[1440px] mx-auto space-y-6">

                    {/* ========================================================== */}
                    {/* TITLE ROW: Donezo-Styled Header & Admin Hero               */}
                    {/* ========================================================== */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin Portal</span>
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                <span className="text-xs font-medium text-emerald-600">Active Session</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                                Admin Settings & Profile
                            </h1>
                            <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-normal">
                                Manage your administrator credentials, personal details, security keys, and operating preferences.
                            </p>
                        </div>

                        {/* Top quick badge */}
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
                                <Shield className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-bold text-neutral-700">Role: Administrator</span>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================== */}
                    {/* HERO OVERVIEW CARD: Admin Summary                         */}
                    {/* ========================================================== */}
                    <div className="relative overflow-hidden rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6 md:p-8">
                        <div
                            className="absolute -right-24 -top-24 w-96 h-96 rounded-full opacity-10 pointer-events-none blur-3xl transition-all duration-700"
                            style={{ backgroundColor: primaryColor }}
                        />

                        <div className="relative flex flex-col md:flex-row md:items-center gap-6 justify-between">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                {/* Avatar with change button */}
                                <div className="relative group shrink-0">
                                    <div
                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-bold bg-neutral-900"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            user.name ? user.name.slice(0, 2).toUpperCase() : 'AD'
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-neutral-200 shadow hover:bg-neutral-50 transition-all text-neutral-700 hover:text-neutral-900 active:scale-95"
                                        title="Change profile avatar"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>

                                {/* User Meta */}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">{user.name}</h2>
                                        <BadgeCheck className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                                        {user.email}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <span
                                            className="px-2.5 py-1 rounded-full text-white text-[11px] font-semibold shadow-xs"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            System Administrator
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-medium flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-neutral-400" />
                                            Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status message alert if any */}
                            {(status === 'profile-updated' || status === 'password-updated' || status === 'address-updated') && (
                                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>
                                        {status === 'profile-updated' && 'Admin profile information saved successfully!'}
                                        {status === 'password-updated' && 'Your password has been securely updated!'}
                                        {status === 'address-updated' && 'Administrative shipping & contact address updated!'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ========================================================== */}
                    {/* TAB SWITCHER: Donezo-Styled Capsule Navigation             */}
                    {/* ========================================================== */}
                    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/80 shadow-xs w-fit">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                activeTab === 'profile'
                                    ? 'text-white shadow-xs'
                                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                            }`}
                            style={activeTab === 'profile' ? { backgroundColor: primaryColor } : undefined}
                        >
                            <User className="w-3.5 h-3.5" />
                            <span>Profile Details</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('password')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                activeTab === 'password'
                                    ? 'text-white shadow-xs'
                                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                            }`}
                            style={activeTab === 'password' ? { backgroundColor: primaryColor } : undefined}
                        >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Security & Password</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('address')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                activeTab === 'address'
                                    ? 'text-white shadow-xs'
                                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                            }`}
                            style={activeTab === 'address' ? { backgroundColor: primaryColor } : undefined}
                        >
                            <Building className="w-3.5 h-3.5" />
                            <span>HQ / Business Address</span>
                        </button>
                    </div>

                    {/* ========================================================== */}
                    {/* TAB CONTENT SECTIONS                                       */}
                    {/* ========================================================== */}

                    {/* 1. PROFILE DETAILS TAB */}
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6 md:p-8">
                                <div className="flex items-center gap-3 pb-5 border-b border-neutral-100">
                                    <div
                                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-neutral-900">Administrator Information</h3>
                                        <p className="text-xs text-neutral-500">Update your account name, contact email and primary phone number.</p>
                                    </div>
                                </div>

                                <form onSubmit={submitProfile} className="space-y-5 mt-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="admin_name" className="text-xs font-bold text-neutral-700">Full Name</Label>
                                            <div className="relative">
                                                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                                                <Input
                                                    id="admin_name"
                                                    type="text"
                                                    value={profileForm.data.name}
                                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                                    required
                                                    className="pl-10 h-11 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white text-sm"
                                                    placeholder="Administrator Name"
                                                />
                                            </div>
                                            <InputError message={profileForm.errors.name} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="admin_email" className="text-xs font-bold text-neutral-700">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                                                <Input
                                                    id="admin_email"
                                                    type="email"
                                                    value={profileForm.data.email}
                                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                                    required
                                                    className="pl-10 h-11 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white text-sm"
                                                    placeholder="admin@store.com"
                                                />
                                            </div>
                                            <InputError message={profileForm.errors.email} />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="admin_phone" className="text-xs font-bold text-neutral-700">Contact Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                                            <Input
                                                id="admin_phone"
                                                type="tel"
                                                value={profileForm.data.phone}
                                                onChange={(e) => profileForm.setData('phone', e.target.value)}
                                                className="pl-10 h-11 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white text-sm"
                                                placeholder="0911223344 or +251911223344"
                                            />
                                        </div>
                                        <InputError message={profileForm.errors.phone} />
                                        <p className="text-[11px] text-neutral-400">Used for transaction alert SMS and order fulfillment escalation.</p>
                                    </div>

                                    {mustVerifyEmail && user.email_verified_at === null && (
                                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs">
                                            <p>Your admin email address is unverified.</p>
                                            <Link
                                                href={route('verification.send')}
                                                method="post"
                                                as="button"
                                                className="font-bold underline mt-1 text-amber-900 hover:text-amber-950"
                                            >
                                                Click here to re-send the verification link.
                                            </Link>
                                        </div>
                                    )}

                                    <div className="pt-4 flex items-center justify-between border-t border-neutral-100">
                                        <Button
                                            type="submit"
                                            disabled={profileForm.processing}
                                            className="px-6 py-2.5 rounded-xl text-white font-semibold text-xs shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <Save className="w-3.5 h-3.5" />
                                            <span>{profileForm.processing ? 'Saving...' : 'Save Profile Changes'}</span>
                                        </Button>

                                        <Transition
                                            show={profileForm.recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Saved successfully
                                            </p>
                                        </Transition>
                                    </div>
                                </form>
                            </div>

                            {/* Sidebar info card */}
                            <div className="space-y-5">
                                <div className="rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6">
                                    <div className="flex items-center gap-2 text-neutral-800 font-bold text-sm mb-3">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        <h4>Administrator Privileges</h4>
                                    </div>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        As a verified store administrator, you have full access to manage catalog inventory, configure site fiscal policies, review offline payment proofs, and approve supplier products.
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2.5 text-xs text-neutral-600">
                                        <div className="flex items-center justify-between">
                                            <span>Catalog Management</span>
                                            <span className="font-semibold text-emerald-600">Enabled</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Payment Approvals</span>
                                            <span className="font-semibold text-emerald-600">Enabled</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Fiscal & Tax Rules</span>
                                            <span className="font-semibold text-emerald-600">Enabled</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. SECURITY & PASSWORD TAB */}
                    {activeTab === 'password' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6 md:p-8">
                                <div className="flex items-center gap-3 pb-5 border-b border-neutral-100">
                                    <div
                                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <KeyRound className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-neutral-900">Security & Authentication</h3>
                                        <p className="text-xs text-neutral-500">Ensure your administrative login utilizes a strong, unique passphrase.</p>
                                    </div>
                                </div>

                                <form onSubmit={submitPassword} className="space-y-5 mt-6">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="current_password" className="text-xs font-bold text-neutral-700">Current Password</Label>
                                        <Input
                                            id="current_password"
                                            type="password"
                                            value={passwordForm.data.current_password}
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            required
                                            className="h-11 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white text-sm"
                                            placeholder="Enter your current password"
                                        />
                                        <InputError message={passwordForm.errors.current_password} />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="new_password" className="text-xs font-bold text-neutral-700">New Password</Label>
                                            <Input
                                                id="new_password"
                                                type="password"
                                                value={passwordForm.data.password}
                                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                required
                                                className="h-11 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white text-sm"
                                                placeholder="Minimum 8 characters"
                                            />
                                            <InputError message={passwordForm.errors.password} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="new_password_confirmation" className="text-xs font-bold text-neutral-700">Confirm New Password</Label>
                                            <Input
                                                id="new_password_confirmation"
                                                type="password"
                                                value={passwordForm.data.password_confirmation}
                                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                required
                                                className="h-11 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white text-sm"
                                                placeholder="Re-enter new password"
                                            />
                                            <InputError message={passwordForm.errors.password_confirmation} />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-neutral-100">
                                        <Button
                                            type="submit"
                                            disabled={passwordForm.processing}
                                            className="px-6 py-2.5 rounded-xl text-white font-semibold text-xs shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <Shield className="w-3.5 h-3.5" />
                                            <span>{passwordForm.processing ? 'Updating...' : 'Update Password'}</span>
                                        </Button>

                                        <Transition
                                            show={passwordForm.recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Password updated
                                            </p>
                                        </Transition>
                                    </div>
                                </form>
                            </div>

                            <div className="space-y-5">
                                <div className="rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6">
                                    <div className="flex items-center gap-2 text-neutral-800 font-bold text-sm mb-3">
                                        <Shield className="w-4 h-4 text-emerald-600" />
                                        <h4>Password Guidelines</h4>
                                    </div>
                                    <ul className="text-xs text-neutral-500 space-y-2 list-disc pl-4">
                                        <li>Must contain at least 8 characters.</li>
                                        <li>Include at least one uppercase letter (A-Z).</li>
                                        <li>Include at least one lowercase letter (a-z).</li>
                                        <li>Include at least one number (0-9).</li>
                                        <li>Include at least one special symbol (@, $, !, %, *, ?, &).</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. BUSINESS / HQ ADDRESS TAB */}
                    {activeTab === 'address' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6 md:p-8">
                                <div className="flex items-center gap-3 pb-5 border-b border-neutral-100">
                                    <div
                                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <Building className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-neutral-900">Headquarters & Operating Address</h3>
                                        <p className="text-xs text-neutral-500">Default physical address used for business receipts, invoices, and supplier dispatches.</p>
                                    </div>
                                </div>

                                <form onSubmit={submitAddress} className="space-y-5 mt-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 sm:col-span-2">
                                            <Label htmlFor="address_line_1" className="text-xs font-bold text-neutral-700">Street Address</Label>
                                            <Input
                                                id="address_line_1"
                                                type="text"
                                                value={addressForm.data.address_line_1}
                                                onChange={(e) => addressForm.setData('address_line_1', e.target.value)}
                                                required
                                                className="h-11 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white text-sm"
                                                placeholder="Bole Sub-city, Street 123"
                                            />
                                            <InputError message={addressForm.errors.address_line_1} />
                                        </div>

                                        <div className="space-y-1.5 sm:col-span-2">
                                            <Label htmlFor="address_line_2" className="text-xs font-bold text-neutral-700">Suite / Building / Floor (Optional)</Label>
                                            <Input
                                                id="address_line_2"
                                                type="text"
                                                value={addressForm.data.address_line_2}
                                                onChange={(e) => addressForm.setData('address_line_2', e.target.value)}
                                                className="h-11 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white text-sm"
                                                placeholder="Floor 4, Office 402"
                                            />
                                            <InputError message={addressForm.errors.address_line_2} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="city" className="text-xs font-bold text-neutral-700">City</Label>
                                            <Input
                                                id="city"
                                                type="text"
                                                value={addressForm.data.city}
                                                onChange={(e) => addressForm.setData('city', e.target.value)}
                                                required
                                                className="h-11 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white text-sm"
                                                placeholder="Addis Ababa"
                                            />
                                            <InputError message={addressForm.errors.city} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="state" className="text-xs font-bold text-neutral-700">Region / State</Label>
                                            <Input
                                                id="state"
                                                type="text"
                                                value={addressForm.data.state}
                                                onChange={(e) => addressForm.setData('state', e.target.value)}
                                                required
                                                className="h-11 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white text-sm"
                                                placeholder="Addis Ababa"
                                            />
                                            <InputError message={addressForm.errors.state} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="postal_code" className="text-xs font-bold text-neutral-700">Postal Code</Label>
                                            <Input
                                                id="postal_code"
                                                type="text"
                                                value={addressForm.data.postal_code}
                                                onChange={(e) => addressForm.setData('postal_code', e.target.value)}
                                                className="h-11 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white text-sm"
                                                placeholder="1000"
                                            />
                                            <InputError message={addressForm.errors.postal_code} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="country" className="text-xs font-bold text-neutral-700">Country</Label>
                                            <Input
                                                id="country"
                                                type="text"
                                                value={addressForm.data.country}
                                                onChange={(e) => addressForm.setData('country', e.target.value)}
                                                required
                                                className="h-11 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white text-sm"
                                                placeholder="Ethiopia"
                                            />
                                            <InputError message={addressForm.errors.country} />
                                        </div>

                                        <div className="space-y-1.5 sm:col-span-2">
                                            <Label htmlFor="contact_phone" className="text-xs font-bold text-neutral-700">Dispatch / Contact Phone</Label>
                                            <Input
                                                id="contact_phone"
                                                type="tel"
                                                value={addressForm.data.phone}
                                                onChange={(e) => addressForm.setData('phone', e.target.value)}
                                                className="h-11 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white text-sm"
                                                placeholder="09XXXXXXXX"
                                            />
                                            <InputError message={addressForm.errors.phone} />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-neutral-100">
                                        <Button
                                            type="submit"
                                            disabled={addressForm.processing}
                                            className="px-6 py-2.5 rounded-xl text-white font-semibold text-xs shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>{addressForm.processing ? 'Saving...' : 'Save HQ Address'}</span>
                                        </Button>

                                        <Transition
                                            show={addressForm.recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Address updated
                                            </p>
                                        </Transition>
                                    </div>
                                </form>
                            </div>

                            <div className="space-y-5">
                                <div className="rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6">
                                    <div className="flex items-center gap-2 text-neutral-800 font-bold text-sm mb-3">
                                        <Compass className="w-4 h-4 text-emerald-600" />
                                        <h4>Fiscal & Logistics Presence</h4>
                                    </div>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        This headquarters address will automatically appear in your customer PDF receipts, payment clearance slips, and tax exemption filings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AppLayout>
    );
}
