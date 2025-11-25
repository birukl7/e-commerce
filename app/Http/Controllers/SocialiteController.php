<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SocialiteController extends Controller
{
    /**
     * Function: authProviderRedirect
     * Description: This function will redirect to Given Provider
     */
    public function authProviderRedirect(Request $request)
    {
        $isPopup = $request->boolean('popup');
        
        if ($isPopup) {
            $request->session()->put('oauth_popup', true);
            $request->session()->put('oauth_popup_initiated', now()->timestamp);
            // For popup windows, we'll use stateless to avoid session cookie issues
            $request->session()->put('oauth_use_stateless', true);
            
            // Set a cookie as a persistent fallback (survives OAuth redirect)
            // This cookie will be checked in the callback if session is lost
            // Use SameSite=None and Secure for cross-site OAuth flows
            $isSecure = $request->secure() || config('session.secure');
            cookie()->queue(cookie('oauth_popup_flag', '1', 10, '/', null, $isSecure, false, false, 'Lax'));
        }

        // Ensure session is saved before redirect
        $request->session()->save();

        $socialite = Socialite::driver('google')
            ->with(['prompt' => 'select_account']);

        // Use stateless for popup windows to avoid session state issues
        if ($isPopup) {
            return $socialite->stateless()->redirect();
        }

        return $socialite->redirect();
    }

    /**
     * Function: googleAuthentication
     * Decription: This function will authenticate the user through the Google Account
     */
    public function googleAuthentication(Request $request)
    {
        try {
            // Check if we should use stateless (for popup windows)
            $useStateless = $request->session()->get('oauth_use_stateless', false);
            
            // Get the user - use stateless if it was a popup
            $socialite = Socialite::driver('google');
            
            try {
                $googleUser = $useStateless 
                    ? $socialite->stateless()->user()
                    : $socialite->user();
            } catch (InvalidStateException $stateException) {
                // Session state lost - try stateless as fallback
                Log::warning('Google OAuth state mismatch, trying stateless fallback', [
                    'error' => $stateException->getMessage(),
                    'url' => $request->fullUrl(),
                    'has_code' => $request->has('code'),
                    'session_id' => $request->session()->getId(),
                ]);
                
                if ($request->has('code')) {
                    // Try stateless authentication as fallback
                    $googleUser = $socialite->stateless()->user();
                } else {
                    throw $stateException; // Re-throw if no code
                }
            }

            $redirectUrl = route('home');
            $shouldPromptForRole = false;

            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if (! $user) {
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'profile_image' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                    'password' => Hash::make(str()->random(16)),
                    'status' => 'active',
                ]);

                $baseRoles = [];
                if ($baseRole = Role::where('name', 'user')->first()) {
                    $baseRoles[] = $baseRole->name;
                }
                if ($defaultRole = Role::where('name', 'customer')->first()) {
                    $baseRoles[] = $defaultRole->name;
                }

                if (! empty($baseRoles)) {
                    $user->syncRoles($baseRoles);
                }

                $user->is_supplier = false;
                $user->save();

                $shouldPromptForRole = true;
                $request->session()->flash('choose_role_pending', true);
            }

            Auth::login($user, true); // Remember user

            // Check if this is a popup - check session first, then cookie, then stateless flag
            $isPopup = $request->session()->pull('oauth_popup', false);
            $wasStateless = $request->session()->pull('oauth_use_stateless', false);
            
            // If session was lost, check cookie as fallback
            if (!$isPopup && $request->cookie('oauth_popup_flag')) {
                $isPopup = true;
                Log::warning('OAuth popup detected via cookie fallback - session may have been lost');
            }
            
            // If we used stateless OAuth, it's very likely a popup (stateless is only used for popups)
            // This is a final fallback to ensure popups work even if session/cookie are lost
            if (!$isPopup && $wasStateless) {
                $isPopup = true;
                Log::info('OAuth popup detected via stateless flag - assuming popup mode');
            }
            
            // AGGRESSIVE FALLBACK: If we can't determine, check if this looks like a popup callback
            // Popup windows typically have no referrer or a different referrer pattern
            // Also, if the window name matches our popup name, it's likely a popup
            if (!$isPopup) {
                // Check if there's a popup parameter in the URL (Google might preserve it)
                $isPopup = $request->has('popup') && $request->boolean('popup');
                
                // If still not detected, we'll use client-side detection as final fallback
                // by always showing a page that checks window.opener
            }
            
            $request->session()->forget('oauth_popup_initiated');
            
            // Clear the popup cookie
            cookie()->queue(cookie()->forget('oauth_popup_flag'));

            Log::info('Google OAuth successful', [
                'user_id' => $user->id,
                'email' => $user->email,
                'is_popup' => $isPopup,
                'has_session' => $request->hasSession(),
                'session_id' => $request->session()->getId(),
                'was_stateless' => $wasStateless,
                'has_cookie' => $request->cookie('oauth_popup_flag') ? 'yes' : 'no',
                'url_popup_param' => $request->has('popup') ? $request->input('popup') : 'none',
            ]);

            // Always return the oauth-close view which will detect popup client-side
            // This ensures popups work even if all server-side detection fails
            // The view checks window.opener to determine if it's a popup
            return response()->view('auth.oauth-close', [
                'redirectUrl' => $redirectUrl,
                'next' => $shouldPromptForRole ? 'choose-role' : null,
                'forcePopup' => $isPopup, // Pass server-side detection result
            ]);

        } catch (InvalidStateException $e) {
            // Handle state mismatch - common in popup windows or session issues
            Log::error('Google OAuth InvalidStateException (final catch)', [
                'error' => $e->getMessage(),
                'url' => $request->fullUrl(),
                'session_id' => $request->session()->getId(),
                'has_session' => $request->hasSession(),
                'has_code' => $request->has('code'),
            ]);

            // Try stateless as final fallback if we have a code
            if ($request->has('code')) {
                try {
                    Log::info('Attempting stateless fallback for Google OAuth');
                    $googleUser = Socialite::driver('google')->stateless()->user();
                    
                    $redirectUrl = route('home');
                    $shouldPromptForRole = false;

                    $user = User::where('google_id', $googleUser->getId())
                        ->orWhere('email', $googleUser->getEmail())
                        ->first();

                    if (! $user) {
                        $user = User::create([
                            'name' => $googleUser->getName(),
                            'email' => $googleUser->getEmail(),
                            'google_id' => $googleUser->getId(),
                            'profile_image' => $googleUser->getAvatar(),
                            'email_verified_at' => now(),
                            'password' => Hash::make(str()->random(16)),
                            'status' => 'active',
                        ]);

                        $baseRoles = [];
                        if ($baseRole = Role::where('name', 'user')->first()) {
                            $baseRoles[] = $baseRole->name;
                        }
                        if ($defaultRole = Role::where('name', 'customer')->first()) {
                            $baseRoles[] = $defaultRole->name;
                        }

                        if (! empty($baseRoles)) {
                            $user->syncRoles($baseRoles);
                        }

                        $user->is_supplier = false;
                        $user->save();

                        $shouldPromptForRole = true;
                        $request->session()->flash('choose_role_pending', true);
                    }

                    Auth::login($user, true);
                    
                    // Check for popup flag in session, then cookie
                    $isPopup = $request->session()->pull('oauth_popup', false);
                    
                    // If session was lost, check cookie as fallback
                    if (!$isPopup && $request->cookie('oauth_popup_flag')) {
                        $isPopup = true;
                    }
                    
                    // Since we used stateless, assume it's a popup (stateless is only used for popups)
                    if (!$isPopup) {
                        $isPopup = true;
                        Log::info('OAuth popup detected via stateless fallback - assuming popup mode');
                    }
                    
                    $request->session()->forget('oauth_popup_initiated');
                    
                    // Clear the popup cookie
                    cookie()->queue(cookie()->forget('oauth_popup_flag'));
                    
                    Log::info('Google OAuth stateless fallback successful', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'is_popup' => $isPopup,
                    ]);

                    // Always return oauth-close view which will detect popup client-side
                    return response()->view('auth.oauth-close', [
                        'redirectUrl' => $redirectUrl,
                        'next' => $shouldPromptForRole ? 'choose-role' : null,
                        'forcePopup' => $isPopup,
                    ]);
                } catch (Exception $statelessException) {
                    Log::error('Google OAuth stateless fallback failed', [
                        'error' => $statelessException->getMessage(),
                        'trace' => $statelessException->getTraceAsString(),
                    ]);
                }
            }

            // If all else fails, redirect with error message
            return redirect()->route('login')
                ->with('error', 'Authentication failed due to session state mismatch. Please try signing in again.');
                
        } catch (Exception $e) {
            Log::error('Google OAuth Exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'url' => $request->fullUrl(),
                'exception_class' => get_class($e),
            ]);

            return redirect()->route('login')
                ->with('error', 'An error occurred during authentication: ' . $e->getMessage());
        }
    }
}