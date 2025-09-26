<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Get product details including stock information
     */
    public function show(Product $product)
    {
        return response()->json([
            'data' => [
                'id' => $product->id,
                'name' => $product->name,
                'current_price' => $product->price,
                'primary_image' => $product->primary_image,
                'stock_quantity' => $product->stock_quantity,
                'stock_status' => $product->stock_status,
                'manage_stock' => $product->manage_stock,
                'low_stock_threshold' => $product->low_stock_threshold,
            ]
        ]);
    }
}
