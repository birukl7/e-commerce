<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
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
        if ($request->boolean('popup')) {
            $request->session()->put('oauth_popup', true);
        }

        return Socialite::driver('google')->redirect();
    }

    /**
     * Function: googleAuthentication
     * Decription: This function will authenticate the user through the Google Account
     */
    public function googleAuthentication(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();

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

            if ($isPopup) {
                return response()->view('auth.oauth-close', [
                    'redirectUrl' => $redirectUrl,
                    'next' => $shouldPromptForRole ? 'choose-role' : null,
                ]);
            }

            return redirect($redirectUrl);

        } catch (Exception $e) {
            dd($e);
        }
    }
}