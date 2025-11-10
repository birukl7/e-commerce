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
import { useTranslation } from 'react-i18next';


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


    const { t } = useTranslation()

    const userNavItems: NavItem[] = [
        {
            title: t('header.dashboard'),
            href: '/user-dashboard',
            icon: LayoutDashboard,
        },
        {
            title: t('header.bookmarkedProducts'),
            href: '/user-wishlist',
            icon: Bookmark,
        },
        {
            title: t('header.orders'),
            href: '/user-order',
            icon: ShoppingBag,
        },
        {
            title: t('header.requests'),
            href: '/user-request',
            icon: MessageSquare,
        },
        {
            title: t('header.boughtProducts'),
            href: '/user-products',
            icon: Package2,
        },
        {
            title: t('header.settings'),
            href: '/settings/profile',
            icon: SettingsIcon,
        },
    ];
    
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('header.settings'),
            href: '/settings/profile',
        },
    ];


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
        <MainLayout title={t('header.settings')} className={''} footerOff={false} contentMarginTop="mt-[60px]">
            <AppLayout
                logoDisplay=" invisible"
                sidebarStyle="mt-[20px]"
                breadcrumbs={breadcrumbs}
                mainNavItems={userNavItems}
                footerNavItems={[]}
            >
                <Head title={t('header.settings')} />

                <div className="flex h-full flex-1 flex-col gap-10 rounded-xl p-6 overflow-x-auto">
                    <section className="space-y-6 rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                        <HeadingSmall title={t('settings.profileInformation') || 'Profile information'} description={t('settings.updatePersonalDetails') || 'Update your personal details'} />

                        <form onSubmit={submitProfile} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('settings.name') || 'Name'}</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder={t('settings.fullName') || 'Full name'}
                                />

                                <InputError className="mt-2" message={profileForm.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('settings.emailAddress') || 'Email address'}</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={profileForm.data.email}
                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder={t('settings.emailAddress') || 'Email address'}
                                />

                                <InputError className="mt-2" message={profileForm.errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">{t('settings.phoneNumber') || 'Phone number'}</Label>

                                <Input
                                    id="phone"
                                    type="tel"
                                    className="mt-1 block w-full"
                                    value={profileForm.data.phone}
                                    onChange={(e) => profileForm.setData('phone', e.target.value)}
                                    autoComplete="tel"
                                    placeholder={t('payment.ethiopianMobile') || '09XXXXXXXX'}
                                />

                                <InputError className="mt-2" message={profileForm.errors.phone} />
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div>
                                    <p className="-mt-4 text-sm text-muted-foreground">
                                        {t('settings.emailUnverified') || 'Your email address is unverified.'}{' '}
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                        >
                                            {t('settings.clickToResend') || 'Click here to resend the verification email.'}
                                        </Link>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            {t('settings.verificationLinkSent') || 'A new verification link has been sent to your email address.'}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button disabled={profileForm.processing}>{t('settings.saveChanges') || 'Save changes'}</Button>

                                <Transition
                                    show={profileForm.recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">{t('settings.saved') || 'Saved'}</p>
                                </Transition>
                            </div>
                        </form>
                    </section>

                    <section className="space-y-6 rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                        <HeadingSmall title={t('settings.addressInformation') || 'Address information'} description={t('settings.manageDefaultShipping') || 'Manage your default shipping address'} />

                        <form onSubmit={submitAddress} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address_line_1">{t('settings.streetAddress') || 'Street Address'}</Label>
                                    <Input
                                        id="address_line_1"
                                        className="h-11"
                                        value={addressForm.data.address_line_1}
                                        onChange={(e) => addressForm.setData('address_line_1', e.target.value)}
                                        required
                                        autoComplete="address-line1"
                                        placeholder={t('settings.streetAddressPlaceholder') || '123 Main Street'}
                                    />
                                    <InputError message={addressForm.errors.address_line_1} />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address_line_2">{t('settings.apartmentSuite') || 'Apartment / Suite'}</Label>
                                    <Input
                                        id="address_line_2"
                                        className="h-11"
                                        value={addressForm.data.address_line_2}
                                        onChange={(e) => addressForm.setData('address_line_2', e.target.value)}
                                        autoComplete="address-line2"
                                        placeholder={t('settings.apartmentSuitePlaceholder') || 'Apt 4B, Suite 100'}
                                    />
                                    <InputError message={addressForm.errors.address_line_2} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">{t('settings.city') || 'City'}</Label>
                                    <Input
                                        id="city"
                                        className="h-11"
                                        value={addressForm.data.city}
                                        onChange={(e) => addressForm.setData('city', e.target.value)}
                                        required
                                        autoComplete="address-level2"
                                        placeholder={t('settings.cityPlaceholder') || 'Addis Ababa'}
                                    />
                                    <InputError message={addressForm.errors.city} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">{t('settings.stateRegion') || 'State / Region'}</Label>
                                    <Input
                                        id="state"
                                        className="h-11"
                                        value={addressForm.data.state}
                                        onChange={(e) => addressForm.setData('state', e.target.value)}
                                        required
                                        autoComplete="address-level1"
                                        placeholder={t('settings.stateRegionPlaceholder') || 'Addis Ababa'}
                                    />
                                    <InputError message={addressForm.errors.state} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">{t('settings.postalCode') || 'Postal Code'}</Label>
                                    <Input
                                        id="postal_code"
                                        className="h-11"
                                        value={addressForm.data.postal_code}
                                        onChange={(e) => addressForm.setData('postal_code', e.target.value)}
                                        autoComplete="postal-code"
                                        placeholder={t('settings.postalCodePlaceholder') || '1000'}
                                    />
                                    <InputError message={addressForm.errors.postal_code} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">{t('settings.country') || 'Country'}</Label>
                                    <Input
                                        id="country"
                                        className="h-11"
                                        value={addressForm.data.country}
                                        onChange={(e) => addressForm.setData('country', e.target.value)}
                                        required
                                        autoComplete="country-name"
                                        placeholder={t('settings.countryPlaceholder') || 'Ethiopia'}
                                    />
                                    <InputError message={addressForm.errors.country} />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address_phone">{t('settings.contactPhone') || 'Contact Phone'}</Label>
                                    <Input
                                        id="address_phone"
                                        type="tel"
                                        className="h-11"
                                        value={addressForm.data.phone}
                                        onChange={(e) => addressForm.setData('phone', e.target.value)}
                                        autoComplete="tel"
                                        placeholder={t('payment.ethiopianMobile') || '09XXXXXXXX'}
                                    />
                                    <InputError message={addressForm.errors.phone} />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={addressForm.processing}>
                                    {t('settings.saveAddress') || 'Save address'}
                                </Button>

                                <Transition
                                    show={addressForm.recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">{t('settings.saved') || 'Saved'}</p>
                                </Transition>

                                {status === 'address-updated' && (
                                    <p className="text-sm text-green-600">{t('settings.addressUpdated') || 'Address updated successfully.'}</p>
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
