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
                ['title' => 'Site Configuration', 'href' => '/site-config', 'icon' => 'Settings'],
            ]
        ];

        // Filter menu items based on permissions
        return $this->filterMenuByPermissions($menuGroups);
    }

    private function getSalesMenuItems(): array
    {
        return [
            ['title' => 'Sales Dashboard', 'href' => route('admin.sales.index'), 'icon' => 'BarChart3']
        ];
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
        // TODO: Re-enable per-route permission checks when Gate abilities are configured.
        // Temporarily allow all admin menu items so the sidebar is visible.
        return true;
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