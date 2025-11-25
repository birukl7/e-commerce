<?php

namespace App\Policies;

use App\Models\ProductRequest;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProductRequestPolicy
{
    /**
     * Determine whether the user can view any models.
     * Users can view their own product requests, admins can view all.
     */
    public function viewAny(User $user): bool
    {
        return true; // Filtering is handled in the controller
    }

    /**
     * Determine whether the user can view the model.
     * Users can view their own requests, admins can view any.
     */
    public function view(User $user, ProductRequest $productRequest): bool
    {
        return $user->id === $productRequest->user_id || 
               $user->hasRole('admin');
    }

    /**
     * Determine whether the user can create models.
     * Any authenticated user can create a product request.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     * Only the owner can update their request if it's still pending.
     * 
     * Note: Laravel may automatically check this policy for POST routes with route model binding.
     * For confirming willingness and other actions on approved requests, we allow POST requests
     * and let the controller handle specific authorization.
     */
    public function update(User $user, ProductRequest $productRequest): bool
    {
        \Log::info('ProductRequestPolicy::update called', [
            'user_id' => $user->id,
            'product_request_id' => $productRequest->id,
            'product_request_user_id' => $productRequest->user_id,
            'status' => $productRequest->status,
            'method' => request()->method(),
            'path' => request()->path(),
            'uri' => request()->getRequestUri(),
        ]);
        
        // Must own the request
        if ($user->id !== $productRequest->user_id) {
            \Log::warning('ProductRequestPolicy::update - User does not own request');
            return false;
        }
        
        // Allow if request is pending (normal update via PUT/PATCH)
        if ($productRequest->status === 'pending') {
            \Log::info('ProductRequestPolicy::update - Allowing pending request');
            return true;
        }
        
        // For approved requests, allow POST requests for workflow actions
        // (confirm willingness, lost interest, accept price, etc.)
        // The controller methods will handle specific authorization and validation
        // We allow all POST requests here to avoid route detection issues during policy resolution
        if ($productRequest->status === 'approved' && 
            !$productRequest->isTerminated() &&
            request()->isMethod('POST')) {
            \Log::info('ProductRequestPolicy::update - Allowing POST for approved request');
            return true;
        }
        
        \Log::warning('ProductRequestPolicy::update - Denied', [
            'status' => $productRequest->status,
            'is_terminated' => $productRequest->isTerminated(),
            'method' => request()->method(),
        ]);
        
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     * Only the owner can delete their request if it's still pending.
     */
    public function delete(User $user, ProductRequest $productRequest): bool
    {
        return $user->id === $productRequest->user_id && 
               $productRequest->status === 'pending';
    }

    /**
     * Determine whether the user can update the status of a product request.
     * Only admins can update the status.
     */
    public function updateStatus(User $user, ProductRequest $productRequest): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can view the admin index of product requests.
     * Only admins can view the admin index.
     */
    public function viewAdminIndex(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     * Only admins can restore soft-deleted requests.
     */
    public function restore(User $user, ProductRequest $productRequest): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Only admins can force delete requests.
     */
    public function forceDelete(User $user, ProductRequest $productRequest): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can confirm willingness to buy.
     * Only the owner can confirm willingness when the request is approved.
     */
    public function confirmWillingness(User $user, ProductRequest $productRequest): bool
    {
        return $user->id === $productRequest->user_id && 
               $productRequest->status === 'approved' &&
               !$productRequest->isTerminated();
    }
}
