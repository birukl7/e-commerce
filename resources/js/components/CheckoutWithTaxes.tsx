import React from 'react';
import { usePage } from '@inertiajs/react';
import TaxBreakdown from './TaxBreakdown';

interface TaxSetting {
    id: number;
    name: string;
    type: 'percentage' | 'fixed';
    rate: number;
    formatted_rate: string;
    description: string;
}

interface PageProps {
    activeTaxes: TaxSetting[];
    [key: string]: any;
}

interface CheckoutWithTaxesProps {
    subtotal: number;
    currency?: string;
}

const CheckoutWithTaxes: React.FC<CheckoutWithTaxesProps> = ({ 
    subtotal, 
    currency = 'ETB' 
}) => {
    const { activeTaxes } = usePage<PageProps>().props;

    return (
        <div className="space-y-6">
            {/* Your existing checkout content */}
            <div>
                {/* Cart items, forms, etc. */}
            </div>

            {/* Tax Breakdown Component */}
            <TaxBreakdown 
                subtotal={subtotal}
                activeTaxes={activeTaxes}
                currency={currency}
            />
        </div>
    );
};

export default CheckoutWithTaxes;
