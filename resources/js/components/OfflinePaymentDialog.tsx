import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Building, Check, Copy, Link as LinkIcon, Loader2, Phone, ShieldCheck, Smartphone, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppAlertDialog, { AppAlertType } from '@/components/AppAlertDialog';

interface OfflinePaymentMethod {
    id: number;
    name: string;
    type: string;
    description: string;
    instructions: string;
    details: Record<string, any>;
    logo?: string;
}

interface TaxBreakdownItem {
    name: string;
    amount: number;
    rate: number;
}

interface OfflinePaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    totalAmount: number;
    currency: string;
    cartItems: Array<{
        id: number;
        name: string;
        price: number;
        quantity: number;
        image?: string;
    }>;
    subtotal?: number;
    taxBreakdown?: TaxBreakdownItem[];
    paymentType?: string;
    productRequestId?: number;
    description?: string;
}

export default function OfflinePaymentDialog({
    isOpen,
    onClose,
    orderId,
    totalAmount,
    currency,
    cartItems,
    subtotal,
    taxBreakdown,
    paymentType = 'regular',
    productRequestId,
    description,
}: OfflinePaymentDialogProps) {
    const { t } = useTranslation();
    const { auth } = usePage<{ auth?: { user?: { id: number; name: string; email: string; phone?: string | null } } }>().props;
    const [offlinePaymentMethods, setOfflinePaymentMethods] = useState<OfflinePaymentMethod[]>([]);
    const [selectedOfflineMethod, setSelectedOfflineMethod] = useState('');
    const [paymentReference, setPaymentReference] = useState('');
    const [customerPhone, setCustomerPhone] = useState(auth?.user?.phone || '');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verifyingStep, setVerifyingStep] = useState<string>('Verifying transaction reference with bank...');
    const [copied, setCopied] = useState(false);

    // In-App Alert Dialog State
    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        title?: string;
        message: string;
        type?: AppAlertType;
    }>({
        isOpen: false,
        message: '',
        type: 'error',
    });

    const showAlert = (message: string, title?: string, type: AppAlertType = 'error') => {
        setAlertState({
            isOpen: true,
            title,
            message,
            type,
        });
    };

    // Simple URL builder
    const buildUrl = (path: string, params?: Record<string, any>) => {
        if (!params) return path;
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (typeof value === 'object') {
                search.set(key, JSON.stringify(value));
            } else {
                search.set(key, String(value));
            }
        });
        const qs = search.toString();
        return qs ? `${path}?${qs}` : path;
    };

    const offlineForm = useForm({
        order_id: orderId,
        amount: totalAmount,
        currency: currency,
        offline_payment_method_id: '',
        customer_phone: auth?.user?.phone || '',
        payment_reference: '',
        payment_notes: '',
    });

    useEffect(() => {
        if (isOpen) {
            createOrderIfNeeded();
            fetchOfflinePaymentMethods();
            if (!customerPhone && auth?.user?.phone) {
                setCustomerPhone(auth.user.phone);
            }
        } else {
            setSelectedOfflineMethod('');
            setPaymentReference('');
            setPaymentNotes('');
            offlineForm.reset();
        }
    }, [isOpen]);

    const createOrderIfNeeded = async () => {
        try {
            const url = buildUrl('/payment/process', {
                order_id: orderId,
                amount: totalAmount,
                currency: currency,
                payment_method: 'offline',
                cart_items: cartItems,
            });
            await fetch(url, {
                method: 'GET',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
        } catch (error) {
            console.error('Error ensuring order exists:', error);
        }
    };

    const fetchOfflinePaymentMethods = async () => {
        setIsLoading(true);
        try {
            const url = '/payment/offline/methods';
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.methods && data.methods.length > 0) {
                    setOfflinePaymentMethods(data.methods);
                    setSelectedOfflineMethod(data.methods[0].id.toString());
                }
            } else {
                console.error('Failed to fetch offline payment methods:', response.status);
            }
        } catch (error) {
            console.error('Error fetching offline payment methods:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentMethod = offlinePaymentMethods.find(m => m.id.toString() === selectedOfflineMethod);
    const details = currentMethod?.details || {};
    const accountNumber = details.account_number || details.phone_number || details.till_number || 'N/A';
    const accountName = details.account_name || details.name || '';
    const bankName = details.bank_name || currentMethod?.name || '';

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOfflineSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedOfflineMethod) {
            showAlert('Please select a payment method before proceeding.', 'Payment Method Required', 'warning');
            return;
        }

        if (!customerPhone.trim()) {
            showAlert('Please enter your mobile phone number so our admin team can contact you.', 'Mobile Number Required', 'warning');
            return;
        }

        const cleanedPhone = customerPhone.replace(/[\s\-()]/g, '');
        if (cleanedPhone.length < 9) {
            showAlert('Please enter a valid mobile phone number with at least 9 digits.', 'Invalid Mobile Number', 'warning');
            return;
        }

        if (!paymentReference.trim()) {
            showAlert('Please enter your transaction reference number or receipt link.', 'Reference Required', 'warning');
            return;
        }

        setIsSubmitting(true);
        setVerifyingStep('Verifying transaction reference with bank...');

        // Step-up messages for clear live feedback while links.et talks to upstream bank
        const stepTimer1 = setTimeout(() => {
            setVerifyingStep('Verifying receipt with bank at source via links.et...');
        }, 2000);

        const stepTimer2 = setTimeout(() => {
            setVerifyingStep('Validating reference and settled amount against order...');
        }, 5000);

        try {
            const formData = new FormData();
            const formFields = {
                order_id: orderId,
                amount: totalAmount.toString(),
                currency: currency,
                offline_payment_method_id: selectedOfflineMethod,
                customer_phone: customerPhone.trim(),
                payment_reference: paymentReference.trim(),
                payment_notes: paymentNotes,
                payment_type: paymentType || 'regular',
                product_request_id: productRequestId?.toString() || '',
                description: description || '',
                _token: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            };

            Object.entries(formFields).forEach(([key, value]) => {
                formData.append(key, value as string);
            });

            if (cartItems && cartItems.length > 0) {
                formData.append('cart_items', JSON.stringify(cartItems));
            }

            offlineForm.clearErrors();

            const submitUrl = '/payment/offline/submit';
            const response = await fetch(submitUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': formData.get('_token') as string,
                },
                credentials: 'same-origin',
            });

            if (response.redirected) {
                localStorage.removeItem('cartItems');
                window.location.href = response.url;
                return;
            }

            const contentType = response.headers.get('content-type');
            let result;

            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                throw new Error(`Unexpected response type: ${contentType}`);
            }

            if (response.ok) {
                if (result.redirect) {
                    localStorage.removeItem('cartItems');
                    window.location.href = result.redirect;
                    return;
                } else if (result.url) {
                    localStorage.removeItem('cartItems');
                    window.location.href = result.url;
                    return;
                }
            } else {
                if (result.errors) {
                    if (result.errors.customer_phone) {
                        offlineForm.setError('customer_phone', result.errors.customer_phone[0]);
                    }
                    if (result.errors.payment_reference) {
                        offlineForm.setError('payment_reference', result.errors.payment_reference[0]);
                    }
                }

                if (result.message) {
                    showAlert(result.message, 'Payment Could Not Be Processed', 'error');
                } else {
                    showAlert('Payment could not be processed at this time. Please check your payment details or try again.', 'Payment Failed', 'error');
                }
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Error submitting payment:', error);
            showAlert(error instanceof Error ? error.message : 'An unexpected error occurred while processing your payment. Please try again.', 'Payment Error', 'error');
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[92vh] overflow-y-auto bg-[#09090b] text-white border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                {/* Header Row: Total Due */}
                <div className="relative text-center space-y-1 mb-4">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">TOTAL DUE</span>
                    <div className="flex items-baseline justify-center gap-1.5">
                        <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                            {Math.round(totalAmount)}
                        </span>
                        <span className="text-sm font-bold text-zinc-400">{currency || 'ETB'}</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-2">
                        <span className="px-3 py-1 rounded-full bg-zinc-900 text-zinc-300 text-xs font-semibold border border-zinc-800">
                            Order #{orderId.slice(-8)}
                        </span>
                        {cartItems && cartItems.length > 0 && (
                            <span className="px-3 py-1 rounded-full bg-zinc-900 text-zinc-300 text-xs font-semibold border border-zinc-800">
                                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="h-px bg-zinc-800/70 mb-6" />

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                        <p className="text-sm font-medium text-zinc-400">Loading payment methods...</p>
                    </div>
                ) : (
                    <form onSubmit={handleOfflineSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {/* Left Column: Step 1 & Step 2 */}
                            <div className="space-y-6">
                                {/* Step 1: Choose your payment method */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white shrink-0">
                                            1
                                        </span>
                                        <h4 className="text-sm font-bold text-white">Choose your payment method</h4>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {offlinePaymentMethods.map((method) => {
                                            const isSelected = selectedOfflineMethod === method.id.toString();
                                            const isCbe = method.name.toLowerCase().includes('cbe') || method.name.toLowerCase().includes('commercial bank');
                                            const isTele = method.name.toLowerCase().includes('tele') || method.name.toLowerCase().includes('telebirr');

                                            return (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => setSelectedOfflineMethod(method.id.toString())}
                                                    className={`relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'border-white bg-zinc-800/90 ring-1 ring-white shadow-lg'
                                                            : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400'
                                                    }`}
                                                >
                                                    <div className="mb-2.5">
                                                        {isCbe ? (
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm border border-zinc-700/60 overflow-hidden">
                                                                <img
                                                                    src="/image/cbe-logo.png"
                                                                    alt="Commercial Bank of Ethiopia"
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            </div>
                                                        ) : isTele ? (
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm border border-zinc-700/60 overflow-hidden">
                                                                <img
                                                                    src="/image/telebirr-logo.png"
                                                                    alt="Telebirr"
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            </div>
                                                        ) : method.logo ? (
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm border border-zinc-700/60 overflow-hidden">
                                                                <img
                                                                    src={method.logo}
                                                                    alt={method.name}
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-xs">
                                                                {method.type === 'bank' ? <Building className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-bold text-white text-center leading-tight">
                                                        {method.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Step 2: Transfer details */}
                                {currentMethod && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white shrink-0">
                                                2
                                            </span>
                                            <h4 className="text-sm font-bold text-white">
                                                Transfer exactly {Math.round(totalAmount)} {currency || 'ETB'}
                                            </h4>
                                        </div>

                                        <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 sm:p-5">
                                            <div className="overflow-hidden">
                                                <p className="text-xl sm:text-2xl font-bold font-mono tracking-wider text-white truncate">
                                                    {accountNumber}
                                                </p>
                                                <p className="text-xs font-semibold text-zinc-400 mt-1 uppercase tracking-wide truncate">
                                                    {accountName || bankName}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(accountNumber)}
                                                className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer shrink-0 ml-3"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="h-4 w-4 text-green-400" />
                                                        <span className="text-green-400">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4" />
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Step 3 & Submit Button */}
                            <div className="space-y-6 flex flex-col justify-between">
                                {/* Step 3: Contact & Payment Reference */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white shrink-0">
                                            3
                                        </span>
                                        <h4 className="text-sm font-bold text-white">Contact & Payment Reference</h4>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Required Mobile Phone Field */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 text-zinc-400" />
                                                    Contact Mobile Number <span className="text-red-400">*</span>
                                                </label>
                                                <span className="text-[11px] text-zinc-500 font-medium">Required for contact</span>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="e.g. 0911223344 or +251911223344"
                                                    value={customerPhone}
                                                    onChange={(e) => {
                                                        setCustomerPhone(e.target.value);
                                                        if (offlineForm.errors.customer_phone) {
                                                            offlineForm.clearErrors('customer_phone');
                                                        }
                                                    }}
                                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-10 pr-9 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all font-mono"
                                                />
                                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                {customerPhone && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCustomerPhone('')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {offlineForm.errors.customer_phone && (
                                                <p className="mt-1.5 text-xs text-red-400 font-medium">{offlineForm.errors.customer_phone}</p>
                                            )}
                                            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                                                Our admin team will use this number to contact you to confirm payment & arrange delivery.
                                            </p>
                                        </div>

                                        {/* Required Transaction Reference Field */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-xs font-semibold text-zinc-300">
                                                    Transaction Reference or Receipt Link <span className="text-red-400">*</span>
                                                </label>
                                                <span className="text-[11px] text-zinc-500 font-medium">Required</span>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Paste Telebirr ref (e.g. 1045...), CBE FT..., or receipt URL"
                                                    value={paymentReference}
                                                    onChange={(e) => {
                                                        setPaymentReference(e.target.value);
                                                        if (offlineForm.errors.payment_reference) {
                                                            offlineForm.clearErrors('payment_reference');
                                                        }
                                                    }}
                                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-10 pr-9 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all font-mono"
                                                />
                                                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                {paymentReference && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPaymentReference('')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {offlineForm.errors.payment_reference && (
                                                <p className="mt-1.5 text-xs text-red-400 font-medium">{offlineForm.errors.payment_reference}</p>
                                            )}
                                            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                                                Copy and paste the transaction reference ID from your banking SMS/confirmation screen (Telebirr, CBE Birr, Commercial Bank) or the web receipt link.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                                Sender Notes <span className="text-zinc-500 font-normal">(optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Remarks or special instructions"
                                                value={paymentNotes}
                                                onChange={(e) => setPaymentNotes(e.target.value)}
                                                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                                            />
                                        </div>

                                        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 flex items-start gap-2.5">
                                            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                            <div className="text-[11px] text-zinc-400 leading-relaxed">
                                                <span className="text-zinc-300 font-medium">Automatic verification:</span> Our system instantly cross-references your transaction reference against the banking network.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !selectedOfflineMethod || !paymentReference.trim() || !customerPhone.trim()}
                                        className="w-full rounded-full bg-white py-4 text-base font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 shadow-lg cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
                                                <span className="text-sm font-semibold">{verifyingStep}</span>
                                            </>
                                        ) : (
                                            <span>Confirm Payment</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Full dialog live verification loader overlay */}
                        {isSubmitting && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-3xl bg-black/85 backdrop-blur-md p-6 text-center animate-in fade-in duration-200">
                                <div className="relative flex items-center justify-center mb-5">
                                    <div className="absolute h-20 w-20 rounded-full border border-sky-500/20 animate-ping" />
                                    <div className="h-16 w-16 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                                        <ShieldCheck className="h-8 w-8 text-sky-400 animate-pulse" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Live Receipt Verification</h3>
                                <p className="text-sm text-sky-300 font-medium max-w-sm mb-4">
                                    {verifyingStep}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/90 border border-zinc-800 rounded-full px-4 py-2">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
                                    <span>Cross-checking with Ethiopian banking network via links.et</span>
                                </div>
                            </div>
                        )}
                    </form>
                )}

                {/* In-App Alert Dialog */}
                <AppAlertDialog
                    isOpen={alertState.isOpen}
                    onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
                    title={alertState.title}
                    message={alertState.message}
                    type={alertState.type}
                />
            </DialogContent>
        </Dialog>
    );
}
