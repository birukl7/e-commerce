import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Building, Smartphone, Upload } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PaymentMethod {
    id: number;
    name: string;
    type: string;
    description: string;
    instructions: string;
    details: any;
}

interface PaymentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    selectedMethod: PaymentMethod | null;
    paymentReference: string;
    onPaymentReferenceChange: (value: string) => void;
    paymentNotes: string;
    onPaymentNotesChange: (value: string) => void;
    paymentScreenshot: File | null;
    onPaymentScreenshotChange: (file: File | null) => void;
    errors: {
        payment_reference?: string;
        payment_notes?: string;
        payment_screenshot?: string;
    };
    isProcessing: boolean;
    formatPrice: (price: number) => string;
    totalAmount: number;
    currency: string;
}

export default function PaymentDetailsModal({
    isOpen,
    onClose,
    onConfirm,
    selectedMethod,
    paymentReference,
    onPaymentReferenceChange,
    paymentNotes,
    onPaymentNotesChange,
    paymentScreenshot,
    onPaymentScreenshotChange,
    errors,
    isProcessing,
    formatPrice,
    totalAmount,
    currency,
}: PaymentDetailsModalProps) {
    const { t } = useTranslation();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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

    if (!selectedMethod) return null;

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
        onPaymentScreenshotChange(file);
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file && !file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }
        onPaymentScreenshotChange(file);
    };

    const removeFile = () => {
        onPaymentScreenshotChange(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto sm:w-[90vw] md:w-[85vw] lg:w-[75vw] xl:w-[70vw] 2xl:max-w-7xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        {selectedMethod.type === 'bank' ? (
                            <Building className="h-6 w-6 text-primary-600" />
                        ) : (
                            <Smartphone className="h-6 w-6 text-green-600" />
                        )}
                        {t('payment.uploadPaymentProof')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('payment.chooseHowYouMadePayment')}: {selectedMethod.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header Row with Payment Method and Amount */}
                    <div className="">
                        {/* Selected Payment Method Info */}
                        <div className="w-full">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">{t('payment.selectPaymentMethod')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between flex-col">
                                        <div>
                                            <h5 className="mb-2 font-medium text-gray-900">{t('orders.paymentDetails')}</h5>
                                            <div className="rounded border bg-gray-50 p-3">
                                                <div className="space-y-1 text-sm">
                                                    {Object.entries(selectedMethod.details).map(([key, value]: [string, any]) => (
                                                        <div key={key} className="flex justify-between">
                                                            <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                                                            <span className="font-medium">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <Card>
                                            <CardContent className="pt-2">
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">{t('payment.totalToPay')}</p>
                                                    <p className="text-3xl font-bold text-primary-600">{formatPrice(totalAmount)}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </div>

                    {/* Payment Details Form */}
                    {/* <Card>
                        <CardHeader>
                            <CardTitle>{t('orders.paymentDetails')}</CardTitle>
                            <CardDescription>{t('payment.paymentInformation')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                                <div className="xl:col-span-1">
                                    <Label htmlFor="modal_payment_reference">{t('orders.paymentReference')}</Label>
                                    <Input
                                        id="modal_payment_reference"
                                        value={paymentReference}
                                        onChange={(e) => onPaymentReferenceChange(e.target.value)}
                                    />
                                    {errors.payment_reference && (
                                        <p className="mt-1 text-sm text-red-600">{errors.payment_reference}</p>
                                    )}
                                </div>

                                <div className="xl:col-span-3">
                                    <Label htmlFor="modal_payment_notes">{t('orders.paymentDetails')}</Label>
                                    <Textarea
                                        id="modal_payment_notes"
                                        rows={4}
                                        value={paymentNotes}
                                        onChange={(e) => onPaymentNotesChange(e.target.value)}
                                    />
                                    {errors.payment_notes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.payment_notes}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card> */}

                    {/* Upload Payment Screenshot */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                {t('payment.teamReviewScreenshot')}
                            </CardTitle>
                            <CardDescription>{t('payment.proofSubmittedPending')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                <div className="xl:col-span-1">
                                    {/* <Label htmlFor="modal_payment_screenshot">{t('payment.paymentProofSubmitted')}</Label> */}
                                    <div
                                        onDragOver={onDragOver}
                                        onDrop={onDrop}
                                        onClick={openFilePicker}
                                        className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center hover:bg-gray-100"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            id="modal_payment_screenshot"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={onFileChange}
                                        />
                                        <Upload className="mb-2 h-6 w-6 text-gray-500" />
                                        <p className="text-sm text-gray-700">{t('checkout.payUploadProof')}</p>
                                        <p className="text-xs text-gray-500">{t('checkout.bankTransfer')}</p>
                                        <p className="mt-2 text-xs text-gray-400">PNG, JPG, GIF · 5MB max</p>
                                    </div>
                                    {errors.payment_screenshot && (
                                        <p className="mt-2 text-sm text-red-600">{errors.payment_screenshot}</p>
                                    )}
                                </div>
                                {paymentScreenshot && previewUrl && (
                                    <div className="xl:col-span-2">
                                        <div className="overflow-hidden rounded-lg border bg-white">
                                            <div className="flex items-center justify-between border-b px-4 py-2">
                                                <div className="text-sm text-gray-600 truncate pr-4">
                                                    {paymentScreenshot.name} · {(paymentScreenshot.size / 1024 / 1024).toFixed(2)} MB
                                                </div>
                                              
                                            </div>
                                            <div className="max-h-[60vh] overflow-auto bg-gray-50">
                                                <img
                                                    src={previewUrl}
                                                    alt="Payment proof preview"
                                                    className="mx-auto block h-auto max-w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isProcessing}
                        >
                            <X className="mr-2 h-4 w-4" />
                            {t('payment.back')}
                        </Button>
                        <Button
                            type="button"
                            onClick={onConfirm}
                            className="flex-1 bg-primary-600 hover:bg-primary-700"
                            disabled={isProcessing || !paymentScreenshot}
                        >
                            {isProcessing ? t('payment.processing') : t('payment.submitPaymentProof')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
