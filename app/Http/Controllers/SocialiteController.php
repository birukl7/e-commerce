<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;

class SocialiteController extends Controller
{
    /**
     * Function: authProviderRedirect
     * Description: This function will redirect to Given Provider
     */
    public function authProviderRedirect(Request $request) {
        if ($request->boolean('popup')) {
            $request->session()->put('oauth_popup', true);
        }

        return Socialite::driver('google')->redirect();
    }

    /**
     * Function: googleAuthentication
     * Decription: This function will authenticate the user through the Google Account
     */
    public function googleAuthentication(Request $request) {
        try {
                $googleUser = Socialite::driver('google')->user();

                $redirectUrl = route('home');

                $user = User::where('google_id', $googleUser->id)->first();

                if ($user) {
                    Auth::login($user);
                } else {
                    // New user – store their Google info temporarily in session
                    session([
                        'google_user' => [
                            'name' => $googleUser->getName(),
                            'email' => $googleUser->getEmail(),
                            'google_id' => $googleUser->getId(),
                            'avatar' => $googleUser->getAvatar(),
                        ]
                    ]);

                    $redirectUrl = route('choose-role.index');

                    if ($request->session()->pull('oauth_popup')) {
                        return response()->view('auth.oauth-close', [
                            'redirectUrl' => $redirectUrl,
                        ]);
                    }

                    return redirect($redirectUrl);
                }

                if ($request->session()->pull('oauth_popup')) {
                    return response()->view('auth.oauth-close', [
                        'redirectUrl' => $redirectUrl,
                    ]);
                }

                return redirect($redirectUrl);


        } catch (Exception $e) {
            dd($e);
        }
    }
}