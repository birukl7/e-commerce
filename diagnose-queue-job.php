<?php

/**
 * Queue Job Diagnostic Script
 * 
 * This script helps diagnose why queued jobs aren't being processed
 * 
 * Run this on your cPanel server:
 * php diagnose-queue-job.php [job_id]
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$jobId = $argv[1] ?? null;

echo "=== Queue Job Diagnostic ===\n\n";

// 1. Check queue worker status
echo "1. Queue Worker Status:\n";
exec('ps aux | grep "queue:work" | grep -v grep', $workerProcesses);
if (empty($workerProcesses)) {
    echo "   ❌ Queue worker is NOT running!\n";
    echo "   Fix: Start the queue worker\n";
    echo "   Command: php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &\n\n";
} else {
    echo "   ✓ Queue worker is running\n";
    foreach ($workerProcesses as $process) {
        echo "   Process: " . substr($process, 0, 100) . "\n";
    }
    echo "\n";
}

// 2. Check queue configuration
echo "2. Queue Configuration:\n";
$queueConnection = config('queue.default');
$queueDriver = config("queue.connections.{$queueConnection}.driver");
echo "   Connection: {$queueConnection}\n";
echo "   Driver: {$queueDriver}\n";

if ($queueDriver !== 'database') {
    echo "   ⚠️  Driver is not 'database' - make sure your queue driver matches\n\n";
} else {
    echo "   ✓ Using database queue driver\n\n";
}

// 3. Check pending jobs
echo "3. Pending Jobs:\n";
$pendingCount = \Illuminate\Support\Facades\DB::table('jobs')->count();
echo "   Total pending: {$pendingCount}\n";

if ($pendingCount > 0) {
    $jobs = \Illuminate\Support\Facades\DB::table('jobs')
        ->orderBy('id', 'desc')
        ->limit(5)
        ->get();
    
    echo "   Recent jobs:\n";
    foreach ($jobs as $job) {
        $payload = json_decode($job->payload, true);
        $jobClass = $payload['displayName'] ?? 'Unknown';
        $queue = $job->queue ?? 'default';
        $attempts = $job->attempts ?? 0;
        $createdAt = $job->created_at ?? 'N/A';
        
        echo "   - ID: {$job->id} | Class: {$jobClass} | Queue: {$queue} | Attempts: {$attempts} | Created: {$createdAt}\n";
    }
} else {
    echo "   ✓ No pending jobs\n";
}
echo "\n";

// 4. Check failed jobs
echo "4. Failed Jobs:\n";
$failedCount = \Illuminate\Support\Facades\DB::table('failed_jobs')->count();
echo "   Total failed: {$failedCount}\n";

if ($failedCount > 0) {
    $failedJobs = \Illuminate\Support\Facades\DB::table('failed_jobs')
        ->orderBy('id', 'desc')
        ->limit(3)
        ->get();
    
    echo "   Recent failed jobs:\n";
    foreach ($failedJobs as $job) {
        $payload = json_decode($job->payload, true);
        $jobClass = $payload['displayName'] ?? 'Unknown';
        $failedAt = $job->failed_at ?? 'N/A';
        $exception = substr($job->exception ?? 'N/A', 0, 200);
        
        echo "   - ID: {$job->id} | Class: {$jobClass} | Failed: {$failedAt}\n";
        echo "     Error: {$exception}\n";
    }
} else {
    echo "   ✓ No failed jobs\n";
}
echo "\n";

// 5. Check specific job if ID provided
if ($jobId) {
    echo "5. Job Details (ID: {$jobId}):\n";
    $job = \Illuminate\Support\Facades\DB::table('jobs')->where('id', $jobId)->first();
    
    if (!$job) {
        echo "   ❌ Job not found in jobs table\n";
        echo "   Checking failed_jobs...\n";
        $failedJob = \Illuminate\Support\Facades\DB::table('failed_jobs')->where('id', $jobId)->first();
        if ($failedJob) {
            echo "   ✓ Found in failed_jobs table\n";
            $payload = json_decode($failedJob->payload, true);
            echo "   Class: " . ($payload['displayName'] ?? 'Unknown') . "\n";
            echo "   Queue: " . ($failedJob->queue ?? 'default') . "\n";
            echo "   Failed at: " . ($failedJob->failed_at ?? 'N/A') . "\n";
            echo "   Exception: " . substr($failedJob->exception ?? 'N/A', 0, 500) . "\n";
        } else {
            echo "   ❌ Job not found in failed_jobs either\n";
        }
    } else {
        $payload = json_decode($job->payload, true);
        $jobClass = $payload['displayName'] ?? 'Unknown';
        $queue = $job->queue ?? 'default';
        $attempts = $job->attempts ?? 0;
        $reservedAt = $job->reserved_at ?? null;
        $createdAt = $job->created_at ?? 'N/A';
        
        echo "   Class: {$jobClass}\n";
        echo "   Queue: {$queue}\n";
        echo "   Attempts: {$attempts}\n";
        echo "   Created: {$createdAt}\n";
        echo "   Reserved: " . ($reservedAt ? date('Y-m-d H:i:s', $reservedAt) : 'Not reserved') . "\n";
        
        // Check if job is stuck (reserved but not processing)
        if ($reservedAt && (time() - $reservedAt) > 300) {
            echo "   ⚠️  Job appears stuck (reserved for more than 5 minutes)\n";
            echo "   Fix: Restart queue worker or release the job\n";
        }
        
        // Show job data
        if (isset($payload['data']['commandName'])) {
            echo "   Command: {$payload['data']['commandName']}\n";
        }
    }
    echo "\n";
}

// 6. Check queue worker logs
echo "6. Queue Worker Logs (last 10 lines):\n";
$logFile = storage_path('logs/queue-worker.log');
if (file_exists($logFile)) {
    $lines = file($logFile);
    $lastLines = array_slice($lines, -10);
    foreach ($lastLines as $line) {
        echo "   " . trim($line) . "\n";
    }
} else {
    echo "   ⚠️  Log file not found: {$logFile}\n";
}
echo "\n";

// 7. Check Laravel logs for job-related errors
echo "7. Recent Laravel Log Errors (job-related, last 5):\n";
$laravelLog = storage_path('logs/laravel.log');
if (file_exists($laravelLog)) {
    $lines = file($laravelLog);
    $jobErrors = [];
    foreach (array_reverse($lines) as $line) {
        if (stripos($line, 'job') !== false || 
            stripos($line, 'queue') !== false || 
            stripos($line, 'SendPayment') !== false ||
            stripos($line, 'SendOrder') !== false) {
            $jobErrors[] = trim($line);
            if (count($jobErrors) >= 5) break;
        }
    }
    
    if (empty($jobErrors)) {
        echo "   ✓ No recent job-related errors found\n";
    } else {
        foreach (array_reverse($jobErrors) as $error) {
            echo "   " . substr($error, 0, 150) . "\n";
        }
    }
} else {
    echo "   ⚠️  Log file not found: {$laravelLog}\n";
}
echo "\n";

// 8. Recommendations
echo "=== Recommendations ===\n\n";

if ($pendingCount > 0 && empty($workerProcesses)) {
    echo "❌ CRITICAL: Jobs are pending but queue worker is not running!\n";
    echo "   Action: Start the queue worker immediately\n";
    echo "   Command: cd ~/e-commerce.biruklemma.com/biruklir && php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &\n\n";
}

if ($pendingCount > 0 && !empty($workerProcesses)) {
    echo "⚠️  Jobs are pending but not being processed\n";
    echo "   Possible causes:\n";
    echo "   1. Queue worker is processing other jobs\n";
    echo "   2. Job is in wrong queue (check queue name)\n";
    echo "   3. Job is stuck (reserved but not processing)\n";
    echo "   4. Queue worker crashed (check logs)\n\n";
    echo "   Actions:\n";
    echo "   1. Check queue-worker.log for errors\n";
    echo "   2. Restart queue worker\n";
    echo "   3. Check if job queue matches worker queue\n\n";
}

if ($failedCount > 0) {
    echo "⚠️  There are failed jobs\n";
    echo "   Action: Review failed jobs and retry if needed\n";
    echo "   Command: php artisan queue:failed\n";
    echo "   Retry: php artisan queue:retry {id}\n\n";
}

echo "=== Quick Fixes ===\n\n";
echo "1. Start queue worker:\n";
echo "   cd ~/e-commerce.biruklemma.com/biruklir\n";
echo "   php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &\n\n";

echo "2. Check if worker is running:\n";
echo "   ps aux | grep 'queue:work' | grep -v grep\n\n";

echo "3. Watch queue worker logs:\n";
echo "   tail -f storage/logs/queue-worker.log\n\n";

echo "4. Retry failed jobs:\n";
echo "   php artisan queue:retry all\n\n";

echo "5. Clear stuck jobs (if needed):\n";
echo "   php artisan queue:restart\n\n";

