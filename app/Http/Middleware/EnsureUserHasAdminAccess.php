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
        
        $user = auth()->user();
        
        // Check if user account is still active
        if ($user->status !== 'active') {
            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route('login')->withErrors([
                'email' => 'Your account is no longer active. Please contact support.',
            ]);
        }
        
        // Validate admin permissions on every request to prevent privilege escalation
        if (!$user->can('access admin dashboard') && !$user->hasRole('admin') && !$user->hasRole('super_admin')) {
            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route('login')->withErrors([
                'email' => 'You do not have permission to access the admin dashboard.',
            ]);
        }
        
        return $next($request);
    }
}
