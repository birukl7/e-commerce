<?php

namespace App\Policies;

use App\Models\TaxClass;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaxClassPolicy
{
    /**
     * Quickly determine if the user has elevated admin access for tax features.
     */
    private function hasTaxAdminAccess(User $user): bool
    {
        return $user->hasRole(['admin', 'super_admin']) || $user->can('manage tax settings');
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        $allowed = $this->hasTaxAdminAccess($user);
        \Log::error('Policy:TaxClass:viewAny', [
            'user_id' => $user->id,
            'email' => $user->email,
            'roles' => $user->getRoleNames()->toArray(),
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            'allowed' => $allowed,
        ]);
        return $allowed;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TaxClass $taxClass): bool
    {
        return $this->hasTaxAdminAccess($user);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $this->hasTaxAdminAccess($user);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TaxClass $taxClass): bool
    {
        // Prevent updating the default tax class if user doesn't have permission
        if ($taxClass->is_default && !$user->can('set default tax class')) {
            return false;
        }
        
        return $this->hasTaxAdminAccess($user);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TaxClass $taxClass): bool
    {
        // Prevent deleting the default tax class
        if ($taxClass->is_default) {
            return false;
        }
        
        // Prevent deleting if there are associated tax rates
        if ($taxClass->taxRates()->exists()) {
            return false;
        }
        
        return $this->hasTaxAdminAccess($user);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, TaxClass $taxClass): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, TaxClass $taxClass): bool
    {
        return false;
    }
}
