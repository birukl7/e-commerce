<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Http\Requests\SupplierRegistrationRequest;
use App\Models\SupplierProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class SupplierController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function showRegistrationForm()
    {
        if (auth()->user()->isSupplier()) {
            return redirect()->route('supplier.dashboard')
                ->with('info', 'You are already registered as a supplier.');
        }

        return view('supplier.register');
    }

    public function register(SupplierRegistrationRequest $request)
    {
        $user = $request->user();

        if ($user->isSupplier()) {
            return redirect()->route('supplier.dashboard')
                ->with('info', 'You are already registered as a supplier.');
        }

        return DB::transaction(function () use ($user, $request) {
            // Create supplier profile
            $supplierProfile = new SupplierProfile([
                'business_name' => $request->business_name,
                'business_email' => $request->business_email,
                'phone' => $request->phone,
                'tax_id' => $request->tax_id,
                'address' => $this->formatAddress($request->address),
                'verification_status' => 'pending',
                'default_commission_rate' => config('marketplace.default_commission_rate', 15.00),
                'payout_method' => $this->formatPayoutMethod($request->payout_method),
                'created_by_admin_id' => null, // Set to null for self-registration
            ]);

            $user->supplierProfile()->save($supplierProfile);
            
            // Assign supplier role
            $user->assignRole('supplier');
            
            // Mark user as supplier
            $user->is_supplier = true;
            $user->save();

            // Notify admin about new supplier registration
            $this->notifyAdminAboutNewSupplier($supplierProfile);

            // Send welcome email to supplier
            $this->sendWelcomeEmail($user, $supplierProfile);

            return redirect()->route('supplier.dashboard')
                ->with('success', 'Your supplier account has been created and is pending approval. You will receive an email once your account is approved.');
        });
    }

    /**
     * Format address data for storage
     */
    protected function formatAddress(array $address): array
    {
        return [
            'street' => $address['street'] ?? null,
            'city' => $address['city'] ?? null,
            'state' => $address['state'] ?? null,
            'postal_code' => $address['postal_code'] ?? null,
            'country' => $address['country'] ?? null,
            'formatted' => $this->formatFullAddress($address),
        ];
    }

    /**
     * Format a full address string
     */
    protected function formatFullAddress(array $address): string
    {
        $parts = [
            $address['street'] ?? '',
            $address['city'] ?? '',
            $address['state'] ?? '',
            $address['postal_code'] ?? '',
            $address['country'] ?? '',
        ];

        return implode(', ', array_filter($parts));
    }

    /**
     * Format payout method data for storage
     */
    protected function formatPayoutMethod(?array $payoutMethod): ?array
    {
        if (empty($payoutMethod)) {
            return null;
        }

        return [
            'type' => $payoutMethod['type'] ?? null,
            'details' => $payoutMethod['details'] ?? [],
            'is_verified' => false,
            'verification_requested_at' => null,
        ];
    }

    /**
     * Notify admin about new supplier registration
     */
    protected function notifyAdminAboutNewSupplier(SupplierProfile $supplierProfile): void
    {
        // Get all admin users
        $admins = User::role('admin')->get();
        
        // Send notification to each admin
        foreach ($admins as $admin) {
            $admin->notify(new \App\Notifications\SupplierRegistered($supplierProfile));
        }
    }

    /**
     * Send welcome email to new supplier
     */
    protected function sendWelcomeEmail(User $user, SupplierProfile $supplierProfile): void
    {
        $user->notify(new \App\Notifications\SupplierWelcome($supplierProfile));
    }

    public function dashboard()
    {
        $user = auth()->user();
        $supplierProfile = $user->supplierProfile;

        if (!$user->isSupplier()) {
            return redirect()->route('supplier.register');
        }

        // Get supplier statistics
        $stats = [
            'total_products' => $user->supplierProducts()->count(),
            'approved_products' => $user->supplierProducts()->where('moderation_status', 'approved')->count(),
            'pending_products' => $user->supplierProducts()->where('moderation_status', 'pending_review')->count(),
            'rejected_products' => $user->supplierProducts()->where('moderation_status', 'rejected')->count(),
            'total_orders' => 0, // TODO: Implement order counting
            'total_earnings' => 0, // TODO: Implement earnings calculation
            'monthly_earnings' => 0, // TODO: Implement monthly earnings
            'pending_orders' => 0, // TODO: Implement pending orders
        ];

        // Get recent products
        $recentProducts = $user->supplierProducts()
            ->with(['category', 'brand'])
            ->latest()
            ->limit(5)
            ->get();

        // Get products by status
        $productsByStatus = [
            'draft' => $user->supplierProducts()->where('moderation_status', 'draft')->count(),
            'pending_review' => $user->supplierProducts()->where('moderation_status', 'pending_review')->count(),
            'approved' => $user->supplierProducts()->where('moderation_status', 'approved')->count(),
            'rejected' => $user->supplierProducts()->where('moderation_status', 'rejected')->count(),
            'suspended' => $user->supplierProducts()->where('moderation_status', 'suspended')->count(),
        ];

        // TODO: Get recent orders when order management is implemented
        $recentOrders = [];

        return Inertia::render('Supplier/Dashboard', [
            'data' => [
                'supplier' => $supplierProfile,
                'stats' => $stats,
                'recent_products' => $recentProducts,
                'recent_orders' => $recentOrders,
                'products_by_status' => $productsByStatus,
            ],
        ]);
    }
}
