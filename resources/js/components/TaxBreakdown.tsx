import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Receipt, Percent, DollarSign } from 'lucide-react';
import { useTaxCalculation } from '@/hooks/useTaxCalculation';

interface TaxSetting {
    id: number;
    name: string;
    type: 'percentage' | 'fixed';
    rate: number;
    formatted_rate: string;
    description: string;
}

interface TaxBreakdownProps {
    subtotal: number;
    activeTaxes: TaxSetting[];
    currency?: string;
}

const TaxBreakdown: React.FC<TaxBreakdownProps> = ({
    subtotal,
    activeTaxes,
    currency = 'ETB'
}) => {
    const taxCalculation = useTaxCalculation(subtotal, activeTaxes);
    
    const formatCurrency = (amount: number) => {
        return `${currency} ${amount.toFixed(2)}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    Order Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(taxCalculation.subtotal)}</span>
                </div>

                {/* Taxes */}
                {taxCalculation.taxes.length > 0 && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Taxes & Fees</h4>
                            {taxCalculation.taxes.map((tax) => (
                                <div key={tax.id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        {tax.type === 'percentage' ? (
                                            <Percent className="h-3 w-3 text-muted-foreground" />
                                        ) : (
                                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                                        )}
                                        <span className="text-sm">{tax.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {tax.formatted_rate}
                                        </Badge>
                                    </div>
                                    <span className="text-sm font-medium">
                                        {formatCurrency(tax.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Total Tax Amount */}
                {taxCalculation.total_tax_amount > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Tax</span>
                        <span className="font-medium">{formatCurrency(taxCalculation.total_tax_amount)}</span>
                    </div>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-primary">
                        {formatCurrency(taxCalculation.total)}
                    </span>
                </div>

                {/* Tax Information */}
                {taxCalculation.taxes.length > 0 && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                            All applicable taxes and fees are included in the total amount.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TaxBreakdown;
