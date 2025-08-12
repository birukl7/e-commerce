<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User; 
use Inertia\Inertia; 

class CustomerController extends Controller
{
    /**
     * Display a listing of the customers.
     */
    public function index(Request $request)
    {
        $query = User::query()
            ->role(['customer', 'user']) // Only get users with customer or user roles
            ->withCount(['orders', 'wishlists'])
            ->with(['orders' => function($query) {
                $query->latest()->limit(5);
            }]);

        // Add search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        // Add status filter
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $customers = $query->latest()->paginate(10);

        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'status'])
        ]);
    }


    /**
     * Store a newly created customer in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive,banned',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'phone' => $request->phone,
            'status' => $request->status,
        ]);
        
        // Assign customer role to new user
        $user->assignRole('customer');

        return redirect()->route('customers.index')
                         ->with('success', 'Customer created successfully.');
    }

}
