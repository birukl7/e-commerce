import { Button } from '@/components/ui/button';
import { CartProvider, useCart } from '@/contexts/cart-context';
import MainLayout from '@/layouts/app/main-layout';
import { Link, usePage } from '@inertiajs/react';
import { CreditCard, Minus, Plus, ShoppingCart, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useTaxCalculation } from '@/hooks/useTaxCalculation';
import TaxInfoDialog from '@/components/TaxInfoDialog';
import OfflinePaymentDialog from '@/components/OfflinePaymentDialog';
import H1 from '@/components/ui/h1';
import { useTranslation } from 'react-i18next';

type TaxSetting = {
    id: number;
    name: string;
    type: 'percentage' | 'fixed';
    rate: number;
    formatted_rate: string;
    description: string;
};

function CheckoutContent() {
    const { items, getTotalPrice, removeFromCart, updateQuantity, clearCart, getTotalItems } = useCart();
    const [showPaymentMethods, setShowPaymentMethods] = useState(false);
    const [showTaxInfoDialog, setShowTaxInfoDialog] = useState(false);
    const [showOfflinePaymentDialog, setShowOfflinePaymentDialog] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
    const { activeTaxes = [] } = usePage<{ activeTaxes: TaxSetting[] }>().props;
    const { t } = useTranslation();

    const subtotal = getTotalPrice();
    const taxCalc = useTaxCalculation(subtotal, activeTaxes as TaxSetting[]);

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
            alert(t('checkout.yourCartIsEmpty'));
            return;
        }

        setShowPaymentMethods(true);
    };

    // Update the handlePaymentMethod function in your checkout component
    const handlePaymentMethod = async (method: 'online' | 'offline') => {
        try {
            // Generate order ID once and store it
            const orderId = generateOrderId();
            const amount = taxCalc.total; // include taxes in amount
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
                // For offline payment, create order first, then open the dialog
                // The order will be created when the dialog opens by calling the backend
                // Store the order ID and open the dialog
                setPendingOrderId(orderId);
                setShowOfflinePaymentDialog(true);
                setShowPaymentMethods(false);
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            alert(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
        }
    };

    // Prepare cart items data for the dialog
    const cartItemsData = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
    }));

    // Prepare tax breakdown for the dialog
    const taxBreakdown = taxCalc.taxes?.map((tax) => ({
        name: tax.name,
        amount: tax.amount,
        rate: tax.type === 'percentage' ? tax.rate : 0, // Only show rate for percentage taxes
    })) || [];

    return (
        <div className="py-8">
            <div className="container mx-auto px-4 md:px-6">
                <H1 className="mb-8 text-center text-2xl font-bold md:text-3xl">{t('checkout.checkout')}</H1>

                {items.length === 0 ? (
                    <div className="flex h-[50vh] flex-col items-center justify-center text-gray-500">
                        <ShoppingCart className="mb-4 h-16 w-16 md:h-20 md:w-20" />
                        <p className="mb-4 text-lg md:text-xl">{t('checkout.yourCartIsEmpty')}</p>
                        <Link href={route('home')}>
                            <Button>{t('checkout.continueShopping')}</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
                        {/* Order Summary - Mobile First Responsive */}
                        <div className="rounded-lg bg-white p-4 shadow-md md:p-6 lg:col-span-2">
                            <h2 className="mb-4 text-xl font-semibold md:mb-6 md:text-2xl">{t('checkout.orderSummary')}</h2>
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
                                                            size="sm"
                                                            className="h-8 w-8 bg-transparent"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <span className="px-3 text-base font-medium">{item.quantity}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
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
                                                            variant="outline"
                                                            size="sm"
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
                            <h2 className="mb-4 text-xl font-semibold md:mb-6 md:text-2xl">{t('checkout.orderTotal')}</h2>
                            <div className="space-y-3 md:space-y-4">
                                <div className="flex justify-between text-sm text-gray-700 md:text-base">
                                    <span>{t('checkout.subtotal')} ({getTotalItems()} {getTotalItems() === 1 ? t('orders.item') : t('orders.items')})</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-700 md:text-base">
                                    <span>{t('checkout.shipping')}</span>
                                    <span>{formatPrice(0)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-700 md:text-base">
                                    <span>{t('checkout.tax')}</span>
                                    <span>{formatPrice(taxCalc.total_tax_amount)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-4 text-lg font-bold md:text-xl">
                                    <span>{t('checkout.total')}</span>
                                    <span>{formatPrice(taxCalc.total)}</span>
                                </div>
                            </div>

                            {!showPaymentMethods ? (
                                <Button
                                    onClick={handlePayNow}
                                    className="mt-6 w-full py-3 text-base md:mt-8 md:text-lg"
                                    disabled={items.length === 0}
                                >
                                    {t('checkout.payNow')}
                                </Button>
                            ) : (
                                <div className="mt-6 space-y-4 md:mt-8">
                                    <h3 className="text-lg font-semibold text-gray-900">{t('checkout.choosePaymentMethod')}</h3>

                                    {/* Online Payment with Chapa */}
                                    <button
                                        onClick={() => handlePaymentMethod('online')}
                                        className="group relative w-full overflow-hidden rounded-lg border-2 border-primary-200 bg-white p-4 transition-all hover:border-primary-400 hover:shadow-lg cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 group-hover:bg-primary-200">
                                                <CreditCard className="h-6 w-6 text-primary-600" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-semibold text-gray-900">{t('checkout.payWithChapa')}</h4>
                                                <p className="text-sm text-gray-600">{t('checkout.secureOnlinePayment')}</p>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Offline Payment */}
                                    <button
                                        onClick={() => handlePaymentMethod('offline')}
                                        className="group relative w-full overflow-hidden rounded-lg border-2 border-primary-200 bg-white p-4 transition-all hover:border-primary-400 hover:shadow-lg cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 group-hover:bg-primary-200">
                                                <Upload className="h-6 w-6 text-primary-600" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-semibold text-gray-900">{t('checkout.payUploadProof')}</h4>
                                                <p className="text-sm text-gray-600">{t('checkout.bankTransfer')}</p>
                                            </div>
                                        </div>
                                    </button>

                                    <Button variant="outline" onClick={() => setShowPaymentMethods(false)} className="w-full">
                                        {t('checkout.back')}
                                    </Button>
                                </div>
                            )}

                            {/* How tax is calculated - dialog trigger */}
                            {activeTaxes && activeTaxes.length > 0 && (
                                <div className="mt-4 text-xs text-gray-500">
                                    <button
                                        type="button"
                                        onClick={() => setShowTaxInfoDialog(true)}
                                        className="underline hover:text-gray-700 cursor-pointer"
                                    >
                                        {t('checkout.howWeCalculateTax')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tax Info Dialog */}
                {activeTaxes && activeTaxes.length > 0 && (
                    <TaxInfoDialog
                        isOpen={showTaxInfoDialog}
                        onClose={() => setShowTaxInfoDialog(false)}
                        activeTaxes={activeTaxes}
                    />
                )}

                {/* Offline Payment Dialog */}
                {pendingOrderId && (
                    <OfflinePaymentDialog
                        isOpen={showOfflinePaymentDialog}
                        onClose={() => {
                            setShowOfflinePaymentDialog(false);
                            setPendingOrderId(null);
                        }}
                        orderId={pendingOrderId}
                        totalAmount={taxCalc.total}
                        currency="ETB"
                        cartItems={cartItemsData}
                        subtotal={subtotal}
                        taxBreakdown={taxBreakdown}
                        paymentType="regular"
                    />
                )}
            </div>
        </div>
    );
}

export default function Show() {
    const { t } = useTranslation()
    return (
        <CartProvider>
            <MainLayout title={t('checkout.checkout')}>
                <CheckoutContent />
            </MainLayout>
        </CartProvider>
    );
}
