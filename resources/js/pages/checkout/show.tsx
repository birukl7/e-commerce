'use client';

import Footer from '@/components/footer';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { CartProvider, useCart } from '@/contexts/cart-context';
import { Head, Link } from '@inertiajs/react';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
// import { route } from "inertiajs"

function CheckoutContent() {
    const { items, getTotalPrice, removeFromCart, updateQuantity, clearCart, getTotalItems } = useCart();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
        }).format(price);
    };

    const handlePayNow = () => {
        console.log('Processing payment for:', getTotalPrice());
        alert('Payment successful! Your order has been placed.');
        clearCart();
        window.location.href = route('home');
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
            <Header />
            <div className="mx-auto max-w-[1280px] py-8">
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
                                                        <p className="text-center text-sm text-gray-600 sm:text-left">
                                                            {formatPrice(item.price)} each
                                                        </p>
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
                                <Link href={route('payment.show')} className="block w-full">
                                    <Button className="mt-6 w-full py-3 text-base md:mt-8 md:text-lg">Pay Now</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default function Show() {
    return (
        <CartProvider>
            <Head title="Checkout" />
            <CheckoutContent />
        </CartProvider>
    );
}
