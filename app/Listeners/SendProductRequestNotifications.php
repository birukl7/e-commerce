<?php

namespace App\Listeners;

use App\Events\ProductRequestCreated;
use App\Events\ProductRequestStatusChanged;
use App\Jobs\SendProductRequestAdminNotificationEmail;
use App\Jobs\SendProductRequestStatusUpdateEmail;
use App\Jobs\SendProductRequestSubmittedEmail;
use App\Models\NotificationOutbox;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendProductRequestNotifications implements ShouldQueue
{
    use InteractsWithQueue, SerializesModels;
    
    public $queue = 'default';
    
    public function handle($event): void
    {
        try {
            Log::info('[SendProductRequestNotifications] Listener triggered', [
                'event_type' => get_class($event),
                'product_request_id' => $event->productRequest->id ?? null,
            ]);
            
            if ($event instanceof ProductRequestCreated) {
                $this->handleProductRequestCreated($event);
                return;
            }

            if ($event instanceof ProductRequestStatusChanged) {
                $this->handleProductRequestStatusChanged($event);
                return;
            }
            
            Log::warning('[SendProductRequestNotifications] Unhandled event type', [
                'event_type' => get_class($event),
            ]);
        } catch (\Throwable $e) {
            Log::error('[SendProductRequestNotifications] Error processing event', [
                'event_type' => get_class($event),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e; // Re-throw to mark job as failed
        }
    }

    private function handleProductRequestCreated(ProductRequestCreated $event): void
    {
        $productRequest = $event->productRequest;
        $user = $productRequest->user;

        if (!$productRequest || !$user) {
            return;
        }

        // Send notification to user
        $key = $this->makeKey('product_request_created', $productRequest->id);
        if ($this->reserveOutboxKey($key, get_class($event), $productRequest, $user->email)) {
            Log::info('[SendProductRequestNotifications] Dispatching SendProductRequestSubmittedEmail', [
                'product_request_id' => $productRequest->id,
            ]);
            
            SendProductRequestSubmittedEmail::dispatch($productRequest, $user)
                ->onQueue('emails');
        }

        // Send notification to admin
        $admin = $this->findAdmin();
        if ($admin) {
            $adminKey = $this->makeKey('product_request_created_admin', $productRequest->id);
            if ($this->reserveOutboxKey($adminKey, get_class($event), $productRequest, $admin->email)) {
                Log::info('[SendProductRequestNotifications] Dispatching SendProductRequestAdminNotificationEmail', [
                    'product_request_id' => $productRequest->id,
                    'admin_id' => $admin->id,
                ]);
                
                SendProductRequestAdminNotificationEmail::dispatch($productRequest, $admin)
                    ->onQueue('emails');
            }
        }
    }

    private function handleProductRequestStatusChanged(ProductRequestStatusChanged $event): void
    {
        $productRequest = $event->productRequest;
        $user = $productRequest->user;

        if (!$productRequest || !$user) {
            return;
        }

        $key = $this->makeKey('product_request_status_changed', $productRequest->id, $event->newStatus);
        if ($this->reserveOutboxKey($key, get_class($event), $productRequest, $user->email)) {
            Log::info('[SendProductRequestNotifications] Dispatching SendProductRequestStatusUpdateEmail', [
                'product_request_id' => $productRequest->id,
                'old_status' => $event->oldStatus,
                'new_status' => $event->newStatus,
            ]);
            
            SendProductRequestStatusUpdateEmail::dispatch($productRequest, $user, $event->admin)
                ->onQueue('emails');
        }
    }

    private function findAdmin(): ?User
    {
        try {
            // Try common admin role names
            foreach (['admin', 'administrator', 'super-admin', 'super admin'] as $roleName) {
                $admin = User::role($roleName)->first();
                if ($admin) {
                    return $admin;
                }
            }

            // Fallback: any user with a role containing 'admin'
            return User::whereHas('roles', function($q) {
                $q->where('name', 'like', '%admin%');
            })->first();
        } catch (\Throwable $e) {
            // Silently skip admin notification if roles are not set up
            Log::debug('[SendProductRequestNotifications] Could not find admin', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    private function makeKey(string $type, int $productRequestId, ?string $suffix = null): string
    {
        return $suffix 
            ? "product_request:{$productRequestId}:{$type}:{$suffix}" 
            : "product_request:{$productRequestId}:{$type}";
    }

    private function reserveOutboxKey(
        string $key, 
        string $eventType, 
        $productRequest, 
        ?string $recipient = null
    ): bool {
        try {
            NotificationOutbox::create([
                'key' => $key,
                'event_type' => $eventType,
                'model_type' => get_class($productRequest),
                'model_id' => $productRequest->id,
                'recipient' => $recipient,
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::debug('[SendProductRequestNotifications] Outbox key reservation failed (likely duplicate)', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);
            // Unique constraint violation means already processed
            return false;
        }
    }
}

