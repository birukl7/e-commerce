import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, LoaderCircle, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

import AppLogo from '@/components/app-logo';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Email Verification" />

            <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Header with Logo */}
                    <div className="text-center">
                        <div className="mb-6 flex items-center justify-center">
                            <AppLogo />
                        </div>
                        <h1 className="text-3xl font-semibold text-foreground">Check Your Email</h1>
                        <p className="mt-2 text-muted-foreground">We've sent a verification link to your email address</p>
                    </div>

                    {/* Main Content Card */}
                    <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
                        {/* Email Icon */}
                        <div className="mb-6 flex items-center justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Mail className="h-8 w-8 text-primary" />
                            </div>
                        </div>

                        {/* Success Message */}
                        {status === 'verification-link-sent' && (
                            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                                <div className="flex items-center">
                                    <CheckCircle2 className="mr-3 h-5 w-5 flex-shrink-0 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Verification email sent!</p>
                                        <p className="mt-1 text-sm text-green-700">A new verification link has been sent to your email address.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="mb-8 text-center">
                            <p className="leading-relaxed text-muted-foreground">
                                Please check your email and click on the verification link to complete your account setup. The link will expire in 60
                                minutes.
                            </p>
                        </div>

                        {/* Resend Form */}
                        <form onSubmit={submit} className="space-y-6">
                            <Button type="submit" disabled={processing} className="w-full" variant="secondary">
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {processing ? 'Sending...' : 'Resend Verification Email'}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-card px-2 text-muted-foreground">or</span>
                            </div>
                        </div>

                        {/* Additional Actions */}
                        <div className="space-y-4 text-center">
                            <TextLink
                                href={route('logout')}
                                method="post"
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Use a different account
                            </TextLink>
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="text-center">
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Didn't receive the email? Check your spam folder or contact support if you continue to have issues.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
