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
            $googleUser = $useStateless 
                ? $socialite->stateless()->user()
                : $socialite->user();

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

            Auth::login($user);

            $isPopup = $request->session()->pull('oauth_popup');
            $request->session()->forget('oauth_popup_initiated');
            $request->session()->forget('oauth_use_stateless');

            if ($isPopup) {
                return response()->view('auth.oauth-close', [
                    'redirectUrl' => $redirectUrl,
                    'next' => $shouldPromptForRole ? 'choose-role' : null,
                ]);
            }

            return redirect($redirectUrl);

        } catch (InvalidStateException $e) {
            // Handle state mismatch - common in popup windows or session issues
            Log::error('Google OAuth InvalidStateException', [
                'error' => $e->getMessage(),
                'url' => $request->fullUrl(),
                'session_id' => $request->session()->getId(),
                'has_session' => $request->hasSession(),
            ]);

            // If it's a popup, try stateless authentication as fallback
            $isPopup = $request->session()->get('oauth_popup', false);
            
            if ($isPopup && $request->has('code')) {
                try {
                    // Retry with stateless (no state validation) - less secure but works in popups
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

                    Auth::login($user);
                    $request->session()->forget('oauth_popup');
                    $request->session()->forget('oauth_popup_initiated');

                    return response()->view('auth.oauth-close', [
                        'redirectUrl' => $redirectUrl,
                        'next' => $shouldPromptForRole ? 'choose-role' : null,
                    ]);
                } catch (Exception $statelessException) {
                    Log::error('Google OAuth stateless fallback failed', [
                        'error' => $statelessException->getMessage(),
                    ]);
                }
            }

            // If all else fails, redirect with error message
            return redirect()->route('login')
                ->with('error', 'Authentication failed. Please try signing in again. If the problem persists, try using a regular browser window instead of a popup.');
                
        } catch (Exception $e) {
            Log::error('Google OAuth Exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'url' => $request->fullUrl(),
            ]);

            return redirect()->route('login')
                ->with('error', 'An error occurred during authentication. Please try again.');
        }
    }
}