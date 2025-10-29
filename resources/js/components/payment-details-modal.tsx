import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Building, Smartphone, Upload } from 'lucide-react';
import React from 'react';

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
    if (!selectedMethod) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        {selectedMethod.type === 'bank' ? (
                            <Building className="h-6 w-6 text-primary-600" />
                        ) : (
                            <Smartphone className="h-6 w-6 text-green-600" />
                        )}
                        Complete Payment Details
                    </DialogTitle>
                    <DialogDescription>
                        Please provide the required information for your {selectedMethod.name} payment
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header Row with Payment Method and Amount */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        {/* Selected Payment Method Info */}
                        <div className="xl:col-span-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Selected Payment Method</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                {selectedMethod.type === 'bank' ? (
                                                    <Building className="h-5 w-5 text-primary-600" />
                                                ) : (
                                                    <Smartphone className="h-5 w-5 text-green-600" />
                                                )}
                                                <div>
                                                    <p className="font-medium">{selectedMethod.name}</p>
                                                    <p className="text-sm text-gray-600">{selectedMethod.description}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="rounded border bg-gray-50 p-3">
                                                <h5 className="mb-2 font-medium text-gray-900">Payment Instructions:</h5>
                                                <p className="text-sm text-gray-700">{selectedMethod.instructions}</p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h5 className="mb-2 font-medium text-gray-900">Payment Details:</h5>
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
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payment Amount */}
                        <div className="xl:col-span-1">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Amount to Pay</p>
                                        <p className="text-3xl font-bold text-primary-600">{formatPrice(totalAmount)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Payment Details Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Details</CardTitle>
                            <CardDescription>Provide details about your payment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                                <div className="xl:col-span-1">
                                    <Label htmlFor="modal_payment_reference">Payment Reference (Optional)</Label>
                                    <Input
                                        id="modal_payment_reference"
                                        placeholder="Transaction ID, reference number, etc."
                                        value={paymentReference}
                                        onChange={(e) => onPaymentReferenceChange(e.target.value)}
                                    />
                                    {errors.payment_reference && (
                                        <p className="mt-1 text-sm text-red-600">{errors.payment_reference}</p>
                                    )}
                                </div>

                                <div className="xl:col-span-3">
                                    <Label htmlFor="modal_payment_notes">Additional Notes (Optional)</Label>
                                    <Textarea
                                        id="modal_payment_notes"
                                        placeholder="Any additional information about your payment..."
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
                    </Card>

                    {/* Upload Payment Screenshot */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Upload Payment Screenshot
                            </CardTitle>
                            <CardDescription>Upload a clear screenshot of your payment confirmation (Max 5MB)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                <div className="xl:col-span-1">
                                    <Label htmlFor="modal_payment_screenshot">Payment Screenshot *</Label>
                                    <Input
                                        id="modal_payment_screenshot"
                                        type="file"
                                        accept="image/*"
                                        required
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            onPaymentScreenshotChange(file || null);
                                        }}
                                        className="mt-1"
                                    />
                                    {errors.payment_screenshot && (
                                        <p className="mt-1 text-sm text-red-600">{errors.payment_screenshot}</p>
                                    )}
                                    <p className="mt-2 text-sm text-gray-600">Accepted formats: JPG, PNG, GIF. Maximum size: 5MB</p>
                                </div>
                                
                                {paymentScreenshot && (
                                    <div className="xl:col-span-2 flex items-center justify-center p-6 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Upload className="h-8 w-8 text-green-600" />
                                            </div>
                                            <p className="text-lg font-medium text-green-800">File Selected Successfully</p>
                                            <p className="text-sm text-green-600 truncate max-w-full mt-1">
                                                {paymentScreenshot.name}
                                            </p>
                                            <p className="text-sm text-green-500 mt-1">
                                                File size: {(paymentScreenshot.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
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
                            Cancel & Select Different Method
                        </Button>
                        <Button
                            type="button"
                            onClick={onConfirm}
                            className="flex-1 bg-primary-600 hover:bg-primary-700"
                            disabled={isProcessing || !paymentScreenshot}
                        >
                            {isProcessing ? 'Submitting...' : 'Submit Payment Proof'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
