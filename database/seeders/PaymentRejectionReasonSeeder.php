<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PaymentRejectionReason;

class PaymentRejectionReasonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reasons = [
            [
                'reason_code' => 'insufficient_funds',
                'reason_text' => 'Insufficient Funds',
                'description' => 'Payment amount does not match the required amount or insufficient balance',
                'applies_to' => ['both'],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'reason_code' => 'invalid_payment_method',
                'reason_text' => 'Invalid Payment Method',
                'description' => 'The payment method used is not valid or not supported',
                'applies_to' => ['both'],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'reason_code' => 'payment_proof_unclear',
                'reason_text' => 'Payment Proof Unclear',
                'description' => 'The uploaded payment proof is unclear, incomplete, or cannot be verified',
                'applies_to' => ['both'],
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'reason_code' => 'payment_mismatch',
                'reason_text' => 'Payment Amount Mismatch',
                'description' => 'The payment amount does not match the order amount',
                'applies_to' => ['both'],
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'reason_code' => 'suspicious_activity',
                'reason_text' => 'Suspicious Activity',
                'description' => 'Payment flagged due to suspicious activity or security concerns',
                'applies_to' => ['both'],
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'reason_code' => 'expired_payment',
                'reason_text' => 'Payment Expired',
                'description' => 'Payment was not completed within the allowed time frame',
                'applies_to' => ['both'],
                'is_active' => true,
                'sort_order' => 6,
            ],
            [
                'reason_code' => 'duplicate_payment',
                'reason_text' => 'Duplicate Payment',
                'description' => 'This payment appears to be a duplicate of another transaction',
                'applies_to' => ['both'],
                'is_active' => true,
                'sort_order' => 7,
            ],
            [
                'reason_code' => 'product_unavailable',
                'reason_text' => 'Product No Longer Available',
                'description' => 'The requested product is no longer available for purchase',
                'applies_to' => ['product_request'],
                'is_active' => true,
                'sort_order' => 8,
            ],
            [
                'reason_code' => 'order_cancelled',
                'reason_text' => 'Order Cancelled',
                'description' => 'The associated order has been cancelled',
                'applies_to' => ['normal_purchase'],
                'is_active' => true,
                'sort_order' => 9,
            ],
            [
                'reason_code' => 'other',
                'reason_text' => 'Other Reason',
                'description' => 'Other reason not listed above',
                'applies_to' => ['both'],
                'is_active' => true,
                'sort_order' => 99,
            ],
        ];

        foreach ($reasons as $reason) {
            PaymentRejectionReason::updateOrCreate(
                ['reason_code' => $reason['reason_code']],
                $reason
            );
        }
    }
}
