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
     * Note: This policy is also checked automatically for POST routes with route model binding.
     * For confirming willingness on approved requests, use the confirmWillingness policy method instead.
     */
    public function update(User $user, ProductRequest $productRequest): bool
    {
        // Allow if user owns the request and it's pending (normal update)
        if ($user->id === $productRequest->user_id && $productRequest->status === 'pending') {
            return true;
        }
        
        // Allow confirming willingness for approved requests (bypass automatic policy check)
        // This prevents 403 errors when confirming willingness via POST route
        if ($user->id === $productRequest->user_id && 
            $productRequest->status === 'approved' &&
            !$productRequest->isTerminated() &&
            request()->routeIs('request.confirm-willingness')) {
            return true;
        }
        
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
