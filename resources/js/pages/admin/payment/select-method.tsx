
import { Head, Link } from '@inertiajs/react';
import { CreditCard, Upload } from 'lucide-react';

interface SelectProps {
    order_id: string;
    amount: number;
    currency: string;
}

export default function SelectMethod({ order_id, amount, currency }: SelectProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === 'ETB' ? 'USD' : currency,
        })
            .format(price)
            .replace('$', currency + ' ');
    };

    // Build URLs with proper query parameters
    const chapaPaymentUrl = route('payment.show', {
        order_id,
        amount,
        currency,
    });

    const offlinePaymentUrl = route('payment.show', {
        order_id,
        amount,
        currency,
        payment_method: 'offline',
    });

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Head title="Select Payment Method" />

            <div className="mx-auto max-w-2xl px-4">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">Choose Payment Method</h1>
                    <p className="text-gray-600">Order ID: {order_id}</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">Total: {formatPrice(amount)}</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Online Payment with Chapa */}
                    <Link
                        href={chapaPaymentUrl}
                        className="group relative overflow-hidden rounded-lg border-2 border-blue-200 bg-white p-6 transition-all hover:border-blue-400 hover:shadow-lg"
                    >
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200">
                                <CreditCard className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">Pay with Chapa</h3>
                            <p className="mb-4 text-sm text-gray-600">Secure, immediate online payment using cards, mobile money, or bank transfer</p>
                            <div className="inline-flex items-center font-medium text-blue-600">
                                Pay Now
                                <svg
                                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>

                    {/* Offline Payment */}
                    <Link
                        href={offlinePaymentUrl}
                        className="group relative overflow-hidden rounded-lg border-2 border-orange-200 bg-white p-6 transition-all hover:border-orange-400 hover:shadow-lg"
                    >
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-200">
                                <Upload className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">Pay & Upload Proof</h3>
                            <p className="mb-4 text-sm text-gray-600">
                                Transfer via bank/mobile app, then upload payment screenshot for verification
                            </p>
                            <div className="inline-flex items-center font-medium text-orange-600">
                                Upload Payment
                                <svg
                                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Additional Information */}
                <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment Information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <h4 className="mb-2 font-medium text-blue-900">Online Payment</h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                                <li>• Instant payment confirmation</li>
                                <li>• Secure payment gateway</li>
                                <li>• Cards, mobile money, bank transfer</li>
                                <li>• Immediate order processing</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-2 font-medium text-orange-900">Offline Payment</h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                                <li>• Manual verification required</li>
                                <li>• 2-24 hours processing time</li>
                                <li>• Bank transfer or mobile money</li>
                                <li>• Upload payment screenshot</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
