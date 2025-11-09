'use client';

import AdminLayout from '@/layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaymentRejectionReason {
    id: number;
    reason_code: string;
    reason_text: string;
    description: string | null;
    applies_to: string[];
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    reasons: PaymentRejectionReason[];
}

export default function PaymentRejectionReasonsIndex({ reasons }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingReason, setEditingReason] = useState<PaymentRejectionReason | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const form = useForm({
        reason_code: '',
        reason_text: '',
        description: '',
        applies_to: ['both'] as string[],
        is_active: true,
        sort_order: 0,
    });

    const openCreateDialog = () => {
        form.reset();
        form.setData({
            reason_code: '',
            reason_text: '',
            description: '',
            applies_to: ['both'],
            is_active: true,
            sort_order: 0,
        });
        setEditingReason(null);
        setDialogOpen(true);
    };

    const openEditDialog = (reason: PaymentRejectionReason) => {
        form.setData({
            reason_code: reason.reason_code,
            reason_text: reason.reason_text,
            description: reason.description || '',
            applies_to: reason.applies_to,
            is_active: reason.is_active,
            sort_order: reason.sort_order,
        });
        setEditingReason(reason);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingReason(null);
        form.reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingReason) {
            form.patch(route('admin.payment-rejection-reasons.update', editingReason.id), {
                preserveScroll: true,
                onSuccess: () => {
                    closeDialog();
                },
            });
        } else {
            form.post(route('admin.payment-rejection-reasons.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    closeDialog();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        router.delete(route('admin.payment-rejection-reasons.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteConfirm(null);
            },
        });
    };

    const toggleAppliesTo = (value: string) => {
        const current = form.data.applies_to;
        if (current.includes(value)) {
            form.setData('applies_to', current.filter((v) => v !== value));
        } else {
            form.setData('applies_to', [...current, value]);
        }
    };

    return (
        <AdminLayout>
            <Head title="Payment Rejection Reasons" />
            
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Payment Rejection Reasons</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage predefined reasons for rejecting payments
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="mt-4 sm:mt-0">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Reason
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Rejection Reasons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {reasons.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No rejection reasons configured. Click "Add Reason" to create one.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reasons.map((reason) => (
                                    <div
                                        key={reason.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-medium">{reason.reason_text}</h3>
                                                {!reason.is_active && (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                                <Badge variant="outline">
                                                    {reason.applies_to.join(', ')}
                                                </Badge>
                                            </div>
                                            {reason.description && (
                                                <p className="text-sm text-gray-600 mt-1">{reason.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span>Code: {reason.reason_code}</span>
                                                <span>Sort: {reason.sort_order}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(reason)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteConfirm(reason.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingReason ? 'Edit Rejection Reason' : 'Add Rejection Reason'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure a predefined reason for rejecting payments
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="reason_code">Reason Code *</Label>
                                    <Input
                                        id="reason_code"
                                        value={form.data.reason_code}
                                        onChange={(e) => form.setData('reason_code', e.target.value)}
                                        placeholder="e.g., insufficient_funds"
                                        disabled={!!editingReason}
                                    />
                                    {form.errors.reason_code && (
                                        <p className="text-sm text-red-600 mt-1">{form.errors.reason_code}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="sort_order">Sort Order</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={form.data.sort_order}
                                        onChange={(e) => form.setData('sort_order', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="reason_text">Reason Text *</Label>
                                <Input
                                    id="reason_text"
                                    value={form.data.reason_text}
                                    onChange={(e) => form.setData('reason_text', e.target.value)}
                                    placeholder="e.g., Insufficient Funds"
                                />
                                {form.errors.reason_text && (
                                    <p className="text-sm text-red-600 mt-1">{form.errors.reason_text}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Detailed description of this rejection reason"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label>Applies To *</Label>
                                <div className="flex gap-4 mt-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="product_request"
                                            checked={form.data.applies_to.includes('product_request')}
                                            onCheckedChange={() => toggleAppliesTo('product_request')}
                                        />
                                        <Label htmlFor="product_request" className="font-normal">
                                            Product Requests
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="normal_purchase"
                                            checked={form.data.applies_to.includes('normal_purchase')}
                                            onCheckedChange={() => toggleAppliesTo('normal_purchase')}
                                        />
                                        <Label htmlFor="normal_purchase" className="font-normal">
                                            Normal Purchases
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="both"
                                            checked={form.data.applies_to.includes('both')}
                                            onCheckedChange={() => toggleAppliesTo('both')}
                                        />
                                        <Label htmlFor="both" className="font-normal">
                                            Both
                                        </Label>
                                    </div>
                                </div>
                                {form.errors.applies_to && (
                                    <p className="text-sm text-red-600 mt-1">{form.errors.applies_to}</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) => form.setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="font-normal">
                                    Active
                                </Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {editingReason ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Rejection Reason</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this rejection reason? This action cannot be undone.
                            If this reason is being used by existing payments, you will not be able to delete it.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeleteConfirm(null)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

