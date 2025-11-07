import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import MainLayout from '@/layouts/app/main-layout';
import {
    Bookmark,
    ShoppingBag,
    MessageSquare,
    Package2,
    LayoutDashboard,
    Settings as SettingsIcon,
} from 'lucide-react';
const userNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/user-dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'BookMarked Products',
        href: '/user-wishlist',
        icon: Bookmark,
    },
    {
        title: 'Orders',
        href: '/user-order',
        icon: ShoppingBag,
    },
    {
        title: 'Requests',
        href: '/user-request',
        icon: MessageSquare,
    },
    {
        title: 'Bought Products',
        href: '/user-products',
        icon: Package2,
    },
    {
        title: 'Settings',
        href: '/settings/profile',
        icon: SettingsIcon,
    },
];


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
    phone: string;
};

type AddressForm = {
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
};

type Address = {
    id?: number;
    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
    phone?: string | null;
};

interface ProfileProps {
    mustVerifyEmail: boolean;
    status?: string;
    address?: Address | null;
}

export default function Profile({ mustVerifyEmail, status, address }: ProfileProps) {
    const { auth } = usePage<SharedData>().props;
    const userPhone = (auth.user.phone as string | null | undefined) ?? '';

    const profileForm = useForm<ProfileForm>({
        name: auth.user.name ?? '',
        email: auth.user.email ?? '',
        phone: userPhone,
    });

    const addressForm = useForm<AddressForm>({
        address_line_1: address?.address_line_1 ?? '',
        address_line_2: address?.address_line_2 ?? '',
        city: address?.city ?? '',
        state: address?.state ?? '',
        postal_code: address?.postal_code ?? '',
        country: address?.country ?? 'Ethiopia',
        phone: address?.phone ?? userPhone,
    });

    useEffect(() => {
        addressForm.setData({
            address_line_1: address?.address_line_1 ?? '',
            address_line_2: address?.address_line_2 ?? '',
            city: address?.city ?? '',
            state: address?.state ?? '',
            postal_code: address?.postal_code ?? '',
            country: address?.country ?? 'Ethiopia',
            phone: address?.phone ?? userPhone,
        });
        addressForm.setDefaults({
            address_line_1: address?.address_line_1 ?? '',
            address_line_2: address?.address_line_2 ?? '',
            city: address?.city ?? '',
            state: address?.state ?? '',
            postal_code: address?.postal_code ?? '',
            country: address?.country ?? 'Ethiopia',
            phone: address?.phone ?? userPhone,
        });
    }, [address, userPhone]);

    const submitProfile: FormEventHandler = (e) => {
        e.preventDefault();

        profileForm.patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const submitAddress: FormEventHandler = (e) => {
        e.preventDefault();

        addressForm.put(route('settings.address.update'), {
            preserveScroll: true,
        });
    };

    return (
        <MainLayout title="User Settings" className={''} footerOff={false} contentMarginTop="mt-[60px]">
            <AppLayout
                logoDisplay=" invisible"
                sidebarStyle="mt-[20px]"
                breadcrumbs={breadcrumbs}
                mainNavItems={userNavItems}
                footerNavItems={[]}
            >
                <Head title="Profile settings" />

                <div className="flex h-full flex-1 flex-col gap-10 rounded-xl p-6 overflow-x-auto">
                    <section className="space-y-6 rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                        <HeadingSmall title="Profile information" description="Update your personal details" />

                        <form onSubmit={submitProfile} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError className="mt-2" message={profileForm.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={profileForm.data.email}
                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError className="mt-2" message={profileForm.errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone number</Label>

                                <Input
                                    id="phone"
                                    type="tel"
                                    className="mt-1 block w-full"
                                    value={profileForm.data.phone}
                                    onChange={(e) => profileForm.setData('phone', e.target.value)}
                                    autoComplete="tel"
                                    placeholder="09XXXXXXXX"
                                />

                                <InputError className="mt-2" message={profileForm.errors.phone} />
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div>
                                    <p className="-mt-4 text-sm text-muted-foreground">
                                        Your email address is unverified.{' '}
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                        >
                                            Click here to resend the verification email.
                                        </Link>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            A new verification link has been sent to your email address.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button disabled={profileForm.processing}>Save changes</Button>

                                <Transition
                                    show={profileForm.recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">Saved</p>
                                </Transition>
                            </div>
                        </form>
                    </section>

                    <section className="space-y-6 rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                        <HeadingSmall title="Address information" description="Manage your default shipping address" />

                        <form onSubmit={submitAddress} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address_line_1">Street Address</Label>
                                    <Input
                                        id="address_line_1"
                                        className="h-11"
                                        value={addressForm.data.address_line_1}
                                        onChange={(e) => addressForm.setData('address_line_1', e.target.value)}
                                        required
                                        autoComplete="address-line1"
                                        placeholder="123 Main Street"
                                    />
                                    <InputError message={addressForm.errors.address_line_1} />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address_line_2">Apartment / Suite</Label>
                                    <Input
                                        id="address_line_2"
                                        className="h-11"
                                        value={addressForm.data.address_line_2}
                                        onChange={(e) => addressForm.setData('address_line_2', e.target.value)}
                                        autoComplete="address-line2"
                                        placeholder="Apt 4B, Suite 100"
                                    />
                                    <InputError message={addressForm.errors.address_line_2} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        className="h-11"
                                        value={addressForm.data.city}
                                        onChange={(e) => addressForm.setData('city', e.target.value)}
                                        required
                                        autoComplete="address-level2"
                                        placeholder="Addis Ababa"
                                    />
                                    <InputError message={addressForm.errors.city} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">State / Region</Label>
                                    <Input
                                        id="state"
                                        className="h-11"
                                        value={addressForm.data.state}
                                        onChange={(e) => addressForm.setData('state', e.target.value)}
                                        required
                                        autoComplete="address-level1"
                                        placeholder="Addis Ababa"
                                    />
                                    <InputError message={addressForm.errors.state} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Postal Code</Label>
                                    <Input
                                        id="postal_code"
                                        className="h-11"
                                        value={addressForm.data.postal_code}
                                        onChange={(e) => addressForm.setData('postal_code', e.target.value)}
                                        autoComplete="postal-code"
                                        placeholder="1000"
                                    />
                                    <InputError message={addressForm.errors.postal_code} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        className="h-11"
                                        value={addressForm.data.country}
                                        onChange={(e) => addressForm.setData('country', e.target.value)}
                                        required
                                        autoComplete="country-name"
                                        placeholder="Ethiopia"
                                    />
                                    <InputError message={addressForm.errors.country} />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address_phone">Contact Phone</Label>
                                    <Input
                                        id="address_phone"
                                        type="tel"
                                        className="h-11"
                                        value={addressForm.data.phone}
                                        onChange={(e) => addressForm.setData('phone', e.target.value)}
                                        autoComplete="tel"
                                        placeholder="09XXXXXXXX"
                                    />
                                    <InputError message={addressForm.errors.phone} />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={addressForm.processing}>
                                    Save address
                                </Button>

                                <Transition
                                    show={addressForm.recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">Saved</p>
                                </Transition>

                                {status === 'address-updated' && (
                                    <p className="text-sm text-green-600">Address updated successfully.</p>
                                )}
                            </div>
                        </form>
                    </section>

                    <section className="rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                        <DeleteUser />
                    </section>
                </div>
            </AppLayout>
        </MainLayout>
    );
}
