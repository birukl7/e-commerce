import { Button } from '@/components/ui/button';
import { CartProvider, useCart } from '@/contexts/cart-context';
import MainLayout from '@/layouts/app/main-layout';
import { Link } from '@inertiajs/react';
import { CreditCard, Minus, Plus, ShoppingCart, Upload, X } from 'lucide-react';
import { useState } from 'react';

function CheckoutContent() {
    const { items, getTotalPrice, removeFromCart, updateQuantity, clearCart, getTotalItems } = useCart();
    const [showPaymentMethods, setShowPaymentMethods] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
        }).format(price);
    };

    // Generate order ID and prepare payment data
    const generateOrderId = () => {
        return 'ORDER-' + Math.random().toString(36).substr(2, 9).toUpperCase() + '-' + Date.now();
    };

    const handlePayNow = () => {
        if (items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        setShowPaymentMethods(true);
    };

    // Update the handlePaymentMethod function in your checkout component
    const handlePaymentMethod = async (method: 'online' | 'offline') => {
        try {
            // Prepare payment parameters
            const orderId = generateOrderId();
            const amount = getTotalPrice();
            const currency = 'ETB';

            // Prepare cart items data
            const cartItemsData = items.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image || '',
            }));

            if (method === 'online') {
                // Redirect to Chapa method selection page
                const params = new URLSearchParams({
                    order_id: orderId,
                    amount: amount.toString(),
                    currency: currency,
                    cart_items: JSON.stringify(cartItemsData),
                });
                
                // Redirect to Chapa method selection page
                window.location.href = route('payment.chapa.method') + '?' + params.toString();
            } else {
                // For offline payment, go to the payment page with offline method pre-selected
                console.log('Redirecting to offline payment form...');
                const params = new URLSearchParams({
                    order_id: orderId,
                    amount: amount.toString(),
                    currency: currency,
                    payment_method: 'offline',
                    cart_items: JSON.stringify(cartItemsData),
                });
                window.location.href = route('payment.show') + '?' + params.toString();
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            alert(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
        }
    };

    return (
        <div className="py-8">
            <div className="container mx-auto px-4 md:px-6">
                <h1 className="mb-8 text-center text-2xl font-bold md:text-3xl">Checkout</h1>

                {items.length === 0 ? (
                    <div className="flex h-[50vh] flex-col items-center justify-center text-gray-500">
                        <ShoppingCart className="mb-4 h-16 w-16 md:h-20 md:w-20" />
                        <p className="mb-4 text-lg md:text-xl">Your cart is empty.</p>
                        <Link href={route('home')}>
                            <Button>Continue Shopping</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
                        {/* Order Summary - Mobile First Responsive */}
                        <div className="rounded-lg bg-white p-4 shadow-md md:p-6 lg:col-span-2">
                            <h2 className="mb-4 text-xl font-semibold md:mb-6 md:text-2xl">Order Summary</h2>
                            <ul className="space-y-4 md:space-y-6">
                                {items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex flex-col items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center"
                                    >
                                        <img
                                            src={item.image || '/placeholder.svg?height=100&width=100&query=product'}
                                            alt={item.name}
                                            className="mx-auto h-20 w-20 rounded-md object-cover sm:mx-0 md:h-24 md:w-24"
                                        />
                                        <div className="w-full flex-1">
                                            <div className="flex flex-col gap-3">
                                                <div>
                                                    <h3 className="text-center text-base font-medium text-gray-900 sm:text-left md:text-lg">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-center text-sm text-gray-600 sm:text-left">{formatPrice(item.price)} each</p>
                                                </div>
                                                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                                                    <div className="flex items-center rounded-md border border-gray-300">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 bg-transparent"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <span className="px-3 text-base font-medium">{item.quantity}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 bg-transparent"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-base font-semibold md:text-lg">
                                                            {formatPrice(item.price * item.quantity)}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => removeFromCart(item.id)}
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Order Total - Responsive */}
                        <div className="h-fit rounded-lg bg-white p-4 shadow-md md:p-6 lg:col-span-1">
                            <h2 className="mb-4 text-xl font-semibold md:mb-6 md:text-2xl">Order Total</h2>
                            <div className="space-y-3 md:space-y-4">
                                <div className="flex justify-between text-sm text-gray-700 md:text-base">
                                    <span>Subtotal ({getTotalItems()} items)</span>
                                    <span>{formatPrice(getTotalPrice())}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-700 md:text-base">
                                    <span>Shipping</span>
                                    <span>{formatPrice(0)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-700 md:text-base">
                                    <span>Tax</span>
                                    <span>{formatPrice(0)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-4 text-lg font-bold md:text-xl">
                                    <span>Total</span>
                                    <span>{formatPrice(getTotalPrice())}</span>
                                </div>
                            </div>

                            {!showPaymentMethods ? (
                                <Button
                                    onClick={handlePayNow}
                                    className="mt-6 w-full py-3 text-base md:mt-8 md:text-lg"
                                    disabled={items.length === 0}
                                >
                                    Pay Now
                                </Button>
                            ) : (
                                <div className="mt-6 space-y-4 md:mt-8">
                                    <h3 className="text-lg font-semibold text-gray-900">Choose Payment Method</h3>

                                    {/* Online Payment with Chapa */}
                                    <button
                                        onClick={() => handlePaymentMethod('online')}
                                        className="group relative w-full overflow-hidden rounded-lg border-2 border-primary-200 bg-white p-4 transition-all hover:border-primary-400 hover:shadow-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 group-hover:bg-primary-200">
                                                <CreditCard className="h-6 w-6 text-primary-600" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-semibold text-gray-900">Pay with Chapa</h4>
                                                <p className="text-sm text-gray-600">Secure online payment</p>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Offline Payment */}
                                    <button
                                        onClick={() => handlePaymentMethod('offline')}
                                        className="group relative w-full overflow-hidden rounded-lg border-2 border-primary-200 bg-white p-4 transition-all hover:border-primary-400 hover:shadow-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 group-hover:bg-primary-200">
                                                <Upload className="h-6 w-6 text-primary-600" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-semibold text-gray-900">Pay & Upload Proof</h4>
                                                <p className="text-sm text-gray-600">Bank transfer + screenshot</p>
                                            </div>
                                        </div>
                                    </button>

                                    <Button variant="outline" onClick={() => setShowPaymentMethods(false)} className="w-full">
                                        Back
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Show() {
    return (
        <CartProvider>
            <MainLayout title="Checkout">
                <CheckoutContent />
            </MainLayout>
        </CartProvider>
    );
}
