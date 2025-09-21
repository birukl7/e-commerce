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
                ['title' => 'Dashboard', 'href' => '/admin', 'icon' => 'LayoutDashboard'],
            ],
            'Inventory' => [                
                [
                    'title' => 'Products', 
                    'href' => '/admin/products', 
                    'icon' => 'Package',
                    'tabs' => [
                        ['title' => 'All Products', 'href' => '/admin/products', 'icon' => 'Package']
                    ]
                ],
                ['title' => 'Categories and Brands', 'href' => '/admin/categories', 'icon' => 'Tags'],
                ['title' => 'Product Requests', 'href' => '/admin/product-requests', 'icon' => 'MessageSquare'],
            ],
            'Stock Management' => [
                [
                    'title' => 'Stock Overview', 
                    'href' => '/admin/stock', 
                    'icon' => 'PackageCheck',
                    'tabs' => [
                        ['title' => 'Stock Alerts', 'href' => '/admin/stock/alerts', 'icon' => 'AlertTriangle'],
                        ['title' => 'Out of Stock', 'href' => '/admin/stock/out-of-stock', 'icon' => 'PackageX'],
                        ['title' => 'Low Stock', 'href' => '/admin/stock/low-stock', 'icon' => 'PackageMinus'],
                        ['title' => 'Stock History', 'href' => '/admin/stock/history', 'icon' => 'History']
                    ]
                ]
            ],
            $salesGroup => $this->getSalesMenuItems(),
            'Users' => [
                ['title' => 'Suppliers and Customers', 'href' => '/admin/customers', 'icon' => 'Users'],
            ],
            'Settings' => [
                ['title' => 'Site Configuration', 'href' => '/admin/site-config', 'icon' => 'Settings'],
                [
                    'title' => 'Tax & Financial', 
                    'href' => '/admin/settings/tax', 
                    'icon' => 'Percent',
                    'tabs' => [
                        ['title' => 'Tax Rates', 'href' => '/admin/settings/tax/rates', 'icon' => 'Percent'],
                        ['title' => 'Tax Classes', 'href' => '/admin/settings/tax/classes', 'icon' => 'Layers'],
                        ['title' => 'Tax Rules', 'href' => '/admin/settings/tax/rules', 'icon' => 'FileText']
                    ]
                ]
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
            foreach ($groupItems as $item) {
                // Add the parent item
                $flatItem = $item;
                // Remove children for the flat list to avoid duplication
                unset($flatItem['children']);
                $flatItems[] = $flatItem;
                
                // Add children if they exist
                if (isset($item['children']) && is_array($item['children'])) {
                    foreach ($item['children'] as $child) {
                        $flatItems[] = $child;
                    }
                }
            }
        }
        
        return $flatItems;
    }
}