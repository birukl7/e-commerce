import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

interface TaxInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    activeTaxes: TaxSetting[];
}

export default function TaxInfoDialog({ isOpen, onClose, activeTaxes }: TaxInfoDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-[calc(100%-2rem)] sm:w-[90vw] sm:max-w-4xl md:w-[85vw] lg:w-[80vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{t('tax.title')}</DialogTitle>
                    <DialogDescription className="text-base">
                        {t('tax.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
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
            </DialogContent>
        </Dialog>
    );
}

