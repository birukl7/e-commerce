import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'react-toastify';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Loader2, Bell } from 'lucide-react';

interface OutOfStockNotificationProps {
    product: {
        id: number;
        name: string;
        slug: string;
        stock_quantity: number;
        stock_status: string;
    };
    user?: {
        email: string;
    } | null;
}

const OutOfStockNotification: React.FC<OutOfStockNotificationProps> = ({ product, user }) => {
    const [email, setEmail] = useState(user?.email || '');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    // Check subscription status on component mount
    useEffect(() => {
        if (email && product.stock_quantity <= 0) {
            checkSubscriptionStatus();
        }
    }, [email, product.stock_quantity]);

    const checkSubscriptionStatus = async () => {
        if (!email) return;

        setIsChecking(true);
        try {
            const response = await fetch(`/api/products/${product.id}/notifications/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            setIsSubscribed(data.subscribed);
        } catch (error) {
            console.error('Error checking subscription status:', error);
        } finally {
            setIsChecking(false);
        }
    };

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/products/${product.id}/notifications/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSubscribed(true);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error subscribing to notifications:', error);
            toast.error('Failed to subscribe to notifications. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnsubscribe = async () => {
        if (!email) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/products/${product.id}/notifications/unsubscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSubscribed(false);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error unsubscribing from notifications:', error);
            toast.error('Failed to unsubscribe. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Don't show the component if product is in stock
    if (product.stock_quantity > 0) {
        return null;
    }

    return (
        <Card className="mt-4 border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-amber-800">
                                Out of Stock
                            </h3>
                            <Badge variant="outline" className="text-amber-700 border-amber-300">
                                Unavailable
                            </Badge>
                        </div>
                        
                        <p className="text-sm text-amber-700">
                            This product is currently out of stock.
                        </p>
                        
                        {!isSubscribed ? (
                            <form onSubmit={handleSubscribe} className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="notification-email" className="text-amber-800">
                                        Get notified when back in stock
                                    </Label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Input
                                            id="notification-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email address"
                                            required
                                            disabled={isLoading}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={isLoading || !email}
                                            className="bg-amber-600 hover:bg-amber-700 text-white"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Subscribing...
                                                </>
                                            ) : (
                                                <>
                                                    <Bell className="h-4 w-4 mr-2" />
                                                    Notify Me
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-amber-600">
                                    We'll notify you when this product becomes available again.
                                </p>
                            </form>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-700 font-medium">
                                            You're subscribed to notifications
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleUnsubscribe}
                                        disabled={isLoading}
                                        className="text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                Unsubscribing...
                                            </>
                                        ) : (
                                            'Unsubscribe'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OutOfStockNotification;
