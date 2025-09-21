<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckStock
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for non-POST requests
        if (!$request->isMethod('post')) {
            return $next($request);
        }

        // Get cart items from the request
        $cartItems = $request->input('items', []);
        
        if (empty($cartItems)) {
            return $next($request);
        }

        $outOfStockItems = [];
        $lowStockItems = [];

        foreach ($cartItems as $item) {
            $product = Product::find($item['product_id'] ?? null);
            
            if (!$product) {
                continue;
            }

            $requestedQuantity = $item['quantity'] ?? 0;
            
            // Skip products that don't manage stock
            if (!$product->manage_stock) {
                continue;
            }

            // Check if product is out of stock
            if ($product->stock_quantity <= 0) {
                $outOfStockItems[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'available' => 0,
                    'requested' => $requestedQuantity
                ];
                continue;
            }

            // Check if there's enough stock
            if ($product->stock_quantity < $requestedQuantity) {
                $outOfStockItems[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'available' => $product->stock_quantity,
                    'requested' => $requestedQuantity
                ];
            }
            // Check if stock is below threshold
            elseif ($product->stock_quantity <= $product->low_stock_threshold) {
                $lowStockItems[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'available' => $product->stock_quantity,
                    'threshold' => $product->low_stock_threshold
                ];
            }
        }

        // If there are out of stock items, return an error
        if (!empty($outOfStockItems)) {
            return response()->json([
                'success' => false,
                'message' => 'Some items in your cart are out of stock or the requested quantity is not available.',
                'errors' => [
                    'out_of_stock' => $outOfStockItems
                ]
            ], 422);
        }

        // Add low stock items to the request for informational purposes
        if (!empty($lowStockItems)) {
            $request->merge(['_low_stock_items' => $lowStockItems]);
        }

        return $next($request);
    }
}