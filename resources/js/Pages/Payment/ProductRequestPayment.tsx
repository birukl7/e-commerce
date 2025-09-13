import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function ProductRequestPayment({ productRequest, paymentMethods }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [error, setError] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        payment_method: '',
        phone_number: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        if (!data.payment_method) {
            setError('Please select a payment method');
            return;
        }

        setIsProcessing(true);

        // In a real app, you would make an API call to process the payment
        // For now, we'll simulate a successful payment
        setTimeout(() => {
            window.location.href = `/product-requests/${productRequest.id}/payment/success`;
        }, 2000);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Head title={`Payment for ${productRequest.product_name}`} />
            
            <div className="max-w-2xl mx-auto">
                <Link 
                    href={route('user.product-requests.show', productRequest.id)}
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to request details
                </Link>

                <Card className="overflow-hidden">
                    <CardHeader className="bg-primary/5">
                        <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
                        <CardDescription>
                            You're almost done! Please complete your payment to finalize your product request.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Order Summary */}
                        <div className="mb-8 p-4 border rounded-lg">
                            <h3 className="font-medium mb-3">Order Summary</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Product:</span>
                                    <span>{productRequest.product_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Request ID:</span>
                                    <span>#{productRequest.id}</span>
                                </div>
                                <div className="flex justify-between font-medium text-lg mt-4 pt-4 border-t">
                                    <span>Total Amount:</span>
                                    <span>{productRequest.amount.toLocaleString()} {productRequest.currency}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-medium">Payment Method</h3>
                                
                                <div className="grid gap-4">
                                    {Object.entries(paymentMethods).map(([key, method]) => (
                                        <div 
                                            key={key}
                                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedMethod === key ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                                            onClick={() => {
                                                setSelectedMethod(key);
                                                setData('payment_method', key);
                                            }}
                                        >
                                            <div className="flex items-center">
                                                <div className="mr-4 p-2 bg-muted rounded">
                                                    <CreditCard className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{method.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{method.description}</p>
                                                    {method.fee > 0 && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Processing fee: {method.fee.toFixed(2)} {productRequest.currency}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {errors.payment_method && (
                                        <p className="text-sm text-destructive">{errors.payment_method}</p>
                                    )}
                                </div>

                                {selectedMethod && (
                                    <div className="space-y-4 pt-4">
                                        <div>
                                            <Label htmlFor="phone_number">Phone Number</Label>
                                            <Input
                                                id="phone_number"
                                                type="tel"
                                                placeholder="+251 9XXXXXXXX"
                                                className="mt-1"
                                                value={data.phone_number}
                                                onChange={(e) => setData('phone_number', e.target.value)}
                                                required
                                            />
                                            {errors.phone_number && (
                                                <p className="text-sm text-destructive mt-1">{errors.phone_number}</p>
                                            )}
                                        </div>

                                        <div className="bg-muted p-4 rounded-lg text-sm">
                                            <h4 className="font-medium mb-2">Payment Instructions</h4>
                                            <p className="text-muted-foreground">
                                                You will be redirected to a secure payment page to complete your transaction.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4">
                                <Button 
                                    type="submit" 
                                    className="w-full"
                                    disabled={processing || isProcessing || !selectedMethod}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay ${productRequest.amount.toLocaleString()} ${productRequest.currency}`
                                    )}
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
