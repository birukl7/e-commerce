<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class TestEmailCommand extends Command
{
    protected $signature = 'email:test {email} {--type=order : Test email type (order, status, payment, account)}';
    protected $description = 'Test email notifications';

    public function __construct(private NotificationService $notificationService)
    {
        parent::__construct();
    }

    public function handle()
    {
        $email = $this->argument('email');
        $type = $this->option('type');

        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => 'Test User', 'password' => bcrypt('password')]
        );

        switch ($type) {
            case 'order':
                $order = $user->orders()->latest()->first() ?? \App\Models\Order::factory()->create(['user_id' => $user->id]);
                $this->notificationService->sendOrderConfirmation($order);
                $this->info("Order confirmation email queued for: {$email}");
                break;
                
            case 'status':
                $order = $user->orders()->latest()->first() ?? \App\Models\Order::factory()->create(['user_id' => $user->id]);
                $this->notificationService->sendOrderStatusUpdate($order, 'shipped', 'Your order has been shipped and is on its way!');
                $this->info("Order status update email queued for: {$email}");
                break;
                
            case 'payment':
                $order = $user->orders()->latest()->first() ?? \App\Models\Order::factory()->create(['user_id' => $user->id]);
                $transaction = $order->transactions()->first() ?? \App\Models\PaymentTransaction::factory()->create(['order_id' => $order->id]);
                $this->notificationService->sendPaymentConfirmation($order, $transaction);
                $this->info("Payment confirmation email queued for: {$email}");
                break;
                
            case 'account':
                $this->notificationService->sendAccountActivity($user, 'new_device_login', [
                    'ip_address' => '192.168.1.1',
                    'location' => 'Addis Ababa, Ethiopia',
                    'device' => 'Chrome on Windows 10',
                    'login_time' => now()->format('F j, Y H:i')
                ]);
                $this->info("Account activity email queued for: {$email}");
                break;
                
            default:
                $this->error("Invalid email type. Available types: order, status, payment, account");
                return 1;
        }

        return 0;
    }
}
