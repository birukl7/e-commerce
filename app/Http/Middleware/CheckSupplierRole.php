<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;

class CheckSupplierRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If no user is authenticated, redirect to login
        if (!$user) {
            return redirect()->route('login');
        }

        // Check if user is a supplier
        if ($user->hasRole('supplier')) {
            return $next($request);
        }

        // If user is admin, redirect to admin dashboard
        if ($user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        }

        // Default redirect for authenticated users without supplier role
        return redirect()->route('home');
    }
}
