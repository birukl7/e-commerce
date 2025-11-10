import MainLayout from '@/layouts/app/main-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Percent, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type TaxSetting = {
    id: number;
    name: string;
    type: 'percentage' | 'fixed';
    rate: number;
    formatted_rate: string;
    description?: string;
};

export default function TaxInfo({ activeTaxes = [] as TaxSetting[] }: { activeTaxes: TaxSetting[] }) {
    const { t } = useTranslation();

    return (
        <MainLayout title={t('tax.title')}>
            <Head title={t('tax.title')} />

            <div className="py-10">
                <div className="mx-auto max-w-3xl px-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">{t('tax.title')}</h1>
                        <p className="mt-2 text-muted-foreground">
                            {t('tax.description')}
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                {t('tax.overview')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                {t('tax.overviewDescription')}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Percent className="h-5 w-5" />
                                    {t('tax.currentActiveTaxRates')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {activeTaxes.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">{t('tax.noActiveTaxRates')}</p>
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


