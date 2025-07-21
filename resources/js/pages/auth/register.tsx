import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Ethiopia',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onSuccess: () => {
                // Handle successful registration - Inertia will handle redirect automatically
            },
            onError: (errors) => {
                // Handle registration errors
                console.log('Registration errors:', errors);
            }
        });
    };

    return (
        <AuthLayout 
            title="Create an account" 
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    {/* Basic Information */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Enter your full name"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number (Optional)</Label>
                        <Input
                            id="phone"
                            type="tel"
                            tabIndex={3}
                            autoComplete="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            disabled={processing}
                            placeholder="+251912345678"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                        <p className="text-xs text-muted-foreground">
                            Password must contain at least 8 characters with uppercase, lowercase, number, and special character.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={5}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    {/* Optional Address Information */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">
                            Address Information (Optional)
                        </h3>
                        
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="address_line_1">Address Line 1</Label>
                                <Input
                                    id="address_line_1"
                                    type="text"
                                    tabIndex={6}
                                    value={data.address_line_1}
                                    onChange={(e) => setData('address_line_1', e.target.value)}
                                    disabled={processing}
                                    placeholder="Street address"
                                />
                                <InputError message={errors.address_line_1} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address_line_2">Address Line 2</Label>
                                <Input
                                    id="address_line_2"
                                    type="text"
                                    tabIndex={7}
                                    value={data.address_line_2}
                                    onChange={(e) => setData('address_line_2', e.target.value)}
                                    disabled={processing}
                                    placeholder="Apartment, suite, etc."
                                />
                                <InputError message={errors.address_line_2} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        tabIndex={8}
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        disabled={processing}
                                        placeholder="City"
                                    />
                                    <InputError message={errors.city} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="state">State/Region</Label>
                                    <Input
                                        id="state"
                                        type="text"
                                        tabIndex={9}
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        disabled={processing}
                                        placeholder="State/Region"
                                    />
                                    <InputError message={errors.state} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="postal_code">Postal Code</Label>
                                    <Input
                                        id="postal_code"
                                        type="text"
                                        tabIndex={10}
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        disabled={processing}
                                        placeholder="Postal code"
                                    />
                                    <InputError message={errors.postal_code} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        type="text"
                                        tabIndex={11}
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        disabled={processing}
                                        placeholder="Country"
                                    />
                                    <InputError message={errors.country} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="mt-4 w-full" 
                        tabIndex={12} 
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={13}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}