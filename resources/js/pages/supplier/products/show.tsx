import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Package, 
    Edit, 
    ArrowLeft, 
    Eye,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Star,
    ShoppingCart,
    DollarSign,
    Package2
} from 'lucide-react';
import SupplierLayout from '@/layouts/SupplierLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ProductImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    user_name: string;
    created_at: string;
}

interface Category {
    id: number;
    name: string;
}

interface Brand {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    sku: string;
    price: number;
    sale_price?: number;
    cost_price?: number;
    stock_quantity: number;
    low_stock_threshold: number;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    category_id: number;
    brand_id?: number;
    manage_stock: boolean;
    featured: boolean;
    visibility: 'private' | 'public';
    moderation_status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'suspended';
    rejection_reason?: string;
    meta_title?: string;
    meta_description?: string;
    images: ProductImage[];
    reviews: Review[];
    category?: Category;
    brand?: Brand;
    created_at: string;
    updated_at: string;
}

interface Props {
    product: Product;
}

export default function SupplierProductShow({ product }: Props) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending_review':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'suspended':
                return <AlertCircle className="h-4 w-4 text-orange-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending_review':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'suspended':
                return 'bg-orange-100 text-orange-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved':
                return 'Approved';
            case 'pending_review':
                return 'Pending Review';
            case 'rejected':
                return 'Rejected';
            case 'suspended':
                return 'Suspended';
            case 'draft':
                return 'Draft';
            default:
                return 'Unknown';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const averageRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
        : 0;

    const currentPrice = product.sale_price || product.price;
    const discountPercentage = product.sale_price 
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0;

    return (
        <SupplierLayout title="Product Details">
            <Head title={product.name} />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center space-x-4 mb-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/supplier/products">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Products
                        </Link>
                    </Button>
                </div>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <p className="mt-2 text-gray-600">SKU: {product.sku}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(product.moderation_status)}>
                            {getStatusIcon(product.moderation_status)}
                            <span className="ml-1">{getStatusText(product.moderation_status)}</span>
                        </Badge>
                        <Button asChild>
                            <Link href={`/supplier/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Product
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Rejection Reason Alert */}
            {product.moderation_status === 'rejected' && product.rejection_reason && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                    <div className="flex">
                        <XCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Product Rejected
                            </h3>
                            <p className="mt-1 text-sm text-red-700">
                                {product.rejection_reason}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Images</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {product.images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {product.images.map((image) => (
                                        <div key={image.id} className="relative group">
                                            <img
                                                src={`/storage/${image.image_path}`}
                                                alt={`${product.name} image ${image.id}`}
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            {image.is_primary && (
                                                <Badge className="absolute top-2 left-2 bg-blue-500">
                                                    Primary
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No images uploaded</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                        </CardContent>
                    </Card>

                    {/* Reviews */}
                    {product.reviews.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Reviews</CardTitle>
                                <CardDescription>
                                    {product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {product.reviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${
                                                                i < review.rating
                                                                    ? 'text-yellow-400 fill-current'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {review.user_name}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(review.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-gray-700">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Regular Price</span>
                                <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
                            </div>
                            
                            {product.sale_price && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Sale Price</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg font-semibold text-green-600">
                                                {formatCurrency(product.sale_price)}
                                            </span>
                                            <Badge variant="destructive">
                                                {discountPercentage}% OFF
                                            </Badge>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900">Current Price</span>
                                        <span className="text-xl font-bold text-primary">
                                            {formatCurrency(currentPrice)}
                                        </span>
                                    </div>
                                </>
                            )}
                            
                            {product.cost_price && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Cost Price</span>
                                    <span className="text-sm text-gray-500">{formatCurrency(product.cost_price)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Inventory */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Stock Quantity</span>
                                <span className="text-lg font-semibold">{product.stock_quantity}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Low Stock Threshold</span>
                                <span className="text-sm text-gray-500">{product.low_stock_threshold}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Stock Management</span>
                                <Badge variant={product.manage_stock ? 'default' : 'secondary'}>
                                    {product.manage_stock ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>
                            
                            {product.stock_quantity <= product.low_stock_threshold && product.manage_stock && (
                                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                                    <div className="flex items-center">
                                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                                        <span className="ml-2 text-sm text-yellow-800">
                                            Low stock warning
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Physical Attributes */}
                    {(product.weight || product.length || product.width || product.height) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Physical Attributes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {product.weight && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Weight</span>
                                        <span className="text-sm text-gray-900">{product.weight} kg</span>
                                    </div>
                                )}
                                
                                {product.length && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Length</span>
                                        <span className="text-sm text-gray-900">{product.length} cm</span>
                                    </div>
                                )}
                                
                                {product.width && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Width</span>
                                        <span className="text-sm text-gray-900">{product.width} cm</span>
                                    </div>
                                )}
                                
                                {product.height && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Height</span>
                                        <span className="text-sm text-gray-900">{product.height} cm</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Product Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Category</span>
                                <span className="text-sm text-gray-900">{product.category?.name || 'N/A'}</span>
                            </div>
                            
                            {product.brand && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Brand</span>
                                    <span className="text-sm text-gray-900">{product.brand.name}</span>
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Visibility</span>
                                <Badge variant={product.visibility === 'public' ? 'default' : 'secondary'}>
                                    {product.visibility === 'public' ? 'Public' : 'Private'}
                                </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Featured</span>
                                <Badge variant={product.featured ? 'default' : 'secondary'}>
                                    {product.featured ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Created</span>
                                <span className="text-sm text-gray-500">{formatDate(product.created_at)}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Updated</span>
                                <span className="text-sm text-gray-500">{formatDate(product.updated_at)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button asChild className="w-full">
                                <Link href={`/supplier/products/${product.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Product
                                </Link>
                            </Button>
                            
                            {product.moderation_status === 'draft' && (
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/supplier/products/${product.id}/submit`} method="post">
                                        <Package2 className="h-4 w-4 mr-2" />
                                        Submit for Review
                                    </Link>
                                </Button>
                            )}
                            
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/supplier/products">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Products
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SupplierLayout>
    );
}
