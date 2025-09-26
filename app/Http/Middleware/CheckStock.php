<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Services\StockService;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckStock
{
    protected $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for non-POST requests or if not a checkout request
        if (!$request->isMethod('post') || !$this->isCheckoutRequest($request)) {
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
                $outOfStockItems[] = [
                    'id' => $item['product_id'] ?? null,
                    'name' => $item['name'] ?? 'Unknown Product',
                    'reason' => 'Product not found'
                ];
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
            // Log the issue for debugging
            Log::warning('Out of stock items in cart', [
                'out_of_stock' => $outOfStockItems,
                'ip' => $request->ip(),
                'user_id' => $request->user() ? $request->user()->id : null,
            ]);

            // Return a JSON response with the stock issues
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some items in your cart are out of stock',
                    'errors' => [
                        'out_of_stock' => $outOfStockItems,
                    ],
                ], 422);
            }

            // For non-AJAX requests, redirect back with errors
            return redirect()->back()
                ->withInput()
                ->withErrors([
                    'stock' => 'Some items in your cart are out of stock',
                    'out_of_stock' => $outOfStockItems,
                ]);
        }
        
        // For low stock items, just log a warning but don't block checkout
        if (!empty($lowStockItems)) {
            Log::warning('Low stock items in cart', [
                'low_stock' => $lowStockItems,
                'ip' => $request->ip(),
                'user_id' => $request->user() ? $request->user()->id : null,
            ]);
            
            // Add a flash message to inform the user about low stock items
            $request->session()->flash('warning', 'Some items in your cart are low in stock.');
            
            // Add low stock items to the request for informational purposes
            $request->merge(['_low_stock_items' => $lowStockItems]);
        }

        return $next($request);
    }
}