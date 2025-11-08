<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // First authenticate the user
        $request->authenticate();
        
        // Get the authenticated user
        /** @var User $user */
        $user = Auth::user();
        
        // Check if user account is active
        if ($user->status !== 'active') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $message = match($user->status) {
                'inactive' => 'Your account is inactive. Please contact support.',
                'banned' => 'Your account has been suspended. Please contact support.',
                default => 'Unable to login. Please contact support.'
            };

            return back()->withErrors([
                'email' => $message,
            ]);
        }

        // Check email verification if required
        if ($user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail && !$user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        // For admin users, redirect to admin dashboard
        if ($user->hasRole('admin') || $user->hasRole('super_admin')) {
            // Set admin session data
            $request->session()->put([
                'is_admin' => true,
                'admin_access_verified_at' => now()->timestamp,
                'verified_admin_roles' => $user->getRoleNames()->toArray(),
                'last_activity' => now()->timestamp,
                'user_id' => $user->id
            ]);
            
            // Regenerate session to prevent session fixation
            $request->session()->regenerate();
            
            // Explicitly log in the user with the new session
            Auth::login($user);
            
            // Get intended URL or default to admin dashboard
            $intended = $request->session()->pull('url.intended', route('admin.dashboard'));
            
            // Ensure we're redirecting to an admin route
            if (!str_contains($intended, '/admin') && !str_contains($intended, 'admin-dashboard')) {
                $intended = route('admin.dashboard');
            }
            
            // Force redirect to admin dashboard
            return redirect()->to($intended);
        }

        if ($user && $request->session()->pull('oauth_requires_role', false)) {
            return redirect()->route('home');
        }

        if ($user && $user->roles()->whereIn('name', ['customer', 'supplier'])->exists()) {
            return redirect()->route('home');
        }

        return redirect()->route('home');
    }


    public function adminStore(LoginRequest $request) 
    {
        // First authenticate the user
        $request->authenticate();
        
        // Get the authenticated user
        /** @var User $user */
        $user = Auth::user();
        
        // Debug logging
        Log::info('Admin login attempt', [
            'user_id' => $user->id,
            'email' => $user->email,
            'is_admin' => $user->hasRole('admin') || $user->hasRole('super_admin'),
            'intended' => $request->session()->get('url.intended')
        ]);
        
        // Check if user account is active
        if ($user->status !== 'active') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $message = match($user->status) {
                'inactive' => 'Your account is inactive. Please contact support.',
                'banned' => 'Your account has been suspended. Please contact support.',
                default => 'Unable to login. Please contact support.'
            };

            return back()->withErrors([
                'email' => $message,
            ]);
        }

        // Ensure the authenticated user has admin access
        if (!($user->hasRole('admin') || $user->hasRole('super_admin'))) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route('login')->withErrors([
                'email' => 'You do not have permission to access the admin dashboard.',
            ]);
        }

        // Check email verification if required
        if ($user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail && !$user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        // Set admin-specific session data
        $request->session()->put([
            'is_admin' => true,
            'admin_access_verified_at' => now()->timestamp,
            'verified_admin_roles' => $user->getRoleNames()->toArray(),
            'last_activity' => now()->timestamp,
            'user_id' => $user->id,
            'is_admin_session' => true
        ]);
        
        // Regenerate session ID to prevent session fixation
        $request->session()->regenerate();
        
        // Explicitly log in the user with the new session
        Auth::login($user);
        
        // Get the intended URL or default to admin dashboard
        $intended = $request->session()->pull('url.intended', route('admin.dashboard'));
        
        // Ensure we're redirecting to an admin route
        $adminDashboard = route('admin.dashboard');
        if (!str_contains($intended, '/admin') && !str_contains($intended, 'admin-dashboard')) {
            $intended = $adminDashboard;
        }
        
        // Handle Inertia.js requests
        if ($request->header('X-Inertia')) {
            return Inertia::location($adminDashboard);
        }
        
        // Standard web request
        return redirect()->to($adminDashboard);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        // Clear any cached role/permission data
        $request->session()->forget(['user_roles', 'user_permissions']);

        return redirect('/');
    }
}