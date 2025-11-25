<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\EnsureUserHasAdminAccess;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;



return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            \App\Http\Middleware\ValidateAdminSession::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Register middleware with their aliases
        $middleware->alias([
            'admin' => EnsureUserHasAdminAccess::class,
            'supplier' => \App\Http\Middleware\CheckSupplierRole::class,
            'validate.admin.session' => \App\Http\Middleware\ValidateAdminSession::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Log all 403 authorization exceptions
        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            \Log::error('=== AUTHORIZATION EXCEPTION (403) ===', [
                'message' => $e->getMessage(),
                'path' => $request->path(),
                'method' => $request->method(),
                'route_name' => $request->route()?->getName(),
                'user_id' => auth()->id(),
                'user_email' => auth()->user()?->email,
                'ip' => $request->ip(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            
            return null; // Let Laravel handle the default 403 response
        });
        
        // Also log HTTP exceptions (which includes 403)
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($e->getStatusCode() === 403) {
                \Log::error('=== HTTP 403 EXCEPTION ===', [
                    'message' => $e->getMessage(),
                    'path' => $request->path(),
                    'method' => $request->method(),
                    'route_name' => $request->route()?->getName(),
                    'user_id' => auth()->id(),
                    'user_email' => auth()->user()?->email,
                    'ip' => $request->ip(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]);
            }
            
            return null;
        });
    })->create();
