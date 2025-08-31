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

    // Debug logging
    console.log('PaymentProcess component props:', {
        order_id,
        total_amount,
        currency,
        customer_email,
        customer_name,
        payment_method_type,
        offlinePaymentMethods: offlinePaymentMethods.length,
        offlinePaymentMethodsData: offlinePaymentMethods
    });

    // Additional debugging for offline payment flow
    if (payment_method_type === 'offline') {
        console.log('Payment method type is offline, checking offline payment methods');
        console.log('Offline payment methods array:', offlinePaymentMethods);
        console.log('Offline payment methods length:', offlinePaymentMethods.length);
        console.log('First offline payment method:', offlinePaymentMethods[0]);
    } else {
        console.log('Payment method type is not offline:', payment_method_type);
        console.log('Payment method type type:', typeof payment_method_type);
        console.log('Payment method type value:', payment_method_type);
    }

    // If no specific payment method is selected, show both options
    if (!payment_method_type) {
        console.log('No payment method type specified, showing payment method selection');
        return (
            <MainLayout title="Select Payment Method">
                <div className="min-h-screen bg-gray-50 py-8">
                    <Head title="Select Payment Method" />
                    
                    <div className="mx-auto max-w-4xl px-4">
                        <div className="mb-8">
                            <div className="mb-4 flex items-center gap-4">
                                <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Select Payment Method</h1>
                                    <p className="text-gray-600">
                                        Order ID: {order_id} | Amount: {formatPrice(total_amount)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Online Payment Option */}
                            <div className="rounded-lg bg-white p-6 shadow-md">
                                <div className="text-center">
                                    <CreditCard className="mx-auto mb-4 h-16 w-16 text-blue-400" />
                                    <h2 className="mb-2 text-xl font-semibold text-gray-900">Online Payment</h2>
                                    <p className="mb-4 text-gray-600">
                                        Pay securely online using Chapa payment gateway
                                    </p>
                                    <Button 
                                        onClick={() => window.location.href = route('payment.show', {
                                            order_id: order_id,
                                            amount: total_amount,
                                            currency: currency,
                                            cart_items: JSON.stringify([])
                                        })}
                                        className="w-full"
                                    >
                                        Pay Online
                                    </Button>
                                </div>
                            </div>

                            {/* Offline Payment Option */}
                            <div className="rounded-lg bg-white p-6 shadow-md">
                                <div className="text-center">
                                    <Upload className="mx-auto mb-4 h-16 w-16 text-green-400" />
                                    <h2 className="mb-2 text-xl font-semibold text-gray-900">Offline Payment</h2>
                                    <p className="mb-4 text-gray-600">
                                        Pay via bank transfer and upload proof
                                    </p>
                                    <Button 
                                        onClick={() => window.location.href = route('payment.show', {
                                            order_id: order_id,
                                            amount: total_amount,
                                            currency: currency,
                                            payment_method: 'offline',
                                            cart_items: JSON.stringify([])
                                        })}
                                        className="w-full"
                                    >
                                        Pay Offline
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

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

    // Define the type for the offline form data
    type OfflineFormData = {
        order_id: string;
        amount: number;
        currency: string;
        offline_payment_method_id: string;
        payment_reference: string;
        payment_notes: string;
        payment_screenshot: File | null;
    };

    // Form for offline payment submission
    const offlineForm = useForm<OfflineFormData & { [key: string]: any }>({
        order_id: order_id,
        amount: total_amount,
        currency: currency,
        offline_payment_method_id: '', // This will be set before submission
        payment_reference: '',
        payment_notes: '',
        payment_screenshot: null,
    });
    
    // Update the form data when the selected payment method changes
    React.useEffect(() => {
        if (selectedOfflineMethod) {
            offlineForm.setData('offline_payment_method_id', selectedOfflineMethod);
        }
    }, [selectedOfflineMethod]);

    const handleChapaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        chapaForm.post(route('payment.process'));
    };

    const handleOfflineSubmit = async (e: React.FormEvent) => {
        console.log('=== Form submission started ===');
        e.preventDefault();
        console.log('=== Starting offline payment submission ===');
        console.group('Payment Submission Debug');
        
        try {
            console.log('Form submitted with data:', {
                selectedOfflineMethod,
                formData: offlineForm.data,
                hasFile: !!offlineForm.data.payment_screenshot
            });
            // Client-side validation
            if (!selectedOfflineMethod) {
                const errorMsg = 'No payment method selected';
                console.error('Validation Error:', errorMsg);
                alert('Please select a payment method');
                return;
            }
            if (!offlineForm.data.payment_screenshot) {
                const errorMsg = 'No payment screenshot uploaded';
                console.error('Validation Error:', errorMsg);
                alert('Please upload a payment screenshot');
                return;
            }

            // Get cart items from local storage
            console.log('Retrieving cart from localStorage...');
            const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
            console.log('Cart items from localStorage:', cartItems);
            
            // Create form data with all required fields
            console.log('Preparing form data...');
            const formData = new FormData();
            const formFields = {
                order_id: offlineForm.data.order_id,
                amount: offlineForm.data.amount.toString(),
                currency: offlineForm.data.currency,
                offline_payment_method_id: selectedOfflineMethod,
                payment_reference: offlineForm.data.payment_reference || '',
                payment_notes: offlineForm.data.payment_notes || '',
                _token: document.querySelector('meta[name="csrf-token"]' as string)?.getAttribute('content') || '',
            };

            // Append all form fields
            Object.entries(formFields).forEach(([key, value]) => {
                formData.append(key, value);
                console.log(`Added to formData: ${key} =`, value);
            });
            
            // Append the payment screenshot file
            if (offlineForm.data.payment_screenshot) {
                console.log('Adding screenshot file to formData...');
                formData.append('payment_screenshot', offlineForm.data.payment_screenshot);
                const file = offlineForm.data.payment_screenshot as File;
                console.log('Screenshot file details:', {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                });
            }
            
            // Append cart items as JSON string if available
            if (cartItems && cartItems.length > 0) {
                console.log('Adding cart items to formData...');
                const cartItemsJson = JSON.stringify(cartItems);
                formData.append('cart_items', cartItemsJson);
                console.log('Cart items JSON (first 200 chars):', cartItemsJson.substring(0, 200));
            }

            // Log form data before submission
            console.log('Final form data to be submitted:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: [File]`, {
                        name: value.name,
                        type: value.type,
                        size: value.size,
                    });
                } else if (key === 'cart_items') {
                    console.log(`${key}: [Cart Items JSON] (${value.length} chars)`);
                } else if (key === '_token') {
                    console.log(`${key}: [CSRF Token] (${value.length} chars)`);
                } else {
                    console.log(`${key}:`, value);
                }
            }

            // Clear any previous errors
            offlineForm.clearErrors();
            
            const submitUrl = route('payment.offline.submit');
            console.log('Submitting form to:', submitUrl);
            
            // Submit the form using fetch instead of Inertia for better file upload handling
            console.log('Initiating form submission with fetch...');
            
            try {
                console.log('Sending fetch request to:', submitUrl);
                const response = await fetch(submitUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': formData.get('_token') as string,
                    },
                    credentials: 'same-origin',
                });

                console.log('Response received. Status:', response.status);
                
                // Check if the response is a redirect
                if (response.redirected) {
                    console.log('Server redirected to:', response.url);
                    // Clear the cart after successful submission
                    localStorage.removeItem('cartItems');
                    console.log('Cart cleared from localStorage');
                    window.location.href = response.url;
                    return;
                }
                
                // Log response headers for debugging
                console.log('Response headers:');
                response.headers.forEach((value, key) => {
                    console.log(`  ${key}: ${value}`);
                });
                
                // Get response content type to handle different response types
                const contentType = response.headers.get('content-type');
                let result;
                
                try {
                    if (contentType && contentType.includes('application/json')) {
                        result = await response.json();
                        console.log('JSON response:', result);
                    } else {
                        const text = await response.text();
                        console.log('Non-JSON response:', text);
                        throw new Error(`Unexpected response type: ${contentType}`);
                    }
                } catch (error) {
                    console.error('Error parsing response:', error);
                    throw new Error('Failed to process server response');
                }
                
                if (response.ok) {
                    console.log('=== Form submission successful ===');
                    
                    if (result.redirect) {
                        console.log('Redirecting to:', result.redirect);
                        // Clear the cart after successful submission
                        localStorage.removeItem('cartItems');
                        console.log('Cart cleared from localStorage');
                        window.location.href = result.redirect;
                        return;
                    } else if (result.url) {
                        // Handle case where server returns a URL to redirect to
                        console.log('Redirecting to URL from response:', result.url);
                        localStorage.removeItem('cartItems');
                        window.location.href = result.url;
                        return;
                    } else if (window.location.pathname !== '/payment/success') {
                        // If no redirect but we're not on success page, try to go there
                        console.log('No redirect URL, navigating to /payment/success');
                        localStorage.removeItem('cartItems');
                        window.location.href = '/payment/success';
                        return;
                    }
                } else {
                    console.error('=== Form submission failed ===');
                    console.error('Error response:', result);
                    
                    if (result.errors) {
                        console.error('Form errors:', result.errors);
                        // Update form errors
                        if (result.errors.payment_reference) {
                            offlineForm.setError('payment_reference', result.errors.payment_reference[0]);
                        }
                        if (result.errors.payment_notes) {
                            offlineForm.setError('payment_notes', result.errors.payment_notes[0]);
                        }
                        if (result.errors.payment_screenshot) {
                            offlineForm.setError('payment_screenshot', result.errors.payment_screenshot[0]);
                        }
                    }
                    
                    if (result.message) {
                        alert(result.message);
                    } else {
                        alert('An error occurred while processing your payment. Please try again.');
                    }
                }
            } catch (error) {
                console.error('=== Error during form submission ===');
                console.error('Error details:', error);
                
                if (error instanceof Error) {
                    const errorObj = error as any;
                    if (errorObj.errors) {
                        // Handle validation errors from the server
                        const errorMessage = Object.values(errorObj.errors).flat().join('\n');
                        const fullErrorMsg = `An error occurred while submitting your payment.\n\n${errorMessage}`;
                        console.error('Validation errors:', fullErrorMsg);
                        alert(fullErrorMsg);
                    } else if (errorObj.message) {
                        // Handle error messages from the server
                        const errorMsg = `Payment Error: ${errorObj.message}`;
                        console.error('Payment error:', errorMsg);
                        alert(errorMsg);
                    } else {
                        // Generic error handling
                        alert(`Error: ${error.message}`);
                    }
                } else {
                    // Fallback for non-Error objects
                    alert('An unexpected error occurred. Please try again.');
                }
            } finally {
                console.log('=== Form submission finished ===');
                console.groupEnd();
            }
        } catch (error) {
            console.error('Unexpected error during form submission:', error);
            alert('An unexpected error occurred. Please check the console for details.');
            console.groupEnd();
        }
    };

    if (payment_method_type === 'offline') {
        // Check if offline payment methods are available
        if (!offlinePaymentMethods || offlinePaymentMethods.length === 0) {
            console.warn('No offline payment methods available, falling back to online payment form');
            
            // Fallback to online payment form if no offline methods are available
            return (
                <MainLayout title="Payment Processing">
                    <div className="min-h-screen bg-gray-50 py-8">
                        <Head title="Payment Processing" />
                        
                        <div className="mx-auto max-w-4xl px-4">
                            <div className="mb-8">
                                <div className="mb-4 flex items-center gap-4">
                                    <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Payment Processing</h1>
                                        <p className="text-gray-600">
                                            Order ID: {order_id} | Amount: {formatPrice(total_amount)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-white p-6 shadow-md">
                                <div className="text-center">
                                    <CreditCard className="mx-auto mb-4 h-16 w-16 text-blue-400" />
                                    <h2 className="mb-2 text-xl font-semibold text-gray-900">Offline Payment Not Available</h2>
                                    <p className="mb-4 text-gray-600">
                                        Offline payment methods are not currently available. You can proceed with online payment instead.
                                    </p>
                                    <div className="space-y-3">
                                        <Button 
                                            onClick={() => window.location.href = route('payment.show', {
                                                order_id: order_id,
                                                amount: total_amount,
                                                currency: currency,
                                                cart_items: JSON.stringify([])
                                            })}
                                            className="w-full"
                                        >
                                            Continue with Online Payment
                                        </Button>
                                        <Button variant="outline" onClick={() => window.history.back()} className="w-full">
                                            Go Back
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </MainLayout>
            );
        }

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

                        <form onSubmit={handleOfflineSubmit} className="space-y-6">
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
                                                                <Building className="h-5 w-5 text-primary-600" />
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

                            {/* Error Display */}
                            {offlineForm.errors?.general && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{offlineForm.errors.general as string}</p>
                                </div>
                            )}

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
                                        type="submit"
                                        className="w-full bg-primary-600 hover:bg-primary-700 mt-6"
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
                        </form>
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
                        <div className="mb-4 flex flex-col items-center justify-center gap-4">
                            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
                                <p className="text-gray-600">Order ID: {order_id}</p>
                            </div>
                        </div>
                        <div className="rounded-lg bg-primary-50 p-4">
                            <p className="text-lg font-semibold text-primary-900">Total Amount: {formatPrice(total_amount)}</p>
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
                                <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="customer_name">Full Name *</Label>
                                        <Input
                                            id="customer_name"
                                            required
                                            value={chapaForm.data.customer_name}
                                            onChange={(e) => chapaForm.setData('customer_name', e.target.value)}
                                        />
                                        {chapaForm.errors.customer_name && (
                                            <p className="mt-1 text-sm text-red-600">{chapaForm.errors.customer_name}</p>
                                        )}
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
                                    {chapaForm.errors.customer_phone && (
                                        <p className="mt-1 text-sm text-red-600">{chapaForm.errors.customer_phone}</p>
                                    )}
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
                                    {chapaForm.errors.payment_method && (
                                        <p className="mt-1 text-sm text-red-600">{chapaForm.errors.payment_method}</p>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleChapaSubmit}
                                    className="w-full bg-primary-600 hover:bg-primary-700"
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
