<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|min:2',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => [
                'required',
                'confirmed',
                'min:6',
                //'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            ],
            //'phone' => 'nullable|string|max:20|regex:/^[\+]?[1-9][\d]{0,15}$/',
            'phone' => [
                'nullable',
                'string',
                'regex:/^(?:(?:09|07)\d{8}|(?:2519|2517)\d{8}|\+(?:2519|2517)\d{8})$/'
            ],
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'role' => 'required|string',
        ], [
            //'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'password.regex' => 'Password must be 6 at least digits',
            //'phone.regex' => 'Please enter a valid phone number.',
            'phone.regex' => 'Phone must be: 10 digits starting with 09 or 07, 12 digits starting with 2519 or 2517 or 13 digits starting with +2519 or +2517'
        ]);

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'status' => 'active',
            ]);

            // Assign role based on registration choice
            $roleName = $request->role;
            
            // Map frontend role names to backend role names if needed
            $roleMapping = [
                'customer' => 'customer',
                'supplier' => 'supplier'
            ];
            
            $actualRoleName = $roleMapping[$roleName] ?? $roleName;
            
            $role = Role::where('name', $actualRoleName)->first();
            if ($role) {
                $user->assignRole($role);
                Log::info("User registered with role: {$actualRoleName}", ['user_id' => $user->id]);
            } else {
                // If specific role doesn't exist, assign default 'user' role
                $defaultRole = Role::where('name', 'user')->first();
                if ($defaultRole) {
                    $user->assignRole($defaultRole);
                    Log::warning("Role '{$actualRoleName}' not found, assigned 'user' role instead", ['user_id' => $user->id]);
                } else {
                    throw new \Exception("Neither role '{$actualRoleName}' nor default 'user' role exists.");
                }
            }

            // Create default address if provided
            if ($request->filled(['address_line_1', 'city', 'state', 'country'])) {
                $user->addresses()->create([
                    'type' => 'home',
                    'address_line_1' => $request->address_line_1,
                    'address_line_2' => $request->address_line_2,
                    'city' => $request->city,
                    'state' => $request->state,
                    'postal_code' => $request->postal_code,
                    'country' => $request->country ?? 'Ethiopia',
                    'phone' => $request->phone,
                    'is_default' => true,
                ]);
            }

            DB::commit();

            event(new Registered($user));
            Auth::login($user);

            return redirect()->intended(route('home'))->with('status', 'Registration successful! Welcome to ShopHub.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('User registration failed: ' . $e->getMessage());
            
            return back()->withErrors([
                'email' => 'Registration failed. Please try again.'
            ])->withInput($request->except('password', 'password_confirmation'));
        }
    }

    
}