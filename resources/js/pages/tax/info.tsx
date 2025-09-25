import MainLayout from '@/layouts/app/main-layout';
import { Head } from '@inertiajs/react';
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

export default function TaxInfo({ activeTaxes = [] as TaxSetting[] }: { activeTaxes: TaxSetting[] }) {
    return (
        <MainLayout title="How We Calculate Tax">
            <Head title="How We Calculate Tax" />

            <div className="py-10">
                <div className="mx-auto max-w-3xl px-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">How We Calculate Tax</h1>
                        <p className="mt-2 text-muted-foreground">
                            We apply applicable taxes to your order based on configured tax classes and rates. Below is a high-level overview.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
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

                    <div className="mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
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
                </div>
            </div>
        </MainLayout>
    );
}


