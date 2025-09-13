import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PaymentSuccess({ productRequest, message = 'Your payment was successful!' }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Head title="Payment Successful" />
            
            <div className="max-w-2xl mx-auto text-center">
                <Card className="overflow-hidden">
                    <CardHeader className="bg-green-50">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                        <p className="mb-6 text-lg">{message}</p>
                        
                        <div className="bg-muted/50 p-6 rounded-lg text-left max-w-md mx-auto">
                            <h3 className="font-medium mb-4">Payment Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount Paid:</span>
                                    <span className="font-medium">
                                        {productRequest.amount.toLocaleString()} {productRequest.currency}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Transaction ID:</span>
                                    <span className="font-mono text-sm">{productRequest.payment_reference}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        
                        <p className="mt-6 text-muted-foreground">
                            We've sent a confirmation email with your receipt and order details.
                        </p>
                    </CardContent>
                    
                    <CardFooter className="flex flex-col space-y-4">
                        <Button asChild className="w-full">
                            <Link href={route('user.dashboard')}>
                                Back to Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href={route('user.product-requests.show', productRequest.id)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                View Request Details
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
                
                <div className="mt-8 text-sm text-muted-foreground">
                    <p>Need help? <a href="#" className="text-primary hover:underline">Contact our support team</a></p>
                </div>
            </div>
        </div>
    );
}
