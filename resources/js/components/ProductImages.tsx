import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

export interface ProductItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    image?: string | null;
    slug?: string;
}

interface ProductImagesProps {
    items: ProductItem[];
    title?: string;
    showQuantity?: boolean;
    showPrice?: boolean;
    className?: string;
    itemClassName?: string;
}

export default function ProductImages({
    items,
    title = 'Order Items',
    showQuantity = true,
    showPrice = true,
    className = '',
    itemClassName = '',
}: ProductImagesProps) {
    if (!items || items.length === 0) {
        return null;
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
        }).format(price);
    };

    return (
        <Card className={className}>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow ${itemClassName}`}
                        >
                            {/* Product Image */}
                            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                       
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <Package className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    {showQuantity && (
                                        <span>
                                            Quantity: <span className="font-medium text-gray-900">{item.quantity}</span>
                                        </span>
                                    )}
                                    {showPrice && (
                                        <span>
                                            Price: <span className="font-medium text-gray-900">{formatPrice(item.price)}</span>
                                        </span>
                                    )}
                                </div>
                                {showPrice && (
                                    <div className="mt-1">
                                        <span className="text-sm font-semibold text-gray-900">
                                            Subtotal: {formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

