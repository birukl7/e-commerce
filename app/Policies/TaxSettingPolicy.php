<?php

namespace App\Policies;

use App\Models\User;
use App\Models\TaxSetting;
use Illuminate\Auth\Access\HandlesAuthorization;

class TaxSettingPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any tax settings.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can view the tax setting.
     */
    public function view(User $user, TaxSetting $taxSetting): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can create tax settings.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can update the tax setting.
     */
    public function update(User $user, TaxSetting $taxSetting): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can delete the tax setting.
     */
    public function delete(User $user, TaxSetting $taxSetting): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can restore the tax setting.
     */
    public function restore(User $user, TaxSetting $taxSetting): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can permanently delete the tax setting.
     */
    public function forceDelete(User $user, TaxSetting $taxSetting): bool
    {
        return $user->hasRole('super_admin');
    }
}