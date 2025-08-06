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
     * Show the form for creating a new customer.
     */
    public function create()
    {
        return Inertia::render('admin/customers/create');
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

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'phone' => $request->phone,
            'status' => $request->status,
        ]);

        return redirect()->route('customers.index')
                         ->with('success', 'Customer created successfully.');
    }

    /**
     * Display the specified customer.
     */
    public function show(User $customer)
    {
        // Load relationships with proper data
        $customer->load([
            'addresses',
            'orders' => function($query) {
                $query->latest()->limit(10);
            },
            'reviews',
            'wishlists.product'
        ]);

        // Add computed fields
        $customer->orders_count = $customer->orders()->count();
        $customer->total_spent = $customer->orders()->sum('total_amount') ?? 0;

        return Inertia::render('admin/customers/show', [
            'customer' => $customer
        ]);
    }

    /**
     * Show the form for editing the specified customer.
     */
    public function edit(User $customer)
    {
        return Inertia::render('admin/customers/edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(Request $request, User $customer)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $customer->id,
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive,banned',
            'password' => 'nullable|string|min:8',
        ]);

        $customer->name = $request->name;
        $customer->email = $request->email;
        $customer->phone = $request->phone;
        $customer->status = $request->status;
        
        if ($request->password) {
            $customer->password = bcrypt($request->password);
        }
        
        $customer->save();

        return redirect()->route('customers.index')
                         ->with('success', 'Customer updated successfully.');
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy(User $customer)
    {
        // You might want to add checks here to prevent deleting customers with orders
        if ($customer->orders()->count() > 0) {
            return redirect()->route('customers.index')
                           ->with('error', 'Cannot delete customer with existing orders.');
        }

        $customer->delete();

        return redirect()->route('customers.index')
                         ->with('success', 'Customer deleted successfully.');
    }
}
