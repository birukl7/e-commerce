<?php

namespace App\Http\Controllers;

use App\Models\OfflinePaymentMethod;
use App\Models\OfflinePaymentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OfflinePaymentController extends Controller
{
    /**
     * Submit an offline payment.
     */
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'offline_payment_method_id' => 'required|exists:offline_payment_methods,id',
            'order_id' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|in:ETB,USD',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'nullable|string',
            'payment_reference' => 'nullable|string|max:255',
            'payment_notes' => 'nullable|string',
            'payment_screenshot' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        // Generate unique submission reference
        $submissionRef = 'OFFLINE-' . Str::random(8) . '-' . time();

        // Store the payment screenshot
        $screenshotPath = $request->file('payment_screenshot')->store('offline-payments', 'public');

        // Create the submission
        $submission = OfflinePaymentSubmission::create([
            'submission_ref' => $submissionRef,
            'offline_payment_method_id' => $validated['offline_payment_method_id'],
            'order_id' => $validated['order_id'],
            'amount' => $validated['amount'],
            'currency' => $validated['currency'],
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'],
            'payment_reference' => $validated['payment_reference'],
            'payment_notes' => $validated['payment_notes'],
            'payment_screenshot' => 'storage/' . $screenshotPath,
            'status' => 'pending',
        ]);

        return Inertia::render('payment/offline-submission-success', [
            'submission_ref' => $submissionRef,
            'order_id' => $validated['order_id'],
            'amount' => $validated['amount'],
            'currency' => $validated['currency'],
            'payment_method' => $submission->paymentMethod->name,
        ]);
    }

    /**
     * Get active offline payment methods.
     */
    public function getPaymentMethods()
    {
        return OfflinePaymentMethod::active()->ordered()->get();
    }

    /**
     * Admin: Get all offline payment submissions.
     */
    public function adminIndex(Request $request)
    {
        $query = OfflinePaymentSubmission::with(['paymentMethod', 'verifiedBy'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method')) {
            $query->where('offline_payment_method_id', $request->payment_method);
        }

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('submission_ref', 'like', "%{$searchTerm}%")
                  ->orWhere('order_id', 'like', "%{$searchTerm}%")
                  ->orWhere('customer_name', 'like', "%{$searchTerm}%")
                  ->orWhere('customer_email', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $submissions = $query->paginate(15)->withQueryString();

        // Get stats
        $stats = [
            'total_submissions' => OfflinePaymentSubmission::count(),
            'pending_submissions' => OfflinePaymentSubmission::pending()->count(),
            'verified_submissions' => OfflinePaymentSubmission::verified()->count(),
            'rejected_submissions' => OfflinePaymentSubmission::rejected()->count(),
            'total_amount_pending' => OfflinePaymentSubmission::pending()->sum('amount'),
            'total_amount_verified' => OfflinePaymentSubmission::verified()->sum('amount'),
        ];

        $paymentMethods = OfflinePaymentMethod::all();

        return Inertia::render('admin/payment/offline-submissions', [
            'submissions' => $submissions,
            'stats' => $stats,
            'paymentMethods' => $paymentMethods,
            'filters' => $request->only(['search', 'status', 'payment_method', 'date_from', 'date_to'])
        ]);
    }

    /**
     * Admin: Show single offline payment submission.
     */
    public function adminShow(OfflinePaymentSubmission $submission)
    {
        $submission->load(['paymentMethod', 'verifiedBy']);

        return Inertia::render('admin/payment/offline-submission-show', [
            'submission' => $submission
        ]);
    }

    /**
     * Admin: Update submission status.
     */
    public function adminUpdateStatus(Request $request, OfflinePaymentSubmission $submission)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,verified,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        $updateData = [
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'],
        ];

        if ($validated['status'] === 'verified') {
            $updateData['verified_at'] = now();
            $updateData['verified_by'] = auth()->id();
        } else {
            $updateData['verified_at'] = null;
            $updateData['verified_by'] = null;
        }

        DB::transaction(function() use ($submission) {
            $submission->update([
                'status' => $updateData["status"],
                'verified_by' => auth()->id(),
                'verified_at' => now(),
            ]);

            // Update payment_transactions (find by order_id & offline)
            DB::table('payment_transactions')
            ->where('order_id', $submission->order_id)
            ->where('payment_method','offline')
            ->update([
                'status' => 'completed',
                'chapa_data' => null,
                'updated_at' => now(),
            ]);

            // Update the order model: mark paid / change order status
            $order = Order::where('order_number', $submission->order_id)->first();
            if ($order) {
                $order->update(['payment_status' => 'paid','status' => 'processing']);
                // Add order note / history record if you have one
            }
        });

        return redirect()->back()->with('success', 'Submission status updated successfully!');
    }
}
