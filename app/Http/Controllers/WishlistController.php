<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class WishlistController extends Controller
{
    /**
     * Display user's wishlist page.
     */
    public function index()
    {
        $user = Auth::user();
        
        $wishlistItems = $user->wishlistProducts()
            ->with(['images', 'category', 'brand'])
            ->get()
            ->map(function ($product) {
                $primaryImage = $product->images->where('is_primary', true)->first()
                             ?? $product->images->first();
                
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'current_price' => (float) ($product->sale_price ?? $product->price),
                    'description' => $product->description,
                    'image' => $primaryImage ? asset('image' . $primaryImage->image_path) : asset('image/placeholder.jpg'),
                    'images' => $product->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => asset('image' . $image->image_path),
                            'alt_text' => $image->alt_text,
                            'is_primary' => $image->is_primary,
                        ];
                    }),
                    'category' => $product->category ? $product->category->name : null,
                    'brand' => $product->brand ? $product->brand->name : null,
                    'stock_status' => $product->stock_status,
                    'featured' => $product->featured,
                    'added_at' => $product->pivot->created_at,
                ];
            });

        return Inertia::render('wishlist/wishlist-dashboard', [
            'wishlistItems' => $wishlistItems,
            'count' => $wishlistItems->count()
        ]);
    }

    /**
     * Toggle product in wishlist (AJAX).
     */
    public function toggle(Request $request): JsonResponse
    {
        $user = Auth::user();
                
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        try {
            $validated = $request->validate([
                'product_id' => 'required|integer|exists:products,id'
            ]);

            $productId = $validated['product_id'];
            $wishlistItem = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if ($wishlistItem) {
                // Remove from wishlist
                $wishlistItem->delete();
                $message = 'Product removed from wishlist successfully';
                $inWishlist = false;
            } else {
                // Add to wishlist
                Wishlist::create([
                    'user_id' => $user->id,
                    'product_id' => $productId
                ]);
                $message = 'Product added to wishlist successfully';
                $inWishlist = true;
            }

            $product = Product::find($productId);
            return response()->json([
                'success' => true,
                'message' => $message,
                'in_wishlist' => $inWishlist,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating wishlist'
            ], 500);
        }
    }

    /**
     * Remove product from wishlist (for wishlist page).
     */
    public function destroy(Request $request): JsonResponse
    {
        $user = Auth::user();
                
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        try {
            $validated = $request->validate([
                'product_id' => 'required|integer|exists:products,id'
            ]);

            $productId = $validated['product_id'];
            $wishlistItem = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if (!$wishlistItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found in wishlist'
                ], 404);
            }

            $wishlistItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product removed from wishlist successfully'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while removing from wishlist'
            ], 500);
        }
    }


    /**
     * Check if a product is in user's wishlist (AJAX).
     */
    public function check(Request $request): JsonResponse
    {
        $user = Auth::user();
                
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
                'in_wishlist' => false
            ], 401);
        }

        try {
            $validated = $request->validate([
                'product_id' => 'required|integer|exists:products,id'
            ]);

            $productId = $validated['product_id'];
            $inWishlist = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->exists();

            return response()->json([
                'success' => true,
                'in_wishlist' => $inWishlist,
                'product_id' => $productId
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'in_wishlist' => false
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while checking wishlist',
                'in_wishlist' => false
            ], 500);
        }
    }

    /**
     * Add product to wishlist (AJAX).
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
                
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        try {
            $validated = $request->validate([
                'product_id' => 'required|integer|exists:products,id'
            ]);

            $productId = $validated['product_id'];
            
            // Check if already in wishlist
            $existingWishlistItem = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if ($existingWishlistItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product is already in wishlist',
                    'in_wishlist' => true
                ], 409);
            }

            // Add to wishlist
            Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $productId
            ]);

            $product = Product::find($productId);
            return response()->json([
                'success' => true,
                'message' => 'Product added to wishlist successfully',
                'in_wishlist' => true,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while adding to wishlist'
            ], 500);
        }
    }
}
