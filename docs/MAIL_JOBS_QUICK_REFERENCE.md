# Mail Jobs Implementation - Quick Reference

## Current Issues Summary

### 🔴 Critical Issues (Fix Immediately)
1. **ProductRequest sends emails directly** - Blocks requests, no retry logic
   - Location: `app/Models/ProductRequest.php` lines 535-584
   - Fix: Create events and jobs, move to queue

2. **Inconsistent job dispatching** - `SendOrderNotifications` uses deprecated `Queue::push()`
   - Location: `app/Listeners/SendOrderNotifications.php`
   - Fix: Change to `dispatch()` pattern

### 🟡 Important Issues (Fix Soon)
3. **Missing retry logic** in most jobs
   - Jobs missing: `SendPaymentConfirmationEmail`, `SendPaymentApprovedEmail`, `SendPaymentFailedEmail`, `SendAdvanceOrderConfirmationEmail`, `SendAdvancePaymentConfirmationEmail`, `SendAdvancePaymentApprovedEmail`, `SendShipmentCreatedEmail`
   - Fix: Add `$tries = 5` and `$backoff = [5, 10, 20, 30]`

4. **Inconsistent error handling** - Some jobs have try/catch, others don't
   - Fix: Standardize error handling pattern

5. **Missing queue names** - Not all jobs specify queue
   - Fix: Add `->onQueue('emails')` to all dispatches

### 🟢 Nice to Have (Can be done incrementally)
6. **Missing type hints** - Some jobs use generic types
7. **Inconsistent logging** - Some jobs log, others don't
8. **Outdated SendEmailJob** - Uses old Mail::send() pattern

## Standard Job Template

```php
<?php

namespace App\Jobs;

use App\Mail\XxxMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendXxxEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 5;
    public $backoff = [5, 10, 20, 30];

    public function __construct(
        public Order $order, // Use proper type hints
        public User $user,
        // ... other params with type hints
    ) {}

    public function handle(): void
    {
        Log::info('[SendXxxEmail] Handling job', [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number ?? null,
            'user_email' => $this->user->email ?? null,
        ]);

        try {
            Mail::to($this->user->email)
                ->send(new XxxMail($this->order, $this->user));
        } catch (\Throwable $e) {
            Log::error('[SendXxxEmail] Send failed', [
                'order_id' => $this->order->id ?? null,
                'user_email' => $this->user->email ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e; // Re-throw for queue retry mechanism
        }
    }
}
```

## Standard Listener Pattern

```php
public function handle($event): void
{
    if ($event instanceof XxxEvent) {
        if (!$this->reserveOutboxKey($this->makeKey('xxx', $event->model->id), get_class($event))) {
            return; // Already processed (idempotency)
        }
        
        $model = $event->model;
        $user = $model->user;
        
        if ($model && $user) {
            Log::info('[ListenerName] Dispatching job', [
                'model_id' => $model->id,
                'user_email' => $user->email,
            ]);
            
            SendXxxEmail::dispatch($model, $user)
                ->onQueue('emails');
        }
    }
}
```

## Jobs Status Matrix

| Job Name | Retry Logic | Error Handling | Queue Name | Type Hints | Status |
|----------|-------------|----------------|------------|------------|--------|
| SendOrderConfirmationEmail | ✅ | ✅ | ❌ | ⚠️ Partial | Needs queue name, better types |
| SendOrderStatusUpdateEmail | ✅ | ✅ | ❌ | ⚠️ Partial | Needs queue name, better types |
| SendPaymentConfirmationEmail | ❌ | ⚠️ Basic | ❌ | ❌ | Needs all |
| SendPaymentApprovedEmail | ❌ | ❌ | ❌ | ⚠️ Partial | Needs all |
| SendPaymentFailedEmail | ❌ | ❌ | ❌ | ⚠️ Partial | Needs all |
| SendAdvanceOrderConfirmationEmail | ❌ | ❌ | ❌ | ⚠️ Partial | Needs all |
| SendAdvancePaymentConfirmationEmail | ❌ | ❌ | ❌ | ⚠️ Partial | Needs all |
| SendAdvancePaymentApprovedEmail | ❌ | ❌ | ❌ | ⚠️ Partial | Needs all |
| SendShipmentCreatedEmail | ❌ | ❌ | ❌ | ⚠️ Partial | Needs all |

## Files to Create

### Events
- `app/Events/ProductRequestCreated.php`
- `app/Events/ProductRequestStatusChanged.php`

### Jobs
- `app/Jobs/SendProductRequestSubmittedEmail.php`
- `app/Jobs/SendProductRequestStatusUpdateEmail.php`
- `app/Jobs/SendProductRequestAdminNotificationEmail.php`

### Listeners
- `app/Listeners/SendProductRequestNotifications.php`

## Files to Update

### High Priority
1. `app/Models/ProductRequest.php` - Remove direct Mail calls
2. `app/Listeners/SendOrderNotifications.php` - Use dispatch()
3. All job files in `app/Jobs/` - Standardize structure

### Medium Priority
4. `app/Services/NotificationService.php` - Fix sendEmail() method
5. `app/Providers/EventServiceProvider.php` - Register new events
6. All mail classes in `app/Mail/` - Verify model relationships

## Quick Fixes

### Fix 1: Add Retry Logic to Job
```php
public $tries = 5;
public $backoff = [5, 10, 20, 30];
```

### Fix 2: Add Error Handling
```php
try {
    Mail::to($this->user->email)->send(new XxxMail(...));
} catch (\Throwable $e) {
    Log::error('[JobName] Send failed', ['error' => $e->getMessage()]);
    throw $e;
}
```

### Fix 3: Add Queue Name
```php
SendXxxEmail::dispatch($model, $user)->onQueue('emails');
```

### Fix 4: Use dispatch() Instead of Queue::push()
```php
// OLD
Queue::push(new SendXxxEmail($model, $user));

// NEW
SendXxxEmail::dispatch($model, $user)->onQueue('emails');
```

## Testing Checklist

- [ ] Test each job sends email correctly
- [ ] Test error handling and retry logic
- [ ] Test idempotency prevents duplicates
- [ ] Test event → listener → job flow
- [ ] Test ProductRequest emails are queued
- [ ] Test all mail classes render correctly
- [ ] Test with missing/null relationships

## Implementation Order

1. **Week 1**: Fix ProductRequest direct mail sending (Phase 2)
2. **Week 1**: Standardize job structure (Phase 1)
3. **Week 2**: Fix listener inconsistencies (Phase 3)
4. **Week 2**: Review mail classes (Phase 5)
5. **Week 3**: Add missing features (Phase 6)
6. **Week 3**: Testing (Phase 7)

