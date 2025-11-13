<?php

namespace App\Http\Middleware;

use App\Services\AdminMenuService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $sharedData = [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'shouldChooseRole' => fn () => (bool) $request->session()->pull('choose_role_pending', false),
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];

        // Add admin menu structure for authenticated admin users
        if ($request->user() && $this->isAdminRoute($request)) {
            $adminMenuService = app(AdminMenuService::class);
            
            // Get unseen payments count
            $unseenPaymentsCount = \Illuminate\Support\Facades\DB::table('payment_transactions')
                ->where('admin_status', 'unseen')
                ->count();
            
            // Get flat menu items and add badge to Sales Dashboard
            $flatItems = $adminMenuService->getFlatMenuItems();
            foreach ($flatItems as &$item) {
                // Check if this is the Sales Dashboard item by href or title
                $isSalesDashboard = (isset($item['href']) && (str_contains($item['href'], 'admin/sales') || str_contains($item['href'], '/admin/sales'))) ||
                                   (isset($item['title']) && $item['title'] === 'Sales Dashboard');
                if ($isSalesDashboard && $unseenPaymentsCount > 0) {
                    $item['badge'] = $unseenPaymentsCount;
                }
            }
            unset($item);
            
            $sharedData['adminMenu'] = [
                'structure' => $adminMenuService->getAdminMenuStructure(),
                'flatItems' => $flatItems,
            ];
            
            // Add unseen payments count for admin routes
            $sharedData['unseenPaymentsCount'] = $unseenPaymentsCount;
        }

        return $sharedData;
    }

    private function isAdminRoute(Request $request): bool
    {
        $adminPaths = [
            'admin',
            'admin-dashboard',
            'paymentStats',
            'site-config',
            'admin/tax',
            'stock-notifications'
        ];

        $path = $request->path();
        $isAdmin = collect($adminPaths)->contains(function($adminPath) use ($path) {
            return str_starts_with($path, $adminPath);
        });
        
        \Log::debug('HandleInertiaRequests::isAdminRoute', [
            'path' => $path,
            'is_admin' => $isAdmin,
        ]);
        return $isAdmin;
    }
}