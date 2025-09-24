import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import AdminLayout from '@/layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Settings, DollarSign, Percent } from 'lucide-react';

interface TaxSetting {
    id: number;
    name: string;
    type: 'percentage' | 'fixed';
    rate: number;
    description: string | null;
    is_active: boolean;
}

const TaxSettings = () => {
    interface PageProps extends InertiaPageProps {
        taxSettings: TaxSetting[];
        [key: string]: any;
    }
    
    const { taxSettings: initialTaxSettings = [] } = usePage<PageProps>().props;
    const [taxSettings, setTaxSettings] = useState<TaxSetting[]>(initialTaxSettings);
    const [isSaving, setIsSaving] = useState<Record<number, boolean>>({});

    const updateTaxSetting = async (id: number, field: string, value: any) => {
        // Optimistically update the UI
        setTaxSettings(prevSettings => 
            prevSettings.map(setting => 
                setting.id === id 
                    ? { ...setting, [field]: value } 
                    : setting
            )
        );
        
        setIsSaving(prev => ({ ...prev, [id]: true }));
        
        try {
            await router.patch(
                route('admin.tax.classes.update', id), 
                { [field]: value, _method: 'PATCH' },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Tax setting updated successfully');
                    },
                    onError: (errors: any) => {
                        console.error('Error updating tax setting:', errors);
                        toast.error('Failed to update tax setting');
                        // Revert optimistic update on error
                        setTaxSettings(initialTaxSettings);
                    },
                    onFinish: () => {
                        setIsSaving(prev => ({
                            ...prev,
                            [id]: false
                        }));
                    }
                }
            );
        } catch (error) {
            console.error('Error in updateTaxSetting:', error);
            toast.error('An error occurred while updating the tax setting');
            setTaxSettings(initialTaxSettings);
            setIsSaving(prev => ({ ...prev, [id]: false }));
        }
    };

    const toggleStatus = async (tax: TaxSetting) => {
        const originalStatus = tax.is_active;
        
        // Optimistically update the UI
        setTaxSettings(prevSettings => 
            prevSettings.map(setting => 
                setting.id === tax.id 
                    ? { ...setting, is_active: !originalStatus } 
                    : setting
            )
        );
        
        setIsSaving(prev => ({ ...prev, [tax.id]: true }));
        
        try {
            await router.post(
                route('admin.tax.rates.toggle-status', tax.id),
                { _method: 'POST' },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        const message = `${tax.name} is now ${!originalStatus ? 'active' : 'inactive'}`;
                        toast.success(message);
                    },
                    onError: (errors: any) => {
                        console.error('Error toggling tax status:', errors);
                        const errorMessage = errors?.message || 'Failed to update tax status';
                        toast.error(errorMessage);
                        // Revert optimistic update on error
                        setTaxSettings(prevSettings => 
                            prevSettings.map(setting => 
                                setting.id === tax.id 
                                    ? { ...setting, is_active: originalStatus } 
                                    : setting
                            )
                        );
                    },
                    onFinish: () => {
                        setIsSaving(prev => ({
                            ...prev,
                            [tax.id]: false
                        }));
                    }
                }
            );
        } catch (error) {
            console.error('Error in toggleStatus:', error);
            toast.error('An error occurred while updating tax status');
            // Revert optimistic update on error
            setTaxSettings(prevSettings => 
                prevSettings.map(setting => 
                    setting.id === tax.id 
                        ? { ...setting, is_active: originalStatus } 
                        : setting
                )
            );
            setIsSaving(prev => ({ ...prev, [tax.id]: false }));
        }
    };

    return (
        <AdminLayout>
            <Head title="Tax Settings" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Settings className="h-8 w-8 text-primary" />
                            <h1 className="text-3xl font-bold text-foreground">Tax Settings</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Manage tax rates and payment gateway fees for your store
                        </p>
                    </div>
                    
                    <div className="space-y-6">
                        {taxSettings.map((tax) => (
                            <Card key={tax.id} className="relative">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            {tax.name === 'Chapa Fee' ? (
                                                <DollarSign className="h-5 w-5 text-primary" />
                                            ) : (
                                                <Percent className="h-5 w-5 text-primary" />
                                            )}
                                            <CardTitle className="text-xl">{tax.name}</CardTitle>
                                        </div>
                                        <Button
                                            variant={tax.is_active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => toggleStatus(tax)}
                                            disabled={isSaving[tax.id]}
                                        >
                                            {isSaving[tax.id] && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                            {tax.is_active ? 'Active' : 'Inactive'}
                                        </Button>
                                    </div>
                                    <CardDescription>
                                        {tax.description || 'No description provided'}
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor={`rate-${tax.id}`}>Rate</Label>
                                            <div className="relative">
                                                <Input
                                                    id={`rate-${tax.id}`}
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={tax.rate}
                                                    onChange={(e) => 
                                                        updateTaxSetting(tax.id, 'rate', parseFloat(e.target.value))
                                                    }
                                                    disabled={isSaving[tax.id]}
                                                    className="pr-12"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <Badge variant="outline" className="text-xs">
                                                        {tax.type === 'percentage' ? '%' : 'ETB'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor={`type-${tax.id}`}>Type</Label>
                                            <Select
                                                value={tax.type}
                                                onValueChange={(value) => 
                                                    updateTaxSetting(tax.id, 'type', value)
                                                }
                                                disabled={isSaving[tax.id]}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percentage">Percentage</SelectItem>
                                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-2">
                                        <Label htmlFor={`description-${tax.id}`}>Description</Label>
                                        <Input
                                            id={`description-${tax.id}`}
                                            type="text"
                                            value={tax.description || ''}
                                            onChange={(e) => 
                                                updateTaxSetting(tax.id, 'description', e.target.value)
                                            }
                                            placeholder="Description (optional)"
                                            disabled={isSaving[tax.id]}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default TaxSettings;
