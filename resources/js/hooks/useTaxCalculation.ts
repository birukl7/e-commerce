import { useMemo } from 'react';

interface TaxSetting {
    id: number;
    name: string;
    type: 'percentage' | 'fixed';
    rate: number;
    formatted_rate: string;
    description: string;
}

interface TaxCalculation {
    taxes: Array<{
        id: number;
        name: string;
        type: 'percentage' | 'fixed';
        rate: number;
        amount: number;
        formatted_rate: string;
        description: string;
    }>;
    total_tax_amount: number;
    subtotal: number;
    total: number;
}

export function useTaxCalculation(subtotal: number, activeTaxes: TaxSetting[]): TaxCalculation {
    return useMemo(() => {
        const taxes = activeTaxes.map(tax => {
            let amount = 0;
            
            if (tax.type === 'percentage') {
                amount = (subtotal * tax.rate) / 100;
            } else {
                amount = tax.rate; // Fixed amount
            }

            return {
                id: tax.id,
                name: tax.name,
                type: tax.type,
                rate: tax.rate,
                amount: amount,
                formatted_rate: tax.formatted_rate,
                description: tax.description,
            };
        });

        const totalTaxAmount = taxes.reduce((sum, tax) => sum + tax.amount, 0);
        const total = subtotal + totalTaxAmount;

        return {
            taxes,
            total_tax_amount: totalTaxAmount,
            subtotal,
            total,
        };
    }, [subtotal, activeTaxes]);
}
