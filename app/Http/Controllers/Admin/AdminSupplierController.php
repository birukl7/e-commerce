<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupplierProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminSupplierController extends Controller
{
    public function __construct()
    {
        $this->middleware('role:admin');
    }

    public function index(Request $request)
    {
        $suppliers = SupplierProfile::with(['user', 'createdByAdmin'])
            ->when($request->input('search'), function ($query, $search) {
                $query->where('business_name', 'like', "%{$search}%")
                    ->orWhere('business_email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            })
            ->when($request->input('status'), function ($query, $status) {
                $query->where('verification_status', $status);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($supplier) => [
                'id' => $supplier->id,
                'business_name' => $supplier->business_name,
                'business_email' => $supplier->business_email,
                'phone' => $supplier->phone,
                'verification_status' => $supplier->verification_status,
                'created_at' => $supplier->created_at->format('M d, Y'),
                'user' => $supplier->user ? [
                    'id' => $supplier->user->id,
                    'name' => $supplier->user->name,
                    'email' => $supplier->user->email,
                ] : null,
            ]);

        return Inertia::render('admin/suppliers/index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search', 'status']),
            'statuses' => [
                'pending' => 'Pending',
                'approved' => 'Approved',
                'rejected' => 'Rejected',
                'banned' => 'Banned',
            ],
        ]);
    }

    public function show(SupplierProfile $supplier)
    {
        $supplier->load(['user', 'createdByAdmin', 'products']);
        
        return Inertia::render('admin/suppliers/show', [
            'supplier' => [
                'id' => $supplier->id,
                'business_name' => $supplier->business_name,
                'business_email' => $supplier->business_email,
                'phone' => $supplier->phone,
                'tax_id' => $supplier->tax_id,
                'verification_status' => $supplier->verification_status,
                'default_commission_rate' => $supplier->default_commission_rate,
                'address' => $supplier->address,
                'payout_method' => $supplier->payout_method,
                'created_at' => $supplier->created_at->format('M d, Y'),
                'user' => $supplier->user ? [
                    'id' => $supplier->user->id,
                    'name' => $supplier->user->name,
                    'email' => $supplier->user->email,
                    'created_at' => $supplier->user->created_at->format('M d, Y'),
                ] : null,
                'products_count' => $supplier->products()->count(),
                'active_products' => $supplier->products()->where('status', 'active')->count(),
            ],
        ]);
    }

    public function updateStatus(SupplierProfile $supplier, Request $request)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected,banned'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        return DB::transaction(function () use ($supplier, $validated) {
            $supplier->update([
                'verification_status' => $validated['status'],
                'verification_notes' => $validated['notes'] ?? null,
            ]);

            // If approved, ensure user has supplier role
            if ($validated['status'] === 'approved' && $supplier->user) {
                $supplier->user->syncRoles(['supplier']);
                $supplier->user->update(['is_supplier' => true]);
                
                // Send approval notification
                $supplier->user->notify(new \App\Notifications\SupplierApproved($supplier));
            }
            
            // If banned, revoke supplier role
            if ($validated['status'] === 'banned' && $supplier->user) {
                $supplier->user->removeRole('supplier');
                $supplier->user->update(['is_supplier' => false]);
                
                // Send ban notification
                $supplier->user->notify(new \App\Notifications\SupplierBanned($supplier, $validated['notes'] ?? null));
            }

            return back()->with('success', 'Supplier status updated successfully.');
        });
    }

    public function updatePayoutMethod(SupplierProfile $supplier, Request $request)
    {
        $validated = $request->validate([
            'payout_method' => ['required', 'array'],
            'payout_method.type' => ['required', 'string', 'in:bank_transfer,paypal,other'],
            'payout_method.details' => ['required', 'array'],
            'payout_method.is_verified' => ['boolean'],
        ]);

        $supplier->update([
            'payout_method' => array_merge(
                $supplier->payout_method ?? [],
                $validated['payout_method'],
                ['verified_at' => $validated['payout_method']['is_verified'] ? now() : null]
            )
        ]);

        return back()->with('success', 'Payout method updated successfully.');
    }

    public function updateCommission(SupplierProfile $supplier, Request $request)
    {
        $validated = $request->validate([
            'commission_rate' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $supplier->update([
            'default_commission_rate' => $validated['commission_rate'],
        ]);

        return back()->with('success', 'Commission rate updated successfully.');
    }

    public function destroy(SupplierProfile $supplier)
    {
        // Don't delete if supplier has products
        if ($supplier->products()->exists()) {
            return back()->with('error', 'Cannot delete supplier with existing products.');
        }

        DB::transaction(function () use ($supplier) {
            // Remove supplier role from user
            if ($supplier->user) {
                $supplier->user->removeRole('supplier');
                $supplier->user->update(['is_supplier' => false]);
            }
            
            // Delete the supplier profile
            $supplier->delete();
        });

        return redirect()->route('admin.suppliers.index')
            ->with('success', 'Supplier deleted successfully.');
    }
}
