<?php

namespace App\Services;

use Illuminate\Support\Facades\Gate;

class AdminMenuService
{
    private SiteConfigService $siteConfig;

    public function __construct(SiteConfigService $siteConfig)
    {
        $this->siteConfig = $siteConfig;
    }

    public function getAdminMenuStructure(): array
    {
        $salesGroup = $this->siteConfig->getSalesSidebarGroup();
        
        $menuGroups = [
            'Dashboard' => [
                ['title' => 'Dashboard', 'href' => '/admin-dashboard', 'icon' => 'LayoutDashboard'],
            ],
            'Inventory' => [
                ['title' => 'Products', 'href' => '/admin/products', 'icon' => 'Package'],
                ['title' => 'Categories and Brands', 'href' => '/admin/categories', 'icon' => 'Tags'],
                ['title' => 'Product Requests', 'href' => '/admin/product-requests', 'icon' => 'MessageSquare'],
            ],
            $salesGroup => $this->getSalesMenuItems(),
            'Users' => [
                ['title' => 'Suppliers and Customers', 'href' => '/admin/customers', 'icon' => 'Users'],
            ],
            'Settings' => [
                ['title' => 'Site Configuration', 'href' => '/admin/site-config', 'icon' => 'Settings'],
            ]
        ];

        // Filter menu items based on permissions
        return $this->filterMenuByPermissions($menuGroups);
    }

    private function getSalesMenuItems(): array
    {
        $items = [
            ['title' => 'Payments', 'href' => '/admin/paymentStats', 'icon' => 'CreditCard'],
            ['title' => 'Orders', 'href' => '/admin/orders', 'icon' => 'ShoppingCart'],
        ];

        // Add manual payments link if enabled
        if ($this->siteConfig->isManualPaymentEnabled()) {
            $items[] = ['title' => 'Manual Payments', 'href' => '/admin/offline-payments', 'icon' => 'FileImage'];
        }

        return $items;
    }

    private function filterMenuByPermissions(array $menuGroups): array
    {
        $filtered = [];
        
        foreach ($menuGroups as $groupName => $items) {
            $filteredItems = [];
            
            foreach ($items as $item) {
                // Check if user has permission to access this route
                if ($this->canAccessRoute($item['href'])) {
                    $filteredItems[] = $item;
                }
            }
            
            // Only include group if it has accessible items
            if (!empty($filteredItems)) {
                $filtered[$groupName] = $filteredItems;
            }
        }
        
        return $filtered;
    }

    private function canAccessRoute(string $href): bool
    {
        // Map routes to their corresponding Gates/policies
        $routePermissions = [
            '/admin/products' => 'admin.products.view',
            '/admin/paymentStats' => 'admin.payments.view',
            '/admin/orders' => 'admin.orders.view',
            '/admin/customers' => 'admin.customers.view',
            '/admin/categories' => 'admin.categories.view',
            '/admin/product-requests' => 'admin.requests.view',
            '/admin/site-config' => 'admin.config.view',
            '/admin/offline-payments' => 'admin.payments.view',
        ];

        $permission = $routePermissions[$href] ?? null;
        
        // If no specific permission defined, allow access
        // In production, you might want to be more restrictive
        if (!$permission) {
            return true;
        }

        return Gate::allows($permission);
    }

    public function getFlatMenuItems(): array
    {
        $structure = $this->getAdminMenuStructure();
        $flatItems = [];
        
        foreach ($structure as $groupItems) {
            $flatItems = array_merge($flatItems, $groupItems);
        }
        
        return $flatItems;
    }
}