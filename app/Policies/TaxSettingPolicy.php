<?php

namespace App\Policies;

use App\Models\User;
use App\Models\TaxSetting;
use App\Models\Product;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\DB;

class TaxSettingPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any tax settings.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('manage tax settings');
    }

    /**
     * Determine whether the user can view the tax setting.
     */
    public function view(User $user, TaxSetting $taxSetting): bool
    {
        return $user->can('manage tax settings');
    }

    /**
     * Determine whether the user can create tax settings.
     */
    public function create(User $user): bool
    {
        return $user->can('create tax settings');
    }

    /**
     * Determine whether the user can update the tax setting.
     */
    public function update(User $user, TaxSetting $taxSetting): bool
    {
        return $user->can('edit tax settings');
    }

    /**
     * Determine whether the user can delete the tax setting.
     */
    public function delete(User $user, TaxSetting $taxSetting): bool
    {
        // Prevent deletion if there are products using this tax setting
        if ($taxSetting->products()->exists()) {
            return false;
        }
        
        return $user->can('delete tax settings');
    }

    /**
     * Determine whether the user can restore the tax setting.
     */
    public function restore(User $user, TaxSetting $taxSetting): bool
    {
        return $user->can('restore tax settings');
    }

    /**
     * Determine whether the user can permanently delete the tax setting.
     */
    public function forceDelete(User $user, TaxSetting $taxSetting): bool
    {
        // Only allow force delete if there are no products using this tax setting
        if ($taxSetting->products()->withTrashed()->exists()) {
            return false;
        }
        
        return $user->can('force delete tax settings');
    }
    
    /**
     * Determine whether the user can reorder tax settings.
     */
    public function reorder(User $user): bool
    {
        return $user->can('reorder tax settings');
    }
    
    /**
     * Determine whether the user can toggle the status of a tax setting.
     */
    public function toggleStatus(User $user, TaxSetting $taxSetting): bool
    {
        return $user->can('edit tax settings');
    }
}