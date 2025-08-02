<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class SocialiteController extends Controller
{
    /**
     * Function: authProviderRedirect
     * Description: This function will redirect to Given Provider
     */
    public function authProviderRedirect() {
        
        return Socialite::driver('google')->redirect();
    
    }

    /**
     * Function: googleAuthentication
     * Decription: This function will authenticate the user through the Google Account
     */
    public function googleAuthentication() {
        try {
                $googleUser = Socialite::driver('google')->user();

                $user = User::where('google_id', $googleUser->id)->first();

                if ($user) {
                    Auth::login($user);
                    return redirect()->route('home');
                } 

                // New user – store their Google info temporarily in session
                session([
                    'google_user' => [
                        'name' => $googleUser->getName(),
                        'email' => $googleUser->getEmail(),
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                    ]
                ]);

                return redirect('/choose-role');

                $userData = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'password' => Hash::make('Password@1234'),
                    'profile_image'=> $googleUser->avatar,
                    'google_id' => $googleUser->id,
                ]);

                if ($userData) {
                    Auth::login($userData);
                }
                

                return redirect()->route('home');


        } catch (Exception $e) {
            dd($e);
        }
    }
}