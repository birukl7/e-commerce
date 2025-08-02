<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class ChooseRoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('auth/choose-role');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'role' => 'required|in:customer,supplier',
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
        ]);
    
        $googleUser = session('google_user');

        $user = User::create([
            'name' => $googleUser['name'],
            'email' => $googleUser['email'],
            'google_id' => $googleUser['google_id'],
            'profile_image' => $googleUser['avatar'],
            'role' => $request->role, // Assuming your users table has a 'role' column
            'email_verified_at' => Carbon::now(),
            'password' => bcrypt(str()->random(16)), // Just in case, since social login skips password
        ]);

         // Assign default user role
         $userRole = Role::where('name', 'user')->first();
         if ($userRole) {
             $user->assignRole($userRole);
         }

         $roleName = $request->role;

         $role = Role::where('name', $roleName)->first();
         if ($role) {
             $user->assignRole($role);
         } else {
             throw new \Exception("Role '{$roleName}' does not exist.");
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

        event(new Registered($user));
        Auth::login($user);

        return redirect()->intended(route('home'))->with('status', 'Registration successful! Welcome to ShopHub.');
 

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
