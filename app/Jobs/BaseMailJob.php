<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Base Mail Job
 * 
 * Abstract base class for all mail jobs in the application.
 * Provides standard retry configuration, logging, and error handling patterns.
 * 
 * Usage:
 * ```php
 * class SendXxxEmail extends BaseMailJob
 * {
 *     public function __construct(public Order $order, public User $user) {}
 *     
 *     public function handle(): void
 *     {
 *         $this->logJobStart(['order_id' => $this->order->id]);
 *         
 *         try {
 *             Mail::to($this->user->email)
 *                 ->send(new XxxMail($this->order, $this->user));
 *         } catch (\Throwable $e) {
 *             $this->handleError($e, ['order_id' => $this->order->id]);
 *         }
 *     }
 * }
 * ```
 */
abstract class BaseMailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     * 
     * @var int
     */
    public $tries = 5;

    /**
     * The number of seconds to wait before retrying the job.
     * Exponential backoff: 5s, 10s, 20s, 30s
     * 
     * @var array
     */
    public $backoff = [5, 10, 20, 30];

    /**
     * Log job start with context.
     * 
     * @param array $context Additional context to include in log
     * @return void
     */
    protected function logJobStart(array $context = []): void
    {
        $jobName = static::class;
        Log::info("[{$jobName}] Handling job", $context);
    }

    /**
     * Log job completion with context.
     * 
     * @param array $context Additional context to include in log
     * @return void
     */
    protected function logJobComplete(array $context = []): void
    {
        $jobName = static::class;
        Log::info("[{$jobName}] Job completed successfully", $context);
    }

    /**
     * Handle and log errors consistently.
     * 
     * @param \Throwable $e The exception that occurred
     * @param array $context Additional context to include in log
     * @return void
     * @throws \Throwable Re-throws the exception for queue retry mechanism
     */
    protected function handleError(\Throwable $e, array $context = []): void
    {
        $jobName = static::class;
        Log::error("[{$jobName}] Send failed", array_merge($context, [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]));
        
        // Re-throw to mark job as failed and trigger retry mechanism
        throw $e;
    }

    /**
     * Send email with standard error handling.
     * 
     * This is a convenience method that wraps Mail::to()->send() with
     * standard error handling and logging.
     * 
     * @param string $email Recipient email address
     * @param \Illuminate\Mail\Mailable $mailable The mailable instance
     * @param array $context Additional context for logging
     * @return void
     * @throws \Throwable
     */
    protected function sendEmail(string $email, $mailable, array $context = []): void
    {
        try {
            \Illuminate\Support\Facades\Mail::to($email)->send($mailable);
        } catch (\Throwable $e) {
            $this->handleError($e, array_merge($context, [
                'recipient_email' => $email,
            ]));
        }
    }

    /**
     * Execute the job.
     * 
     * This method must be implemented by child classes.
     * 
     * @return void
     */
    abstract public function handle(): void;
}

