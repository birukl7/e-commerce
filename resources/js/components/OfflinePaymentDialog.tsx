import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Building, Check, Copy, Loader2, Smartphone, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface OfflinePaymentMethod {
    id: number;
    name: string;
    type: string;
    description: string;
    instructions: string;
    details: Record<string, any>;
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
    const [offlinePaymentMethods, setOfflinePaymentMethods] = useState<OfflinePaymentMethod[]>([]);
    const [selectedOfflineMethod, setSelectedOfflineMethod] = useState('');
    const [paymentReference, setPaymentReference] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        payment_reference: '',
        payment_notes: '',
        payment_screenshot: null as File | null,
    });

    useEffect(() => {
        if (isOpen) {
            createOrderIfNeeded();
            fetchOfflinePaymentMethods();
        } else {
            setSelectedOfflineMethod('');
            setPaymentReference('');
            setPaymentNotes('');
            setPaymentScreenshot(null);
            setPreviewUrl(null);
            offlineForm.reset();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!paymentScreenshot) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(paymentScreenshot);
        setPreviewUrl(url);
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [paymentScreenshot]);

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

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }
        setPaymentScreenshot(file);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file && !file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }
        setPaymentScreenshot(file);
    };

    const handleOfflineSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedOfflineMethod) {
            alert('Please select a payment method');
            return;
        }

        if (!paymentScreenshot) {
            alert('Please upload a payment screenshot');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            const formFields = {
                order_id: orderId,
                amount: totalAmount.toString(),
                currency: currency,
                offline_payment_method_id: selectedOfflineMethod,
                payment_reference: paymentReference,
                payment_notes: paymentNotes,
                payment_type: paymentType || 'regular',
                product_request_id: productRequestId?.toString() || '',
                description: description || '',
                _token: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            };

            Object.entries(formFields).forEach(([key, value]) => {
                formData.append(key, value as string);
            });

            if (paymentScreenshot) {
                formData.append('payment_screenshot', paymentScreenshot);
            }

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
                    if (result.errors.payment_reference) {
                        offlineForm.setError('payment_reference', result.errors.payment_reference[0]);
                    }
                    if (result.errors.payment_screenshot) {
                        offlineForm.setError('payment_screenshot', result.errors.payment_screenshot[0]);
                    }
                }

                if (result.message) {
                    alert(result.message);
                } else {
                    alert('An error occurred while processing your payment. Please try again.');
                }
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Error submitting payment:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold text-xs tracking-wider">
                                                                CBE
                                                            </div>
                                                        ) : isTele ? (
                                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-extrabold text-xs tracking-wider">
                                                                tele
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-xs">
                                                                {method.type === 'bank' ? <Building className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
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
                                {/* Step 3: Enter reference & upload proof */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white shrink-0">
                                            3
                                        </span>
                                        <h4 className="text-sm font-bold text-white">Enter reference number & upload proof</h4>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-zinc-400 mb-1">
                                                Transaction Reference Number
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Reference number (e.g. FT2408...)"
                                                value={paymentReference}
                                                onChange={(e) => setPaymentReference(e.target.value)}
                                                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                                            />
                                            {offlineForm.errors.payment_reference && (
                                                <p className="mt-1 text-xs text-red-400">{offlineForm.errors.payment_reference}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-zinc-400 mb-1">
                                                Payment Screenshot / Receipt <span className="text-red-400">*</span>
                                            </label>
                                            <div
                                                onDragOver={onDragOver}
                                                onDrop={onDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/60 p-4 text-center hover:border-zinc-700 hover:bg-zinc-900 transition-all"
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={onFileChange}
                                                />

                                                {paymentScreenshot && previewUrl ? (
                                                    <div className="flex items-center gap-3 w-full">
                                                        <img src={previewUrl} alt="Receipt preview" className="h-12 w-12 rounded-lg object-cover border border-zinc-700 shrink-0" />
                                                        <div className="flex-1 text-left truncate">
                                                            <p className="text-xs font-semibold text-white truncate">{paymentScreenshot.name}</p>
                                                            <p className="text-[11px] text-zinc-400">{(paymentScreenshot.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPaymentScreenshot(null);
                                                            }}
                                                            className="rounded-full bg-zinc-800 p-1.5 text-zinc-400 hover:text-white"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1.5 text-zinc-400 py-2">
                                                        <Upload className="h-5 w-5 text-zinc-300" />
                                                        <span className="text-xs font-semibold text-zinc-200">Upload receipt screenshot</span>
                                                        <span className="text-[10px] text-zinc-500">PNG, JPG or GIF up to 5MB</span>
                                                    </div>
                                                )}
                                            </div>
                                            {offlineForm.errors.payment_screenshot && (
                                                <p className="mt-1 text-xs text-red-400">{offlineForm.errors.payment_screenshot}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !paymentScreenshot}
                                        className="w-full rounded-full bg-white py-4 text-base font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 shadow-lg cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Confirming Payment...</span>
                                            </>
                                        ) : (
                                            <span>Confirm Payment</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
