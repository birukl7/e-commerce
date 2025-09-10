<?php

namespace App\View\Components;

use Illuminate\View\Component;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\NotificationService;

class TestEmails extends Component
{
    public function __construct(private NotificationService $notificationService) {}

    public function render()
    {
        return view('components.test-emails');
    }

    public function sendTestEmail($type, $order = null)
    {
        $user = auth()->user();
        
        try {
            switch ($type) {
                case 'order':
                    $order = $order ?? $user->orders()->latest()->first();
                    if (!$order) return ['success' => false, 'message' => 'No orders found'];
                    $this->notificationService->sendOrderConfirmation($order);
                    break;
                    
                case 'status':
                    $order = $order ?? $user->orders()->latest()->first();
                    if (!$order) return ['success' => false, 'message' => 'No orders found'];
                    $this->notificationService->sendOrderStatusUpdate($order, 'shipped', 'Your order has been shipped and is on its way!');
                    break;
                    
                case 'payment':
                    $order = $order ?? $user->orders()->latest()->first();
                    if (!$order) return ['success' => false, 'message' => 'No orders found'];
                    $transaction = $order->transactions()->first() ?? new PaymentTransaction(['order_id' => $order->id]);
                    $this->notificationService->sendPaymentConfirmation($order, $transaction);
                    break;
                    
                case 'account':
                    $this->notificationService->sendAccountActivity($user, 'new_device_login', [
                        'ip_address' => request()->ip(),
                        'location' => 'Test Location',
                        'device' => request()->userAgent(),
                        'login_time' => now()->format('F j, Y H:i')
                    ]);
                    break;
                    
                default:
                    return ['success' => false, 'message' => 'Invalid email type'];
            }
            
            return ['success' => true, 'message' => ucfirst($type) . ' email queued successfully!'];
            
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
