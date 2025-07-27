<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
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
            $perPage = $request->get('per_page', 10);
            $sortBy = $request->get('sort_by', 'newest'); // newest, oldest, highest_rating, lowest_rating, most_helpful
            $filterRating = $request->get('rating'); // Filter by specific rating

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
                    $query->orderBy('rating', 'desc');
                    break;
                case 'lowest_rating':
                    $query->orderBy('rating', 'asc');
                    break;
                case 'most_helpful':
                    $query->orderByRaw('JSON_LENGTH(COALESCE(helpful_votes, "[]")) DESC');
                    break;
                default: // newest
                    $query->latest();
                    break;
            }

            $reviews = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'reviews' => $reviews->items(),
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
}
