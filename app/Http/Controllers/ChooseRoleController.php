<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

class ChooseRoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        abort(404);
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
        ]);

        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        $roleName = $request->string('role')->toString();

        $baseRoles = [];
        if ($baseRole = Role::where('name', 'user')->first()) {
            $baseRoles[] = $baseRole->name;
        }

        $role = Role::where('name', $roleName)->first();
        if (! $role) {
            abort(422, "Role '{$roleName}' does not exist.");
        }

        $user->syncRoles(array_merge($baseRoles, [$role->name]));
        $user->is_supplier = $roleName === 'supplier';
        $user->save();

        $request->session()->forget('choose_role_pending');

        return redirect()->route('home')->with('status', 'Account type updated successfully.');
 

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
