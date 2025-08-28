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
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];

        // Add admin menu structure for authenticated admin users
        if ($request->user() && $this->isAdminRoute($request)) {
            $adminMenuService = app(AdminMenuService::class);
            $sharedData['adminMenu'] = [
                'structure' => $adminMenuService->getAdminMenuStructure(),
                'flatItems' => $adminMenuService->getFlatMenuItems(),
            ];
        }

        return $sharedData;
    }

    private function isAdminRoute(Request $request): bool
    {
        return str_starts_with($request->path(), 'admin') || 
               str_starts_with($request->path(), 'admin-dashboard');
    }
}