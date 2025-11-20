<?php
/**
 * Email Queue Diagnostic Script
 * 
 * Run this on your cPanel server to diagnose why emails aren't being sent.
 * 
 * Usage: php diagnose-email-queue.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n";
echo "========================================\n";
echo "  EMAIL QUEUE DIAGNOSTIC REPORT\n";
echo "========================================\n";
echo "\n";

// 1. Check Queue Configuration
echo "1. QUEUE CONFIGURATION\n";
echo "   " . str_repeat("-", 50) . "\n";
$queueConnection = config('queue.default');
$queueDriver = config("queue.connections.{$queueConnection}.driver");
echo "   Queue Connection: {$queueConnection}\n";
echo "   Queue Driver: {$queueDriver}\n";
echo "\n";

// 2. Check Database Queue Table
if ($queueDriver === 'database') {
    echo "2. DATABASE QUEUE STATUS\n";
    echo "   " . str_repeat("-", 50) . "\n";
    
    try {
        $jobsTable = config("queue.connections.{$queueConnection}.table", 'jobs');
        $pendingJobs = DB::table($jobsTable)->count();
        $failedJobs = DB::table('failed_jobs')->count();
        
        echo "   Pending Jobs: {$pendingJobs}\n";
        echo "   Failed Jobs: {$failedJobs}\n";
        
        // Show recent jobs
        $recentJobs = DB::table($jobsTable)
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get(['id', 'queue', 'payload', 'attempts', 'created_at']);
        
        if ($recentJobs->count() > 0) {
            echo "\n   Recent Pending Jobs:\n";
            foreach ($recentJobs as $job) {
                $payload = json_decode($job->payload, true);
                $jobClass = $payload['displayName'] ?? 'Unknown';
                $queue = $job->queue ?? 'default';
                echo "     - ID: {$job->id}, Queue: {$queue}, Class: {$jobClass}, Attempts: {$job->attempts}\n";
            }
        }
        
        // Show failed jobs
        if ($failedJobs > 0) {
            $recentFailed = DB::table('failed_jobs')
                ->orderBy('failed_at', 'desc')
                ->limit(3)
                ->get(['id', 'queue', 'payload', 'exception', 'failed_at']);
            
            echo "\n   Recent Failed Jobs:\n";
            foreach ($recentFailed as $job) {
                $payload = json_decode($job->payload, true);
                $jobClass = $payload['displayName'] ?? 'Unknown';
                $queue = $job->queue ?? 'default';
                $failedAt = $job->failed_at;
                echo "     - ID: {$job->id}, Queue: {$queue}, Class: {$jobClass}, Failed: {$failedAt}\n";
                if (strlen($job->exception) > 200) {
                    echo "       Error: " . substr($job->exception, 0, 200) . "...\n";
                } else {
                    echo "       Error: {$job->exception}\n";
                }
            }
        }
    } catch (\Exception $e) {
        echo "   ❌ ERROR: Could not check database queue: " . $e->getMessage() . "\n";
    }
    echo "\n";
}

// 3. Check Queue Worker Process
echo "3. QUEUE WORKER STATUS\n";
echo "   " . str_repeat("-", 50) . "\n";
$workerRunning = false;
$processes = [];
exec("ps aux | grep 'queue:work' | grep -v grep", $processes);
if (count($processes) > 0) {
    $workerRunning = true;
    echo "   ✓ Queue worker is running\n";
    foreach ($processes as $process) {
        // Extract relevant info
        if (preg_match('/queue:work.*?--queue=([^\s]+)/', $process, $matches)) {
            $queues = $matches[1];
            echo "     Processing queues: {$queues}\n";
        }
    }
} else {
    echo "   ❌ Queue worker is NOT running\n";
    echo "     → Start with: php artisan queue:work --queue=emails,default\n";
}
echo "\n";

// 4. Check Event/Listener Registration
echo "4. EVENT/LISTENER REGISTRATION\n";
echo "   " . str_repeat("-", 50) . "\n";
$eventServiceProvider = app(\App\Providers\EventServiceProvider::class);
$listeners = $eventServiceProvider->listens;

$requiredEvents = [
    'App\Events\OrderCreated',
    'App\Events\PaymentApproved',
    'App\Events\ProductRequestCreated',
];

foreach ($requiredEvents as $event) {
    if (isset($listeners[$event])) {
        echo "   ✓ {$event}\n";
        foreach ($listeners[$event] as $listener) {
            $isQueued = in_array('Illuminate\Contracts\Queue\ShouldQueue', class_implements($listener));
            $status = $isQueued ? " (queued)" : " (sync)";
            echo "     → {$listener}{$status}\n";
        }
    } else {
        echo "   ❌ {$event} - NOT REGISTERED\n";
    }
}
echo "\n";

// 5. Check Recent Logs
echo "5. RECENT LOG ENTRIES\n";
echo "   " . str_repeat("-", 50) . "\n";
$logFile = storage_path('logs/laravel.log');
if (file_exists($logFile)) {
    $logLines = file($logFile);
    $recentLogs = array_slice($logLines, -20);
    
    $emailRelated = array_filter($recentLogs, function($line) {
        return stripos($line, 'email') !== false || 
               stripos($line, 'SendOrderNotifications') !== false ||
               stripos($line, 'SendPaymentNotifications') !== false ||
               stripos($line, 'SendProductRequestNotifications') !== false ||
               stripos($line, 'queue') !== false;
    });
    
    if (count($emailRelated) > 0) {
        echo "   Recent email/queue related logs:\n";
        foreach (array_slice($emailRelated, -10) as $line) {
            echo "     " . trim($line) . "\n";
        }
    } else {
        echo "   No recent email/queue related logs found\n";
    }
} else {
    echo "   Log file not found: {$logFile}\n";
}
echo "\n";

// 6. Check Mail Configuration
echo "6. MAIL CONFIGURATION\n";
echo "   " . str_repeat("-", 50) . "\n";
$mailDriver = config('mail.default');
$mailFrom = config('mail.from.address');
echo "   Mail Driver: {$mailDriver}\n";
echo "   From Address: {$mailFrom}\n";

if ($mailDriver === 'smtp') {
    $smtpHost = config('mail.mailers.smtp.host');
    $smtpPort = config('mail.mailers.smtp.port');
    echo "   SMTP Host: {$smtpHost}\n";
    echo "   SMTP Port: {$smtpPort}\n";
}
echo "\n";

// 7. Check NotificationOutbox
echo "7. NOTIFICATION OUTBOX (Idempotency)\n";
echo "   " . str_repeat("-", 50) . "\n";
try {
    $outboxCount = DB::table('notification_outboxes')->count();
    $recentOutbox = DB::table('notification_outboxes')
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get(['key', 'event_type', 'created_at']);
    
    echo "   Total Outbox Entries: {$outboxCount}\n";
    if ($recentOutbox->count() > 0) {
        echo "   Recent Entries:\n";
        foreach ($recentOutbox as $entry) {
            echo "     - {$entry->key} ({$entry->event_type}) - {$entry->created_at}\n";
        }
    }
} catch (\Exception $e) {
    echo "   ⚠️  Could not check outbox: " . $e->getMessage() . "\n";
}
echo "\n";

// 8. Recommendations
echo "8. RECOMMENDATIONS\n";
echo "   " . str_repeat("-", 50) . "\n";

if (!$workerRunning) {
    echo "   ❌ CRITICAL: Start the queue worker\n";
    echo "      Command: php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600\n";
    echo "      Or set up a cron job to keep it running\n";
}

if ($queueDriver === 'database') {
    $pendingJobs = DB::table($jobsTable ?? 'jobs')->count();
    if ($pendingJobs > 0 && $workerRunning) {
        echo "   ⚠️  There are {$pendingJobs} pending jobs. Check if worker is processing them.\n";
    }
    
    $failedJobs = DB::table('failed_jobs')->count();
    if ($failedJobs > 0) {
        echo "   ⚠️  There are {$failedJobs} failed jobs. Review them with: php artisan queue:failed\n";
    }
}

// Check if listeners are on default queue but worker only processes emails
if ($workerRunning && count($processes) > 0) {
    $processString = implode(' ', $processes);
    if (strpos($processString, '--queue=emails') !== false && strpos($processString, 'default') === false) {
        echo "   ⚠️  WARNING: Queue worker is only processing 'emails' queue.\n";
        echo "      Listeners are queued on 'default' queue and won't be processed!\n";
        echo "      Update worker command to: --queue=emails,default\n";
    }
}

echo "\n";
echo "========================================\n";
echo "  END OF DIAGNOSTIC REPORT\n";
echo "========================================\n";
echo "\n";

