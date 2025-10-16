<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SupplierProductPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('supplier') || $user->hasRole('admin');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Product $product): bool
    {
        // Admin can view any product
        if ($user->hasRole('admin')) {
            return true;
        }

        // Supplier can only view their own products
        return $user->isSupplier() && $product->supplier_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only approved suppliers can create products
        return $user->isSupplierApproved();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Product $product): bool
    {
        // Admin can update any product
        if ($user->hasRole('admin')) {
            return true;
        }

        // Supplier can only update their own draft or rejected products
        return $user->isSupplierApproved() && 
               $product->supplier_id === $user->id &&
               in_array($product->moderation_status, ['draft', 'rejected']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Product $product): bool
    {
        // Admin can delete any product
        if ($user->hasRole('admin')) {
            return true;
        }

        // Supplier can only delete their own draft or rejected products
        return $user->isSupplierApproved() && 
               $product->supplier_id === $user->id &&
               in_array($product->moderation_status, ['draft', 'rejected']);
    }

    /**
     * Determine whether the user can submit the product for review.
     */
    public function submitForReview(User $user, Product $product): bool
    {
        // Admin doesn't need to submit for review
        if ($user->hasRole('admin')) {
            return false;
        }

        // Supplier can only submit their own draft or rejected products
        return $user->isSupplierApproved() && 
               $product->supplier_id === $user->id &&
               in_array($product->moderation_status, ['draft', 'rejected']);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Product $product): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Product $product): bool
    {
        return $user->hasRole('admin');
    }
}
