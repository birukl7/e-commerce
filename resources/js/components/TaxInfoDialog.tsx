import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Percent, Info } from 'lucide-react';

type TaxSetting = {
    id: number;
    name: string;
    type: 'percentage' | 'fixed';
    rate: number;
    formatted_rate: string;
    description?: string;
};

interface TaxInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    activeTaxes: TaxSetting[];
}

export default function TaxInfoDialog({ isOpen, onClose, activeTaxes }: TaxInfoDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-[calc(100%-2rem)] sm:w-[90vw] sm:max-w-4xl md:w-[85vw] lg:w-[80vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">How We Calculate Tax</DialogTitle>
                    <DialogDescription className="text-base">
                        We apply applicable taxes to your order based on configured tax classes and rates. Below is a high-level overview.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Info className="h-5 w-5" />
                                Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                Taxes may include percentage-based rates (e.g., VAT) or fixed fees. Your final tax is the sum of all applicable
                                rules at checkout, applied to your order subtotal. Some taxes may be compound or vary by location and product class.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Percent className="h-5 w-5" />
                                Current Active Tax Rates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {activeTaxes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No active tax rates at this time.</p>
                            ) : (
                                <div className="space-y-3">
                                    {activeTaxes.map((tax) => (
                                        <div key={tax.id} className="flex items-center justify-between rounded-md border p-3">
                                            <div>
                                                <div className="font-medium">{tax.name}</div>
                                                {tax.description && (
                                                    <div className="text-xs text-muted-foreground">{tax.description}</div>
                                                )}
                                            </div>
                                            <Badge variant="outline">{tax.formatted_rate}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}

