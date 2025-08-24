import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import MainLayout from '@/layouts/app/main-layout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Building, CreditCard, Smartphone, Upload } from 'lucide-react';
import React, { useState } from 'react';

interface PaymentProcessProps {
    order_id: string;
    total_amount: number;
    currency: string;
    customer_email: string;
    customer_name: string;
    payment_method_type?: string; // 'offline' or null
    offlinePaymentMethods?: Array<{
        id: number;
        name: string;
        type: string;
        description: string;
        instructions: string;
        details: any;
    }>;
}

export default function PaymentProcess({
    order_id,
    total_amount,
    currency,
    customer_email,
    customer_name,
    payment_method_type,
    offlinePaymentMethods = [],
}: PaymentProcessProps) {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [selectedOfflineMethod, setSelectedOfflineMethod] = useState('');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === 'ETB' ? 'USD' : currency,
        })
            .format(price)
            .replace('$', currency + ' ');
    };

    // Form for regular Chapa payment
    const chapaForm = useForm({
        payment_method: 'telebirr',
        customer_name: customer_name,
        customer_email: customer_email,
        customer_phone: '',
        order_id: order_id,
        amount: total_amount,
        currency: currency,
    });

    // Form for offline payment submission
    const offlineForm = useForm({
        order_id: order_id,
        amount: total_amount,
        currency: currency,
        offline_payment_method_id: '',
        payment_reference: '',
        payment_notes: '',
        payment_screenshot: null as File | null,
    });

    const handleChapaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        chapaForm.post(route('payment.process'));
    };

    const handleOfflineSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOfflineMethod) {
            alert('Please select a payment method');
            return;
        }
        if (!offlineForm.data.payment_screenshot) {
            alert('Please upload a payment screenshot');
            return;
        }

        offlineForm.data.offline_payment_method_id = selectedOfflineMethod;
        offlineForm.post(route('payment.offline.submit'));
    };

    if (payment_method_type === 'offline') {
        // Render offline payment form
        return (
            <MainLayout title="Upload Payment Proof">
            <div className="min-h-screen bg-gray-50 py-8">
                <Head title="Upload Payment Proof" />

                <div className="mx-auto max-w-4xl px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="mb-4 flex items-center gap-4">
                            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Upload Payment Proof</h1>
                                <p className="text-gray-600">
                                    Order ID: {order_id} | Amount: {formatPrice(total_amount)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Payment Method Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Select Payment Method</CardTitle>
                                <CardDescription>Choose how you made the payment</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={selectedOfflineMethod} onValueChange={setSelectedOfflineMethod} className="space-y-4">
                                    {offlinePaymentMethods.map((method) => (
                                        <div key={method.id} className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value={method.id.toString()} id={`method-${method.id}`} />
                                                <Label htmlFor={`method-${method.id}`} className="cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        {method.type === 'bank' ? (
                                                            <Building className="h-5 w-5 text-blue-600" />
                                                        ) : (
                                                            <Smartphone className="h-5 w-5 text-green-600" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium">{method.name}</p>
                                                            <p className="text-sm text-gray-600">{method.description}</p>
                                                        </div>
                                                    </div>
                                                </Label>
                                            </div>

                                            {selectedOfflineMethod === method.id.toString() && (
                                                <div className="ml-6 rounded-lg bg-gray-50 p-4">
                                                    <h4 className="mb-2 font-medium text-gray-900">Payment Instructions:</h4>
                                                    <p className="mb-3 text-sm text-gray-700">{method.instructions}</p>

                                                    <div className="rounded border bg-white p-3">
                                                        <h5 className="mb-2 font-medium text-gray-900">Payment Details:</h5>
                                                        <div className="space-y-1 text-sm">
                                                            {Object.entries(method.details).map(([key, value]: [string, any]) => (
                                                                <div key={key} className="flex justify-between">
                                                                    <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                                                                    <span className="font-medium">{value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </RadioGroup>
                                {offlineForm.errors.offline_payment_method_id && (
                                    <p className="mt-2 text-sm text-red-600">{offlineForm.errors.offline_payment_method_id}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Details Form */}
                        {selectedOfflineMethod && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Details</CardTitle>
                                        <CardDescription>Provide details about your payment</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="payment_reference">Payment Reference (Optional)</Label>
                                            <Input
                                                id="payment_reference"
                                                placeholder="Transaction ID, reference number, etc."
                                                value={offlineForm.data.payment_reference}
                                                onChange={(e) => offlineForm.setData('payment_reference', e.target.value)}
                                            />
                                            {offlineForm.errors.payment_reference && (
                                                <p className="mt-1 text-sm text-red-600">{offlineForm.errors.payment_reference}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="payment_notes">Additional Notes (Optional)</Label>
                                            <Textarea
                                                id="payment_notes"
                                                placeholder="Any additional information about your payment..."
                                                rows={3}
                                                value={offlineForm.data.payment_notes}
                                                onChange={(e) => offlineForm.setData('payment_notes', e.target.value)}
                                            />
                                            {offlineForm.errors.payment_notes && (
                                                <p className="mt-1 text-sm text-red-600">{offlineForm.errors.payment_notes}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Upload Payment Screenshot</CardTitle>
                                        <CardDescription>Upload a clear screenshot of your payment confirmation (Max 5MB)</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div>
                                            <Label htmlFor="payment_screenshot">Payment Screenshot *</Label>
                                            <Input
                                                id="payment_screenshot"
                                                type="file"
                                                accept="image/*"
                                                required
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        offlineForm.setData('payment_screenshot', file);
                                                    }
                                                }}
                                                className="mt-1"
                                            />
                                            {offlineForm.errors.payment_screenshot && (
                                                <p className="mt-1 text-sm text-red-600">{offlineForm.errors.payment_screenshot}</p>
                                            )}
                                            <p className="mt-2 text-sm text-gray-600">Accepted formats: JPG, PNG, GIF. Maximum size: 5MB</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Button
                                    type="button"
                                    onClick={handleOfflineSubmit}
                                    className="w-full bg-orange-600 hover:bg-orange-700"
                                    disabled={offlineForm.processing}
                                >
                                    {offlineForm.processing ? (
                                        'Submitting...'
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Submit Payment Proof
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            </MainLayout>
        );
    }

    // Render regular Chapa payment form
    return (
        <MainLayout title="Complete Payment">

        <div className="min-h-screen bg-gray-50 py-8">
            <Head title="Complete Payment" />

            <div className="mx-auto max-w-2xl px-4">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 flex items-center justify-center flex-col gap-4">
                        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
                            <p className="text-gray-600">Order ID: {order_id}</p>
                        </div>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4">
                        <p className="text-lg font-semibold text-blue-900">Total Amount: {formatPrice(total_amount)}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Information
                        </CardTitle>
                        <CardDescription>Complete your payment using Chapa secure payment gateway</CardDescription>
                      </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid sm:grid-cols-2 items-center 
                            grid-cols-1 gap-4">
                                <div>
                                    <Label htmlFor="customer_name">Full Name *</Label>
                                    <Input
                                        id="customer_name"
                                        required
                                        value={chapaForm.data.customer_name}
                                        onChange={(e) => chapaForm.setData('customer_name', e.target.value)}
                                    />
                                    {chapaForm.errors.customer_name && <p className="mt-1 text-sm text-red-600">{chapaForm.errors.customer_name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="customer_email">Email *</Label>
                                    <Input
                                        id="customer_email"
                                        type="email"
                                        required
                                        value={chapaForm.data.customer_email}
                                        onChange={(e) => chapaForm.setData('customer_email', e.target.value)}
                                    />
                                    {chapaForm.errors.customer_email && (
                                        <p className="mt-1 text-sm text-red-600">{chapaForm.errors.customer_email}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="customer_phone">Phone Number</Label>
                                <Input
                                    id="customer_phone"
                                    placeholder="+251..."
                                    value={chapaForm.data.customer_phone}
                                    onChange={(e) => chapaForm.setData('customer_phone', e.target.value)}
                                />
                                {chapaForm.errors.customer_phone && <p className="mt-1 text-sm text-red-600">{chapaForm.errors.customer_phone}</p>}
                            </div>

                            <div>
                                <Label htmlFor="payment_method">Payment Method *</Label>
                                <RadioGroup
                                    value={chapaForm.data.payment_method}
                                    onValueChange={(value) => chapaForm.setData('payment_method', value)}
                                    className="mt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="telebirr" id="telebirr" />
                                        <Label htmlFor="telebirr">Telebirr</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="cbe" id="cbe" />
                                        <Label htmlFor="cbe">CBE Birr</Label>
                                    </div>
                                </RadioGroup>
                                {chapaForm.errors.payment_method && <p className="mt-1 text-sm text-red-600">{chapaForm.errors.payment_method}</p>}
                            </div>

                            <Button
                                type="button"
                                onClick={handleChapaSubmit}
                                className="w-full bg-orange-600 hover:bg-orange-700"
                                disabled={chapaForm.processing}
                            >
                                {chapaForm.processing ? (
                                    'Processing...'
                                ) : (
                                    <>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Pay {formatPrice(total_amount)}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
        </MainLayout>
    );
}
