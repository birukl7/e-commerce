<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ValidateAdminSession
{
    /**
     * Handle an incoming request to validate admin session integrity.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only apply to authenticated users
        if (!Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();
        
        // Store the current user's role information in session for validation
        $sessionRoles = $request->session()->get('user_roles', []);
        $currentRoles = $user->getRoleNames()->toArray();
        
        // If this is the first request or roles have changed, update session
        if (empty($sessionRoles) || $sessionRoles !== $currentRoles) {
            $request->session()->put('user_roles', $currentRoles);
            $request->session()->put('user_permissions', $user->getAllPermissions()->pluck('name')->toArray());
        }
        
        // For admin routes, validate that session roles match current user roles
        if ($this->isAdminRoute($request)) {
            $storedRoles = $request->session()->get('user_roles', []);
            
            // If stored roles don't match current roles, there's a session integrity issue
            if ($storedRoles !== $currentRoles) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                
                return redirect()->route('login')->withErrors([
                    'email' => 'Session integrity validation failed. Please log in again.',
                ]);
            }
            
            // Validate admin access
            if (!$user->hasRole(['admin', 'super_admin']) && !$user->can('access admin dashboard')) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                
                return redirect()->route('login')->withErrors([
                    'email' => 'You do not have permission to access admin areas.',
                ]);
            }
        }
        
        return $next($request);
    }
    
    private function isAdminRoute(Request $request): bool
    {
        return str_starts_with($request->path(), 'admin') || 
               str_starts_with($request->path(), 'admin-dashboard');
    }
}
