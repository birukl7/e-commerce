import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function PaymentFailure({ productRequest, message = 'Your payment could not be processed.', retryUrl }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Head title="Payment Failed" />
            
            <div className="max-w-2xl mx-auto text-center">
                <Card className="overflow-hidden">
                    <CardHeader className="bg-red-50">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center mb-4">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                            <p className="text-lg">{message}</p>
                        </div>
                        
                        <div className="bg-muted/50 p-6 rounded-lg text-left max-w-md mx-auto">
                            <h3 className="font-medium mb-4">Order Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-medium">
                                        {productRequest.amount.toLocaleString()} {productRequest.currency}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Request ID:</span>
                                    <span>#{productRequest.id}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-yellow-800 text-sm text-left">
                            <p className="font-medium mb-2">What to do next?</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Check if you have sufficient funds in your account</li>
                                <li>Verify your payment details and try again</li>
                                <li>Contact your bank if you're having trouble with your payment method</li>
                                <li>Try using a different payment method</li>
                            </ul>
                        </div>
                    </CardContent>
                    
                    <CardFooter className="flex flex-col space-y-3">
                        {retryUrl && (
                            <Button asChild className="w-full">
                                <Link href={retryUrl}>
                                    Try Again
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild className="w-full">
                            <Link href={route('user.dashboard')}>
                                Back to Dashboard
                            </Link>
                        </Button>
                        <Button variant="ghost" asChild className="w-full">
                            <Link href="#" className="text-destructive hover:text-destructive">
                                Contact Support
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
