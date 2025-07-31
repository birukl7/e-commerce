<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasAdminAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()){
            return redirect()->route('login');
        } 
        // check if use has admin dashboard access permission
        if (!auth()->user()->can('access admin dashboard')){
            abort(403, 'Access denied, admin privileges required');
        }
        return $next($request);
    }
}
