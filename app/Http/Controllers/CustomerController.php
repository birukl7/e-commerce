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
        // Get the type parameter to determine if we're showing customers or suppliers
        $type = $request->get('type', 'customers'); // Default to customers
        
        $query = User::query()
            ->withCount(['orders', 'wishlists'])
            ->with(['orders' => function($query) {
                $query->latest()->limit(5);
            }]);

        // Filter by role based on type
        if ($type === 'suppliers') {
            $query->role('supplier');
        } else {
            // For customers, include both 'customer' role and 'user' role (legacy users)
            $query->role(['customer', 'user']);
        }

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

        $users = $query->latest()->paginate(10);

        return Inertia::render('admin/customers/index', [
            'customers' => $users,
            'filters' => $request->only(['search', 'status', 'type']),
            'type' => $type
        ]);
    }

    /**
     * Display a listing of suppliers (alias for index with type=suppliers).
     */
    public function suppliers(Request $request)
    {
        $request->merge(['type' => 'suppliers']);
        return $this->index($request);
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
