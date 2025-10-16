<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class SupplierRoleAndPermissionSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Supplier Permissions
        $supplierPermissions = [
            'supplier.register',
            'supplier.profile.view',
            'supplier.profile.update',
            'supplier.products.create',
            'supplier.products.view',
            'supplier.products.update',
            'supplier.products.delete',
            'supplier.orders.view',
            'supplier.orders.update_status',
            'supplier.earnings.view',
        ];

        foreach ($supplierPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Admin Permissions for Supplier Management
        $adminSupplierPermissions = [
            'admin.suppliers.view',
            'admin.suppliers.approve',
            'admin.suppliers.reject',
            'admin.suppliers.ban',
            'admin.products.moderate',
            'admin.products.force_publish',
            'admin.products.unpublish',
            'admin.payouts.view',
            'admin.payouts.approve',
            'admin.payouts.reject',
            'admin.payouts.export',
        ];

        foreach ($adminSupplierPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create or Update Supplier Role
        $supplierRole = Role::firstOrCreate(['name' => 'supplier', 'guard_name' => 'web']);
        $supplierRole->syncPermissions($supplierPermissions);

        // Assign Supplier Permissions to Admin Role
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo($adminSupplierPermissions);
        }
    }
}
