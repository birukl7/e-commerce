// import type React from 'react';

// import Footer from '@/components/footer';
// import Header from '@/components/header';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Separator } from '@/components/ui/separator';
// import { CartProvider, useCart } from '@/contexts/cart-context';
// import { Head, Link, useForm } from '@inertiajs/react';
// import { ArrowLeft, Building2, CreditCard, Loader2, Shield, Wallet, Upload, FileImage, Info } from 'lucide-react';
// import { useEffect, useState } from 'react';

// interface OfflinePaymentMethod {
//     id: number;
//     name: string;
//     type: string;
//     description: string;
//     instructions: string;
//     details: Record<string, any>;
//     logo?: string;
//     is_active: boolean;
// }

// interface PaymentProcessProps {
//     order_id: string;
//     total_amount: number;
//     currency: string;
//     customer_email?: string;
//     customer_name?: string;
//     customer_phone?: string;
//     offlinePaymentMethods?: OfflinePaymentMethod[];
// }

// function PaymentProcessContent({
//     order_id,
//     total_amount,
//     currency = 'ETB',
//     customer_email = '',
//     customer_name = '',
//     customer_phone = '',
//     offlinePaymentMethods = [],
// }: PaymentProcessProps) {
//     const { items, getTotalPrice, getTotalItems } = useCart();
//     const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('telebirr');
//     const [selectedOfflineMethod, setSelectedOfflineMethod] = useState<OfflinePaymentMethod | null>(null);
//     const [imagePreview, setImagePreview] = useState<string | null>(null);

//     const { data, setData, post, processing, errors, reset } = useForm({
//         payment_method: 'telebirr',
//         customer_name: customer_name,
//         customer_email: customer_email,
//         customer_phone: customer_phone,
//         order_id: order_id,
//         amount: getTotalPrice() || total_amount,
//         currency: currency,
//         // Offline payment fields
//         offline_payment_method_id: '',
//         payment_reference: '',
//         payment_notes: '',
//         payment_screenshot: null as File | null,
//     });

//     useEffect(() => {
//         setData('payment_method', selectedPaymentMethod);

//         // Handle offline payment method selection
//         if (selectedPaymentMethod === 'offline') {
//             // Set the first available offline method as default
//             const firstMethod = offlinePaymentMethods[0] || null;
//             setSelectedOfflineMethod(firstMethod);
//             setData('offline_payment_method_id', firstMethod ? firstMethod.id.toString() : '');
//         } else {
//             setSelectedOfflineMethod(null);
//             setData('offline_payment_method_id', '');
//         }
//     }, [selectedPaymentMethod]);

//     const formatPrice = (price: number) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: currency,
//         }).format(price);
//     };

//     // Calculate the actual total from cart items
//     const calculateTotal = () => {
//         return getTotalPrice() || total_amount;
//     };

//     // Handle image file selection
//     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             setData('payment_screenshot', file);

//             // Create preview
//             const reader = new FileReader();
//             reader.onload = (e) => {
//                 setImagePreview(e.target?.result as string);
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     // Remove selected image
//     const removeImage = () => {
//         setData('payment_screenshot', null);
//         setImagePreview(null);
//     };

//     const handlePaymentSubmit = (e: React.FormEvent) => {
//         e.preventDefault();

//         // Validate required fields
//         if (!data.customer_name || !data.customer_email) {
//             return;
//         }

//         // Additional validation for offline payments
//         if (selectedPaymentMethod === 'offline') {
//             if (!data.payment_screenshot) {
//                 return;
//             }

//             // Submit offline payment
//             post(route('payment.offline.submit'), {
//                 forceFormData: true, // Required for file uploads
//                 onSuccess: () => {
//                     // Success will be handled by the controller
//                 },
//                 onError: (errors) => {
//                     console.error('Offline payment submission error:', errors);
//                 },
//             });
//         } else {
//             // Submit online payment
//             post(route('payment.process'), {
//                 onSuccess: () => {
//                     // The Laravel controller will handle the redirect using Inertia::location()
//                 },
//                 onError: (errors) => {
//                     console.error('Payment processing error:', errors);
//                 },
//             });
//         }
//     };

//     const paymentMethods = [
//         {
//             id: 'telebirr',
//             name: 'Telebirr',
//             description: 'Pay with Telebirr mobile wallet',
//             icon: <Wallet className="h-6 w-6" />,
//             popular: true,
//             type: 'online'
//         },
//         {
//             id: 'cbe',
//             name: 'Commercial Bank of Ethiopia',
//             description: 'Pay with CBE online banking',
//             icon: <Building2 className="h-6 w-6" />,
//             popular: false,
//             type: 'online'
//         },
//         {
//             id: 'paypal',
//             name: 'PayPal',
//             description: 'Pay with PayPal account',
//             icon: <CreditCard className="h-6 w-6" />,
//             popular: false,
//             type: 'online'
//         },
//         // Add offline payment as a single option if offline methods are available
//         ...(offlinePaymentMethods.length > 0 ? [{
//             id: 'offline',
//             name: 'Pay Offline',
//             description: 'Pay manually via bank transfer or mobile money and upload payment proof',
//             icon: <Upload className="h-6 w-6" />,
//             popular: false,
//             type: 'offline'
//         }] : [])
//     ];

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <Header />

//             <div className="mx-auto max-w-6xl px-4 py-8">
//                 {/* Back Button */}
//                 <div className="mb-6">
//                     <Link href={route('checkout')}>
//                         <Button variant="ghost" className="flex items-center gap-2">
//                             <ArrowLeft className="h-4 w-4" />
//                             Back to Checkout
//                         </Button>
//                     </Link>
//                 </div>

//                 <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
//                     {/* Payment Form */}
//                     <div className="space-y-6 lg:col-span-2">
//                         <Card>
//                             <CardHeader>
//                                 <CardTitle className="flex items-center gap-2">
//                                     <Shield className="h-5 w-5 text-green-600" />
//                                     Secure Payment
//                                 </CardTitle>
//                                 <CardDescription>Choose your preferred payment method and complete your purchase securely.</CardDescription>
//                             </CardHeader>
//                             <CardContent>
//                                 <form onSubmit={handlePaymentSubmit} className="space-y-6">
//                                     {/* Debug Info - Remove this later */}
//                                     <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
//                                         <strong>Debug:</strong>
//                                         <div>Offline Payment Methods Count: {offlinePaymentMethods.length}</div>
//                                         <div>Payment Methods Array: {JSON.stringify(paymentMethods.map(p => p.name))}</div>
//                                         {offlinePaymentMethods.length > 0 && (
//                                             <div className="mt-1">
//                                                 Available methods: {offlinePaymentMethods.map(m => m.name).join(', ')}
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Payment Methods */}
//                                     <div>
//                                         <Label className="mb-4 block text-base font-semibold">Payment Method</Label>
//                                         <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="space-y-3">
//                                             {paymentMethods.map((method) => (
//                                                 <div key={method.id} className="relative">
//                                                     <div className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 ${
//                                                         method.type === 'offline' ? 'border-orange-200 bg-orange-50/50 hover:bg-orange-50' : ''
//                                                     }`}>
//                                                         <RadioGroupItem value={method.id} id={method.id} />
//                                                         <div className="flex flex-1 items-center space-x-3">
//                                                             <div className="text-gray-600">{method.icon}</div>
//                                                             <div className="flex-1">
//                                                                 <Label
//                                                                     htmlFor={method.id}
//                                                                     className="flex cursor-pointer items-center gap-2 font-medium"
//                                                                 >
//                                                                     {method.name}
//                                                                     {method.popular && (
//                                                                         <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
//                                                                             Popular
//                                                                         </span>
//                                                                     )}
//                                                                     {method.type === 'offline' && (
//                                                                         <span className="rounded-full bg-orange-100 text-orange-800 px-2 py-1 text-xs">
//                                                                             Manual
//                                                                         </span>
//                                                                     )}
//                                                                 </Label>
//                                                                 <p className="mt-1 text-sm text-gray-600">{method.description}</p>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </RadioGroup>
//                                     </div>

//                                     <Separator />

//                                     {/* Customer Information */}
//                                     <div className="space-y-4">
//                                         <Label className="text-base font-semibold">Customer Information</Label>

//                                         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                                             <div>
//                                                 <Label htmlFor="customer_name">Full Name *</Label>
//                                                 <Input
//                                                     id="customer_name"
//                                                     type="text"
//                                                     value={data.customer_name}
//                                                     onChange={(e) => setData('customer_name', e.target.value)}
//                                                     placeholder="Enter your full name"
//                                                     className={errors.customer_name ? 'border-red-500' : ''}
//                                                     required
//                                                 />
//                                                 {errors.customer_name && <p className="mt-1 text-sm text-red-500">{errors.customer_name}</p>}
//                                             </div>
// {/*
//                                             <div>
//                                                 <Label htmlFor="customer_phone">Phone Number *</Label>
//                                                 <Input
//                                                     id="customer_phone"
//                                                     type="tel"
//                                                     value={data.customer_phone}
//                                                     onChange={(e) => setData('customer_phone', e.target.value)}
//                                                     placeholder="+251 9XX XXX XXX"
//                                                     className={errors.customer_phone ? 'border-red-500' : ''}
//                                                     required
//                                                 />
//                                                 {errors.customer_phone && <p className="mt-1 text-sm text-red-500">{errors.customer_phone}</p>}
//                                             </div> */}
//                                         </div>

//                                         <div>
//                                             <Label htmlFor="customer_email">Email Address *</Label>
//                                             <Input
//                                                 id="customer_email"
//                                                 type="email"
//                                                 value={data.customer_email}
//                                                 onChange={(e) => setData('customer_email', e.target.value)}
//                                                 placeholder="your.email@example.com"
//                                                 className={errors.customer_email ? 'border-red-500' : ''}
//                                                 required
//                                             />
//                                             {errors.customer_email && <p className="mt-1 text-sm text-red-500">{errors.customer_email}</p>}
//                                         </div>
//                                     </div>

//                                     {/* Offline Payment Details */}
//                                     {selectedPaymentMethod === 'offline' && (
//                                         <>
//                                             <Separator />
//                                             <div className="space-y-4">
//                                                 <Label className="text-base font-semibold">Offline Payment Method & Upload</Label>

//                                                 {/* Payment Method Selection */}
//                                                 {offlinePaymentMethods.length > 1 && (
//                                                     <div>
//                                                         <Label className="mb-3 block text-sm font-medium">Choose Payment Method</Label>
//                                                         <RadioGroup
//                                                             value={selectedOfflineMethod?.id.toString() || ''}
//                                                             onValueChange={(value) => {
//                                                                 const method = offlinePaymentMethods.find(m => m.id.toString() === value);
//                                                                 setSelectedOfflineMethod(method || null);
//                                                                 setData('offline_payment_method_id', value);
//                                                             }}
//                                                             className="space-y-2"
//                                                         >
//                                                             {offlinePaymentMethods.map((method) => (
//                                                                 <div key={method.id} className="flex items-center space-x-2">
//                                                                     <RadioGroupItem value={method.id.toString()} id={`method_${method.id}`} />
//                                                                     <Label htmlFor={`method_${method.id}`} className="text-sm cursor-pointer">
//                                                                         {method.name} - {method.description}
//                                                                     </Label>
//                                                                 </div>
//                                                             ))}
//                                                         </RadioGroup>
//                                                     </div>
//                                                 )}

//                                                 {/* Payment Instructions */}
//                                                 {selectedOfflineMethod && (
//                                                     <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//                                                         <div className="flex items-start gap-3">
//                                                             <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
//                                                             <div>
//                                                                 <h4 className="font-semibold text-orange-900 mb-2">Payment Instructions for {selectedOfflineMethod.name}</h4>
//                                                                 <p className="text-sm text-orange-800 mb-3">{selectedOfflineMethod.instructions}</p>

//                                                                 {/* Payment Details */}
//                                                                 {selectedOfflineMethod.details && Object.keys(selectedOfflineMethod.details).length > 0 && (
//                                                                     <div className="bg-white rounded-md p-3 border border-orange-200">
//                                                                         <h5 className="font-medium text-orange-900 mb-2">Payment Details:</h5>
//                                                                         <div className="space-y-1">
//                                                                             {Object.entries(selectedOfflineMethod.details).map(([key, value]) => (
//                                                                                 <div key={key} className="flex justify-between text-sm">
//                                                                                     <span className="font-medium text-orange-800 capitalize">{key.replace(/_/g, ' ')}:</span>
//                                                                                     <span className="text-orange-700 font-mono">{String(value)}</span>
//                                                                                 </div>
//                                                                             ))}
//                                                                         </div>
//                                                                     </div>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 )}

//                                                 {/* Payment Reference & Notes */}
//                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                                     <div>
//                                                         <Label htmlFor="payment_reference">Payment Reference (Optional)</Label>
//                                                         <Input
//                                                             id="payment_reference"
//                                                             type="text"
//                                                             value={data.payment_reference}
//                                                             onChange={(e) => setData('payment_reference', e.target.value)}
//                                                             placeholder="Transaction ID, Reference number, etc."
//                                                             className={errors.payment_reference ? 'border-red-500' : ''}
//                                                         />
//                                                         {errors.payment_reference && <p className="mt-1 text-sm text-red-500">{errors.payment_reference}</p>}
//                                                     </div>

//                                                     <div>
//                                                         <Label htmlFor="payment_notes">Additional Notes (Optional)</Label>
//                                                         <Input
//                                                             id="payment_notes"
//                                                             type="text"
//                                                             value={data.payment_notes}
//                                                             onChange={(e) => setData('payment_notes', e.target.value)}
//                                                             placeholder="Any additional information"
//                                                             className={errors.payment_notes ? 'border-red-500' : ''}
//                                                         />
//                                                         {errors.payment_notes && <p className="mt-1 text-sm text-red-500">{errors.payment_notes}</p>}
//                                                     </div>
//                                                 </div>

//                                                 {/* Image Upload */}
//                                                 <div>
//                                                     <Label htmlFor="payment_screenshot" className="text-base font-medium">
//                                                         Payment Screenshot *
//                                                     </Label>
//                                                     <p className="text-sm text-gray-600 mb-3">Upload a screenshot or photo of your payment confirmation</p>

//                                                     <div className="space-y-4">
//                                                         {/* File Input */}
//                                                         <div className="flex items-center justify-center w-full">
//                                                             <label
//                                                                 htmlFor="payment_screenshot"
//                                                                 className="flex flex-col items-center justify-center w-full h-32 border-2 border-orange-300 border-dashed rounded-lg cursor-pointer bg-orange-50 hover:bg-orange-100"
//                                                             >
//                                                                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                                                                     <Upload className="w-8 h-8 mb-2 text-orange-500" />
//                                                                     <p className="mb-2 text-sm text-orange-700">
//                                                                         <span className="font-semibold">Click to upload</span> or drag and drop
//                                                                     </p>
//                                                                     <p className="text-xs text-orange-500">PNG, JPG, GIF up to 5MB</p>
//                                                                 </div>
//                                                                 <input
//                                                                     id="payment_screenshot"
//                                                                     type="file"
//                                                                     className="hidden"
//                                                                     accept="image/*"
//                                                                     onChange={handleImageChange}
//                                                                 />
//                                                             </label>
//                                                         </div>

//                                                         {/* Image Preview */}
//                                                         {imagePreview && (
//                                                             <div className="relative">
//                                                                 <div className="bg-white border border-gray-200 rounded-lg p-4">
//                                                                     <div className="flex items-start gap-3">
//                                                                         <FileImage className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
//                                                                         <div className="flex-1">
//                                                                             <p className="text-sm font-medium text-gray-900 mb-2">Payment Screenshot Preview</p>
//                                                                             <img
//                                                                                 src={imagePreview}
//                                                                                 alt="Payment Screenshot Preview"
//                                                                                 className="max-w-full h-48 object-contain border border-gray-200 rounded"
//                                                                             />
//                                                                             <button
//                                                                                 type="button"
//                                                                                 onClick={removeImage}
//                                                                                 className="mt-2 text-sm text-red-600 hover:text-red-800"
//                                                                             >
//                                                                                 Remove Image
//                                                                             </button>
//                                                                         </div>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         )}

//                                                         {errors.payment_screenshot && (
//                                                             <p className="text-sm text-red-500">{errors.payment_screenshot}</p>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </>
//                                     )}

//                                     {/* Submit Button */}
//                                     <Button type="submit" className="w-full py-3 text-lg" disabled={processing}>
//                                         {processing ? (
//                                             <>
//                                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                                 {selectedPaymentMethod === 'offline' ? 'Submitting Payment...' : 'Processing Payment...'}
//                                             </>
//                                         ) : (
//                                             <>
//                                                 {selectedPaymentMethod === 'offline' ? (
//                                                     <>
//                                                         <Upload className="mr-2 h-4 w-4" />
//                                                         Submit Payment Proof - {formatPrice(calculateTotal())}
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <Shield className="mr-2 h-4 w-4" />
//                                                         Pay {formatPrice(calculateTotal())}
//                                                     </>
//                                                 )}
//                                             </>
//                                         )}
//                                     </Button>
//                                 </form>
//                             </CardContent>
//                         </Card>

//                         {/* Security Notice */}
//                         <Card className="border-blue-200 bg-blue-50">
//                             <CardContent className="pt-6">
//                                 <div className="flex items-start gap-3">
//                                     <Shield className="mt-0.5 h-5 w-5 text-blue-600" />
//                                     <div>
//                                         <h4 className="mb-1 font-semibold text-blue-900">Secure Payment Processing</h4>
//                                         <p className="text-sm text-blue-800">
//                                             Your payment information is encrypted and processed securely through Chapa. We never store your payment
//                                             details on our servers.
//                                         </p>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </div>

//                     {/* Order Summary */}
//                     <div className="lg:col-span-1">
//                         <Card className="sticky top-4">
//                             <CardHeader>
//                                 <CardTitle>Order Summary</CardTitle>
//                             </CardHeader>
//                             <CardContent className="space-y-4">
//                                 {/* Order Items */}
//                                 <div className="space-y-3">
//                                     {items.slice(0, 3).map((item) => (
//                                         <div key={item.id} className="flex items-center gap-3">
//                                             <img
//                                                 src={item.image || '/placeholder.svg?height=50&width=50&query=product'}
//                                                 alt={item.name}
//                                                 className="h-12 w-12 rounded-md object-cover"
//                                             />
//                                             <div className="min-w-0 flex-1">
//                                                 <p className="truncate text-sm font-medium">{item.name}</p>
//                                                 <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
//                                             </div>
//                                             <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
//                                         </div>
//                                     ))}

//                                     {items.length > 3 && <p className="py-2 text-center text-sm text-gray-600">+{items.length - 3} more items</p>}
//                                 </div>

//                                 <Separator />

//                                 {/* Totals */}
//                                 <div className="space-y-2">
//                                     <div className="flex justify-between text-sm">
//                                         <span>Subtotal ({getTotalItems()} items)</span>
//                                         <span>{formatPrice(calculateTotal())}</span>
//                                     </div>
//                                     <div className="flex justify-between text-sm">
//                                         <span>Shipping</span>
//                                         <span>{formatPrice(0)}</span>
//                                     </div>
//                                     <div className="flex justify-between text-sm">
//                                         <span>Tax</span>
//                                         <span>{formatPrice(0)}</span>
//                                     </div>
//                                     <Separator />
//                                     <div className="flex justify-between text-lg font-bold">
//                                         <span>Total</span>
//                                         <span>{formatPrice(calculateTotal())}</span>
//                                     </div>
//                                 </div>

//                                 {/* Order ID */}
//                                 <div className="rounded-md bg-gray-50 p-3">
//                                     <p className="text-xs text-gray-600">Order ID</p>
//                                     <p className="font-mono text-sm">{order_id}</p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </div>
//                 </div>
//             </div>

//             <Footer />
//         </div>
//     );
// }

// export default function PaymentProcess(props: PaymentProcessProps) {
//     return (
//         <CartProvider>
//             <Head title="Payment Processing - ShopHub" />
//             <PaymentProcessContent {...props} />
//         </CartProvider>
//     );
// }

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
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
        );
    }

    // Render regular Chapa payment form
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Head title="Complete Payment" />

            <div className="mx-auto max-w-2xl px-4">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 flex items-center justify-center gap-4">
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
                            <div className="grid grid-cols-2 gap-4">
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
                                className="w-full bg-blue-600 hover:bg-blue-700"
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
    );
}
