<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a new review.
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'You must be logged in to submit a review'
            ], 401);
        }

        try {
            $validated = $request->validate([
                'product_id' => 'required|integer|exists:products,id',
                'rating' => 'required|integer|min:1|max:5',
                'title' => 'nullable|string|max:255',
                'comment' => 'required|string|max:1000',
            ]);

            $product = Product::findOrFail($validated['product_id']);

            // Check if user has already reviewed this product
            if ($product->hasReviewFrom($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already reviewed this product'
                ], 409);
            }

            // Create the review
            $review = Review::create([
                'user_id' => $user->id,
                'product_id' => $validated['product_id'],
                'rating' => $validated['rating'],
                'title' => $validated['title'],
                'comment' => $validated['comment'],
                'is_verified_purchase' => false, // You can implement purchase verification logic
                'is_approved' => true, // Auto-approve for now, you can add moderation later
            ]);

            // Load the review with user relationship
            $review->load('user');

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully',
                'review' => [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'title' => $review->title,
                    'comment' => $review->comment,
                    'user_name' => $review->user->name,
                    'created_at' => $review->created_at,
                    'helpful_count' => $review->helpful_count,
                    'is_verified_purchase' => $review->is_verified_purchase,
                ]
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting your review'
            ], 500);
        }
    }

    /**
     * Toggle helpful vote for a review.
     */
    public function toggleHelpful(Request $request, Review $review): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'You must be logged in to vote'
            ], 401);
        }

        try {
            $helpfulVotes = $review->helpful_votes ?? [];
            
            if (in_array($user->id, $helpfulVotes)) {
                // Remove the vote
                $helpfulVotes = array_values(array_filter($helpfulVotes, fn($id) => $id !== $user->id));
                $isHelpful = false;
            } else {
                // Add the vote
                $helpfulVotes[] = $user->id;
                $isHelpful = true;
            }

            $review->update(['helpful_votes' => $helpfulVotes]);

            return response()->json([
                'success' => true,
                'is_helpful' => $isHelpful,
                'helpful_count' => count($helpfulVotes)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating your vote'
            ], 500);
        }
    }

    /**
     * Get reviews for a product.
     */
    public function getProductReviews(Request $request, Product $product): JsonResponse
    {
        try {
            $user = Auth::user();
            $perPage = $request->get('per_page', 10);
            $sortBy = $request->get('sort_by', 'newest');
            $filterRating = $request->get('rating');

            $query = $product->reviews()->approved()->with('user');

            // Apply rating filter
            if ($filterRating) {
                $query->where('rating', $filterRating);
            }

            // Apply sorting
            switch ($sortBy) {
                case 'oldest':
                    $query->oldest();
                    break;
                case 'highest_rating':
                    $query->orderBy('rating', 'desc')->latest();
                    break;
                case 'lowest_rating':
                    $query->orderBy('rating', 'asc')->latest();
                    break;
                case 'most_helpful':
                    $query->orderByRaw('JSON_LENGTH(COALESCE(helpful_votes, "[]")) DESC')->latest();
                    break;
                default: // newest
                    $query->latest();
                    break;
            }

            $reviews = $query->paginate($perPage);

            // Format reviews data to match your frontend expectations
            $formattedReviews = $reviews->getCollection()->map(function ($review) use ($user) {
                $helpfulVotes = $review->helpful_votes ?? [];
                $isHelpfulToUser = $user ? in_array($user->id, $helpfulVotes) : false;

                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'title' => $review->title,
                    'comment' => $review->comment,
                    'user_name' => $review->user->name ?? 'Anonymous',
                    'user_avatar' => $review->user->avatar ?? null,
                    'created_at' => $review->created_at->toISOString(),
                    'helpful_count' => count($helpfulVotes),
                    'is_verified_purchase' => $review->is_verified_purchase ?? false,
                    'is_helpful_to_user' => $isHelpfulToUser,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedReviews,
                'pagination' => [
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                    'per_page' => $reviews->perPage(),
                    'total' => $reviews->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching reviews'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
     public function show($slug)
    {
        // Find product by slug with all necessary relationships
        $product = Product::where('slug', $slug)
            ->with([
                'images' => function ($query) {
                    $query->orderBy('sort_order');
                },
                'category',
                'brand',
                'reviews' => function ($query) {
                    $query->latest()->take(10);
                }
            ])
            ->firstOrFail();

        // Get related products from the same category
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'published')
            ->with(['images' => function ($query) {
                $query->where('is_primary', true)->orWhere('sort_order', 1);
            }])
            ->take(4)
            ->get();

        return Inertia::render('products/show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'sku' => $product->sku,
                'price' => (float) $product->price,
                'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                'current_price' => (float) ($product->sale_price ?? $product->price),
                'cost_price' => $product->cost_price ? (float) $product->cost_price : null,
                'stock_quantity' => $product->stock_quantity,
                'stock_status' => $product->stock_status,
                'featured' => $product->featured,
                'status' => $product->status,
                'meta_title' => $product->meta_title,
                'meta_description' => $product->meta_description,
                'images' => $product->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => asset('image' . $image->image_path),
                        'alt_text' => $image->alt_text,
                        'is_primary' => $image->is_primary,
                        'sort_order' => $image->sort_order,
                    ];
                }),
                'primary_image' => $product->images->where('is_primary', true)->first() 
                    ? asset('image' . $product->images->where('is_primary', true)->first()->image_path)
                    : ($product->images->first() 
                        ? asset('image' . $product->images->first()->image_path)
                        : asset('image/placeholder.jpg')),
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ],
                'brand' => [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                    'slug' => $product->brand->slug ?? null,
                ],
                'reviews' => $product->reviews->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'user_name' => $review->user->name ?? 'Anonymous',
                        'created_at' => $review->created_at->format('M d, Y'),
                    ];
                }),
                'average_rating' => round($product->reviews->avg('rating') ?? 0, 1),
                'reviews_count' => $product->reviews->count(),
            ],
            'related_products' => $relatedProducts->map(function ($product) {
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
                    'image' => $primaryImage 
                        ? asset('/storage/' . $primaryImage->image_path)
                            : asset('/storage/placeholder.jpg'),
                    'images' => $product->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => asset('/storage/' . $image->image_path),
                            'alt_text' => $image->alt_text,
                            'is_primary' => $image->is_primary,
                        ];
                    }),
                    'featured' => $product->featured,
                    'stock_status' => $product->stock_status,
                ];
            }),
        ]);
    } 

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        //
    }

    public function showcase(Request $request): JsonResponse
    {
        try {
            $count = $request->get('count', 6);
            $count = min(max($count, 1), 24); // Limit between 1 and 24
            
            $excludeCategories = $request->get('exclude_categories');
            $excludeCategoryIds = $excludeCategories ? explode(',', $excludeCategories) : [];
            
            $status = $request->get('status', 'published');
            $stockStatus = $request->get('stock_status', 'in_stock');

            $query = Product::with(['images', 'category'])
                ->where('status', $status)
                ->where('stock_status', $stockStatus);

            // Exclude specific categories if provided
            if (!empty($excludeCategoryIds)) {
                $query->whereNotIn('category_id', $excludeCategoryIds);
            }

            // Get random products
            $products = $query->inRandomOrder()
                ->limit($count)
                ->get();

            // Format the products data
            $products->each(function ($product) {
                // Add primary image URL
                $primaryImage = $product->images()->where('is_primary', true)->first();
                $product->image = $primaryImage ? asset('/storage/' . $primaryImage->image_path) : null;
                
                // Format prices
                $product->formatted_price = 'USD ' . number_format($product->price, 2);
                if ($product->sale_price) {
                    $product->formatted_sale_price = 'USD ' . number_format($product->sale_price, 2);
                }
                
                // Remove unnecessary relations from response
                unset($product->images);
            });

            return response()->json([
                'success' => true,
                'data' => $products,
                'message' => 'Showcase products retrieved successfully',
                'count' => $products->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve showcase products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function featured(Request $request): JsonResponse
    {
        try {
            $count = $request->get('count', 8);
            
            $products = Product::with(['images', 'category'])
                ->where('status', 'published')
                ->where('featured', true)
                ->where('stock_status', 'in_stock')
                ->inRandomOrder()
                ->limit($count)
                ->get();

            $products->each(function ($product) {
                $primaryImage = $product->images()->where('is_primary', true)->first();
                $product->image = $primaryImage ? asset('/storage/' . $primaryImage->image_path) : null;
                unset($product->images);
            });

            return response()->json([
                'success' => true,
                'data' => $products,
                'message' => 'Featured products retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve featured products',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
