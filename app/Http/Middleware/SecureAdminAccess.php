<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SecureAdminAccess
{
    /**
     * Handle an incoming request with enhanced security for admin access.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        
        // Log admin access attempts for security monitoring
        if ($this->isAdminRoute($request)) {
            Log::info('Admin route access attempt', [
                'user_id' => $user->id,
                'email' => $user->email,
                'route' => $request->path(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'session_id' => $request->session()->getId(),
                'roles' => $user->getRoleNames()->toArray(),
            ]);
        }
        
        // Enhanced security checks for admin routes
        if ($this->isAdminRoute($request)) {
            // Check account status
            if ($user->status !== 'active') {
                $this->logSecurityEvent('Inactive user attempted admin access', $user, $request);
                $this->forceLogout($request);
                return redirect()->route('login')->withErrors([
                    'email' => 'Your account is not active. Please contact support.',
                ]);
            }
            
            // Verify admin privileges
            $hasAdminRole = $user->hasRole(['admin', 'super_admin']);
            $hasAdminPermission = $user->can('access admin dashboard');
            
            if (!$hasAdminRole && !$hasAdminPermission) {
                $this->logSecurityEvent('Unauthorized admin access attempt', $user, $request);
                $this->forceLogout($request);
                return redirect()->route('login')->withErrors([
                    'email' => 'Unauthorized access attempt detected. Please log in again.',
                ]);
            }
            
            // Session integrity check
            $sessionRoles = $request->session()->get('verified_admin_roles');
            $currentRoles = $user->getRoleNames()->toArray();
            
            if ($sessionRoles && $sessionRoles !== $currentRoles) {
                $this->logSecurityEvent('Session role mismatch detected', $user, $request);
                $this->forceLogout($request);
                return redirect()->route('login')->withErrors([
                    'email' => 'Session integrity check failed. Please log in again.',
                ]);
            }
            
            // Store verified roles in session
            if (!$sessionRoles) {
                $request->session()->put('verified_admin_roles', $currentRoles);
                $request->session()->put('admin_access_verified_at', now()->timestamp);
            }
        }
        
        return $next($request);
    }
    
    private function isAdminRoute(Request $request): bool
    {
        return str_starts_with($request->path(), 'admin') || 
               str_starts_with($request->path(), 'admin-dashboard');
    }
    
    private function forceLogout(Request $request): void
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        $request->session()->forget(['verified_admin_roles', 'admin_access_verified_at']);
    }
    
    private function logSecurityEvent(string $event, $user, Request $request): void
    {
        Log::warning($event, [
            'user_id' => $user->id,
            'email' => $user->email,
            'route' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => $request->session()->getId(),
            'timestamp' => now()->toISOString(),
        ]);
    }
}
