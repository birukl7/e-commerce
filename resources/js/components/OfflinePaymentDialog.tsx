import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building, Smartphone, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import PaymentDetailsModal from './payment-details-modal';
import { useTranslation } from 'react-i18next';

interface OfflinePaymentMethod {
    id: number;
    name: string;
    type: string;
    description: string;
    instructions: string;
    details: any;
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
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [modalPaymentReference, setModalPaymentReference] = useState('');
    const [modalPaymentNotes, setModalPaymentNotes] = useState('');
    const [modalPaymentScreenshot, setModalPaymentScreenshot] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Simple URL builder to avoid Ziggy at build-time
    const buildUrl = (path: string, params?: Record<string, any>) => {
        if (!params) return path;
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            // stringify objects
            if (typeof value === 'object') {
                search.set(key, JSON.stringify(value));
            } else {
                search.set(key, String(value));
            }
        });
        const qs = search.toString();
        return qs ? `${path}?${qs}` : path;
    };

    // Form for offline payment submission
    type OfflineFormData = {
        order_id: string;
        amount: number;
        currency: string;
        offline_payment_method_id: string;
        payment_reference: string;
        payment_notes: string;
        payment_screenshot: File | null;
    };

    const offlineForm = useForm<OfflineFormData & { [key: string]: any }>({
        order_id: orderId,
        amount: totalAmount,
        currency: currency,
        offline_payment_method_id: '',
        payment_reference: '',
        payment_notes: '',
        payment_screenshot: null,
    });

    // Create order and fetch offline payment methods when dialog opens
    useEffect(() => {
        if (isOpen) {
            createOrderIfNeeded();
            fetchOfflinePaymentMethods();
        } else {
            setSelectedOfflineMethod('');
            setIsPaymentModalOpen(false);
            setModalPaymentReference('');
            setModalPaymentNotes('');
            setModalPaymentScreenshot(null);
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
                if (data.success && data.methods) {
                    setOfflinePaymentMethods(data.methods);
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === 'ETB' ? 'USD' : currency,
        })
            .format(price)
            .replace('$', currency + ' ');
    };

    const handleBankSelection = (methodId: string) => {
        setSelectedOfflineMethod(methodId);
        setModalPaymentReference('');
        setModalPaymentNotes('');
        setModalPaymentScreenshot(null);
        setIsPaymentModalOpen(true);
    };

    const handleModalClose = () => {
        setIsPaymentModalOpen(false);
        setSelectedOfflineMethod('');
        setModalPaymentReference('');
        setModalPaymentNotes('');
        setModalPaymentScreenshot(null);
    };

    const handleModalConfirm = () => {
        offlineForm.setData('payment_reference', modalPaymentReference);
        offlineForm.setData('payment_notes', modalPaymentNotes);
        offlineForm.setData('payment_screenshot', modalPaymentScreenshot);
        offlineForm.setData('offline_payment_method_id', selectedOfflineMethod);
        
        setIsPaymentModalOpen(false);
        handleOfflineSubmit(new Event('submit') as any);
    };

    const handleOfflineSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!selectedOfflineMethod) {
                alert('Please select a payment method');
                return;
            }

            const paymentScreenshot = offlineForm.data.payment_screenshot || modalPaymentScreenshot;
            if (!paymentScreenshot) {
                alert('Please upload a payment screenshot');
                return;
            }

            const formData = new FormData();
            const formFields = {
                order_id: orderId,
                amount: totalAmount.toString(),
                currency: currency,
                offline_payment_method_id: selectedOfflineMethod,
                payment_reference: modalPaymentReference || offlineForm.data.payment_reference || '',
                payment_notes: modalPaymentNotes || offlineForm.data.payment_notes || '',
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
                const text = await response.text();
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
                    if (result.errors.payment_notes) {
                        offlineForm.setError('payment_notes', result.errors.payment_notes[0]);
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
            }
        } catch (error) {
            console.error('Error submitting payment:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    if (!isLoading && offlinePaymentMethods.length === 0 && isOpen) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('payment.offlinePaymentNotAvailable')}</DialogTitle>
                        <DialogDescription>
                            {t('payment.offlinePaymentNotAvailableDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            {t('payment.goBack')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto sm:w-[90vw] md:w-[85vw] lg:w-[75vw] xl:w-[70vw] 2xl:max-w-7xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{t('payment.uploadPaymentProof')}</DialogTitle>
                        <DialogDescription className="text-base">
                            {paymentType === 'product_request_advance' ? t('payment.advancePayment') :
                             paymentType === 'product_request_final' ? t('payment.finalPayment') :
                             `${t('payment.orderId')} ${orderId}`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {/* Order Summary */}
                        {subtotal && taxBreakdown ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('checkout.orderSummary')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>{t('checkout.subtotal')}:</span>
                                            <span className="font-medium">{formatPrice(subtotal)}</span>
                                        </div>
                                        {taxBreakdown.map((tax, idx) => (
                                            <div key={idx} className="flex justify-between text-gray-600">
                                                <span>{tax.name} {tax.rate > 0 ? `(${tax.rate}%)` : ''}:</span>
                                                <span>{formatPrice(tax.amount)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between border-t pt-2 font-semibold">
                                            <span>{t('payment.totalToPay')}</span>
                                            <span className="text-primary-700">{formatPrice(totalAmount)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-medium">{t('payment.amount')}</span>
                                        <span className="text-2xl font-bold text-primary-600">{formatPrice(totalAmount)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Payment Method Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('payment.selectPaymentMethod')}</CardTitle>
                                <CardDescription>{t('payment.chooseHowYouMadePayment')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">{t('payment.processing')}</p>
                                    </div>
                                ) : (
                                    <RadioGroup value={selectedOfflineMethod} onValueChange={setSelectedOfflineMethod} className="space-y-4">
                                        {offlinePaymentMethods.map((method) => (
                                            <div key={method.id} className="space-y-3">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem 
                                                        value={method.id.toString()} 
                                                        id={`method-${method.id}`}
                                                    />
                                                    <Label htmlFor={`method-${method.id}`} className="cursor-pointer flex-1">
                                                        <div className="flex items-center gap-3">
                                                            {method.type === 'bank' ? (
                                                                <Building className="h-5 w-5 text-primary-600" />
                                                            ) : (
                                                                <Smartphone className="h-5 w-5 text-green-600" />
                                                            )}
                                                            <div>
                                                                <p className="font-medium">{method.name}</p>
                                                                <p className="text-sm text-gray-600">{method.description}</p>
                                                            </div>
                                                        </div>
                                                    </Label>
                                                </div>

                                                {selectedOfflineMethod === method.id.toString() && (
                                                    <div className="ml-6 rounded-lg bg-gray-50 p-4">
                                                        <h4 className="mb-2 font-medium text-gray-900">{t('payment.paymentInstructions')}</h4>
                                                        <p className="mb-3 text-sm text-gray-700">{method.instructions}</p>

                                                        <div className="rounded border bg-white p-3">
                                                            <h5 className="mb-2 font-medium text-gray-900">{t('orders.paymentDetails')}</h5>
                                                            <div className="space-y-1 text-sm">
                                                                {Object.entries(method.details).map(([key, value]: [string, any]) => (
                                                                    <div key={key} className="flex justify-between">
                                                                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                                                                        <span className="font-medium">{value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="mt-4">
                                                            <Button 
                                                                onClick={() => handleBankSelection(method.id.toString())}
                                                                className="w-full bg-primary-600 hover:bg-primary-700"
                                                            >
                                                                {t('payment.continueWith')} {method.name}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}
                                {offlineForm.errors.offline_payment_method_id && (
                                    <p className="mt-2 text-sm text-red-600">{offlineForm.errors.offline_payment_method_id}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Error Display */}
                        {offlineForm.errors?.general && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                <p className="text-sm text-red-600">{offlineForm.errors.general as string}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={onClose} className="flex-1" disabled={offlineForm.processing}>
                                <X className="mr-2 h-4 w-4" />
                                {t('payment.back')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Payment Details Modal */}
            <PaymentDetailsModal
                isOpen={isPaymentModalOpen}
                onClose={handleModalClose}
                onConfirm={handleModalConfirm}
                selectedMethod={offlinePaymentMethods.find(m => m.id.toString() === selectedOfflineMethod) || null}
                paymentReference={modalPaymentReference}
                onPaymentReferenceChange={setModalPaymentReference}
                paymentNotes={modalPaymentNotes}
                onPaymentNotesChange={setModalPaymentNotes}
                paymentScreenshot={modalPaymentScreenshot}
                onPaymentScreenshotChange={setModalPaymentScreenshot}
                errors={{
                    payment_reference: offlineForm.errors.payment_reference,
                    payment_notes: offlineForm.errors.payment_notes,
                    payment_screenshot: offlineForm.errors.payment_screenshot,
                }}
                isProcessing={offlineForm.processing}
                formatPrice={formatPrice}
                totalAmount={totalAmount}
                currency={currency}
            />
        </>
    );
}

