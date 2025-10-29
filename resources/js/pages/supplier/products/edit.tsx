import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { 
    Package, 
    Upload, 
    X, 
    Save, 
    Eye,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import SupplierLayout from '@/layouts/SupplierLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';

interface Category {
    id: number;
    name: string;
}

interface Brand {
    id: number;
    name: string;
}

interface ProductImage {
    id: number;
    image_path: string;
    is_primary: boolean;
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
    meta_title?: string;
    meta_description?: string;
    images: ProductImage[];
    category?: Category;
    brand?: Brand;
}

interface Props {
    product: Product;
    categories: Category[];
    brands: Brand[];
}

interface FormData {
    name: string;
    description: string;
    sku: string;
    price: string;
    sale_price: string;
    cost_price: string;
    stock_quantity: string;
    low_stock_threshold: string;
    weight: string;
    length: string;
    width: string;
    height: string;
    category_id: string;
    brand_id: string;
    manage_stock: boolean;
    featured: boolean;
    visibility: 'private' | 'public';
    meta_title: string;
    meta_description: string;
    images: File[];
}

export default function SupplierProductEdit({ product, categories, brands }: Props) {
    const { errors } = usePage().props as any;
    
    const { data, setData, put, processing, reset } = useForm<FormData>({
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price.toString(),
        sale_price: product.sale_price?.toString() || '',
        cost_price: product.cost_price?.toString() || '',
        stock_quantity: product.stock_quantity.toString(),
        low_stock_threshold: product.low_stock_threshold.toString(),
        weight: product.weight?.toString() || '',
        length: product.length?.toString() || '',
        width: product.width?.toString() || '',
        height: product.height?.toString() || '',
        category_id: product.category_id.toString(),
        brand_id: product.brand_id?.toString() || '',
        manage_stock: product.manage_stock,
        featured: product.featured,
        visibility: product.visibility,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        images: [],
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/supplier/products/${product.id}`, {
            onSuccess: () => {
                // Keep existing data, just clear new images
                setData('images', []);
                setImagePreviews([]);
            },
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = [...data.images, ...files];
        setData('images', newImages);

        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setData('images', newImages);
        setImagePreviews(newPreviews);
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

    return (
        <SupplierLayout title="Edit Product">
            <Head title={`Edit ${product.name}`} />

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
                        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                        <p className="mt-2 text-gray-600">
                            Update your product information and settings
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(product.moderation_status)}>
                            {getStatusText(product.moderation_status)}
                        </Badge>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/supplier/products/${product.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Essential details about your product
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter product name"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="sku">SKU *</Label>
                                <Input
                                    id="sku"
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    placeholder="Product SKU"
                                    className={errors.sku ? 'border-red-500' : ''}
                                />
                                {errors.sku && (
                                    <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="category_id">Category *</Label>
                                <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                    <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="brand_id">Brand</Label>
                                <Select value={data.brand_id} onValueChange={(value) => setData('brand_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id.toString()}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Describe your product in detail"
                                rows={4}
                                className={errors.description ? 'border-red-500' : ''}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                        <CardDescription>
                            Set your product pricing
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label htmlFor="price">Regular Price (ETB) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    placeholder="0.00"
                                    className={errors.price ? 'border-red-500' : ''}
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="sale_price">Sale Price (ETB)</Label>
                                <Input
                                    id="sale_price"
                                    type="number"
                                    step="0.01"
                                    value={data.sale_price}
                                    onChange={(e) => setData('sale_price', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="cost_price">Cost Price (ETB)</Label>
                                <Input
                                    id="cost_price"
                                    type="number"
                                    step="0.01"
                                    value={data.cost_price}
                                    onChange={(e) => setData('cost_price', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory</CardTitle>
                        <CardDescription>
                            Manage stock levels and tracking
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="manage_stock"
                                checked={data.manage_stock}
                                onCheckedChange={(checked) => setData('manage_stock', checked as boolean)}
                            />
                            <Label htmlFor="manage_stock">Track inventory for this product</Label>
                        </div>

                        {data.manage_stock && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                                    <Input
                                        id="stock_quantity"
                                        type="number"
                                        value={data.stock_quantity}
                                        onChange={(e) => setData('stock_quantity', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                                    <Input
                                        id="low_stock_threshold"
                                        type="number"
                                        value={data.low_stock_threshold}
                                        onChange={(e) => setData('low_stock_threshold', e.target.value)}
                                        placeholder="5"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Physical Attributes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Physical Attributes</CardTitle>
                        <CardDescription>
                            Dimensions and weight for shipping calculations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    step="0.01"
                                    value={data.weight}
                                    onChange={(e) => setData('weight', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="length">Length (cm)</Label>
                                <Input
                                    id="length"
                                    type="number"
                                    step="0.01"
                                    value={data.length}
                                    onChange={(e) => setData('length', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="width">Width (cm)</Label>
                                <Input
                                    id="width"
                                    type="number"
                                    step="0.01"
                                    value={data.width}
                                    onChange={(e) => setData('width', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="height">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    step="0.01"
                                    value={data.height}
                                    onChange={(e) => setData('height', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Images */}
                {product.images.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Images</CardTitle>
                            <CardDescription>
                                Existing product images
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {product.images.map((image) => (
                                    <div key={image.id} className="relative group">
                                        <img
                                            src={`/storage/${image.image_path}`}
                                            alt={`Product image ${image.id}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        {image.is_primary && (
                                            <Badge className="absolute top-2 left-2 bg-blue-500">
                                                Primary
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Add New Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Images</CardTitle>
                        <CardDescription>
                            Upload additional images for your product (up to 10 images)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div className="text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-4">
                                    <Label htmlFor="images" className="cursor-pointer">
                                        <span className="mt-2 block text-sm font-medium text-gray-900">
                                            Upload images
                                        </span>
                                        <span className="mt-1 block text-sm text-gray-500">
                                            PNG, JPG, GIF up to 10MB each
                                        </span>
                                    </Label>
                                    <Input
                                        id="images"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* SEO */}
                <Card>
                    <CardHeader>
                        <CardTitle>SEO Settings</CardTitle>
                        <CardDescription>
                            Optimize your product for search engines
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label htmlFor="meta_title">Meta Title</Label>
                            <Input
                                id="meta_title"
                                value={data.meta_title}
                                onChange={(e) => setData('meta_title', e.target.value)}
                                placeholder="SEO title for search engines"
                                maxLength={60}
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                {data.meta_title.length}/60 characters
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="meta_description">Meta Description</Label>
                            <Textarea
                                id="meta_description"
                                value={data.meta_description}
                                onChange={(e) => setData('meta_description', e.target.value)}
                                placeholder="SEO description for search engines"
                                rows={3}
                                maxLength={160}
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                {data.meta_description.length}/160 characters
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Settings</CardTitle>
                        <CardDescription>
                            Additional product configuration
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="featured"
                                    checked={data.featured}
                                    onCheckedChange={(checked) => setData('featured', checked as boolean)}
                                />
                                <Label htmlFor="featured">Featured Product</Label>
                            </div>

                            <div>
                                <Label htmlFor="visibility">Visibility</Label>
                                <Select value={data.visibility} onValueChange={(value: 'private' | 'public') => setData('visibility', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">Private (Draft)</SelectItem>
                                        <SelectItem value="public">Public (Submit for Review)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex items-center justify-between bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                            Changes are saved as drafts by default. You can submit for review when ready.
                        </span>
                    </div>
                    <div className="flex space-x-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/supplier/products/${product.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </form>
        </SupplierLayout>
    );
}
