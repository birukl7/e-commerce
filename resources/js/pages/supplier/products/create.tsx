import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { 
    Package, 
    Upload, 
    X, 
    Plus, 
    Save, 
    Eye,
    AlertCircle
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

interface Category {
    id: number;
    name: string;
}

interface Brand {
    id: number;
    name: string;
}

interface Props {
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

export default function SupplierProductCreate({ categories, brands }: Props) {
    const { errors } = usePage().props as any;
    
    const { data, setData, post, processing, reset } = useForm<FormData>({
        name: '',
        description: '',
        sku: '',
        price: '',
        sale_price: '',
        cost_price: '',
        stock_quantity: '0',
        low_stock_threshold: '5',
        weight: '',
        length: '',
        width: '',
        height: '',
        category_id: '',
        brand_id: '',
        manage_stock: true,
        featured: false,
        visibility: 'private',
        meta_title: '',
        meta_description: '',
        images: [],
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/supplier/products', {
            onSuccess: () => {
                reset();
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

    const formatCurrency = (value: string) => {
        const num = parseFloat(value);
        return isNaN(num) ? '' : new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
        }).format(num);
    };

    return (
        <SupplierLayout title="Add Product">
            <Head title="Add New Product" />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                <p className="mt-2 text-gray-600">
                    Create a new product for your store. All products require admin approval before going live.
                </p>
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

                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Images</CardTitle>
                        <CardDescription>
                            Upload images of your product (up to 10 images)
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
                            Products are saved as drafts by default. You can submit them for review when ready.
                        </span>
                    </div>
                    <div className="flex space-x-4">
                        <Button type="button" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Product'}
                        </Button>
                    </div>
                </div>
            </form>
        </SupplierLayout>
    );
}
