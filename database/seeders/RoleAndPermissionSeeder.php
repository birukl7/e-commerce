<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User Management
            'view users',
            'create users',
            'edit users',
            'delete users',
            'ban users',
            
            // Product Management
            'view products',
            'create products',
            'edit products',
            'delete products',
            'manage product stock',
            'feature products',
            
            // Category Management
            'view categories',
            'create categories',
            'edit categories',
            'delete categories',
            
            // Brand Management
            'view brands',
            'create brands',
            'edit brands',
            'delete brands',
            
            // Order Management
            'view orders',
            'edit orders',
            'cancel orders',
            'process orders',
            'view order reports',
            
            // Product Request Management
            'view product requests',
            'respond to product requests',
            'approve product requests',
            'reject product requests',
            
            // Review Management
            'view reviews',
            'moderate reviews',
            'delete reviews',
            
            // Coupon Management
            'view coupons',
            'create coupons',
            'edit coupons',
            'delete coupons',
            
            // Settings Management
            'view settings',
            'edit settings',
            'manage payment gateways',
            
            // Analytics & Reports
            'view dashboard',
            'view analytics',
            'export reports',
            
            // Notification Management
            'send notifications',
            'manage notifications',
            
            // User Profile Actions (for regular users)
            'view own profile',
            'edit own profile',
            'view own orders',
            'request products',
            'write reviews',
            'bookmark products',
            'manage own addresses',
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create roles and assign permissions

        // Super Admin Role - Full access
        $superAdmin = Role::create(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdmin->givePermissionTo(Permission::all());

        // Product Manager Role
        $productManager = Role::create(['name' => 'product_manager', 'guard_name' => 'web']);
        $productManager->givePermissionTo([
            'view products',
            'create products',
            'edit products',
            'delete products',
            'manage product stock',
            'feature products',
            'view categories',
            'create categories',
            'edit categories',
            'delete categories',
            'view brands',
            'create brands',
            'edit brands',
            'delete brands',
            'view product requests',
            'respond to product requests',
            'approve product requests',
            'reject product requests',
            'view dashboard',
            'view analytics',
        ]);

        // Order Manager Role
        $orderManager = Role::create(['name' => 'order_manager', 'guard_name' => 'web']);
        $orderManager->givePermissionTo([
            'view orders',
            'edit orders',
            'cancel orders',
            'process orders',
            'view order reports',
            'view dashboard',
            'view analytics',
            'export reports',
        ]);

        // Customer Support Role
        $customerSupport = Role::create(['name' => 'customer_support', 'guard_name' => 'web']);
        $customerSupport->givePermissionTo([
            'view users',
            'view orders',
            'view product requests',
            'respond to product requests',
            'view reviews',
            'moderate reviews',
            'send notifications',
            'manage notifications',
            'view dashboard',
        ]);

        // Regular User Role
        $user = Role::create(['name' => 'user', 'guard_name' => 'web']);
        $user->givePermissionTo([
            'view own profile',
            'edit own profile',
            'view own orders',
            'request products',
            'write reviews',
            'bookmark products',
            'manage own addresses',
        ]);

        $this->command->info('Roles and permissions seeded successfully!');
    }
}


