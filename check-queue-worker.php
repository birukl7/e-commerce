<?php

/**
 * Queue Worker & Cron Job Health Check Script
 * 
 * Upload this file to your cPanel server and run:
 * php check-queue-worker.php
 * 
 * Or access via browser if placed in public directory
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Check if running from CLI or web
$isCli = php_sapi_name() === 'cli';

if (!$isCli) {
    header('Content-Type: text/plain');
    echo "=== Queue Worker & Cron Job Health Check ===\n\n";
}

echo "=== Queue Worker & Cron Job Health Check ===\n\n";

// 1. Check queue worker process
echo "1. Queue Worker Status:\n";
exec('ps aux | grep "queue:work" | grep -v grep', $workerProcesses);

if (empty($workerProcesses)) {
    echo "   ❌ Queue worker is NOT running!\n";
    echo "   → Start with: php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &\n\n";
} else {
    echo "   ✓ Queue worker is running\n";
    foreach ($workerProcesses as $process) {
        // Extract PID and runtime
        if (preg_match('/(\d+)\s+.*?(\d+:\d+)/', $process, $matches)) {
            $pid = $matches[1];
            $runtime = $matches[2];
            echo "   PID: {$pid}, Runtime: {$runtime}\n";
        }
        
        // Check if processing correct queues
        if (strpos($process, '--queue=emails,default') !== false || 
            strpos($process, '--queue=default,emails') !== false) {
            echo "   ✓ Processing emails and default queues\n";
        } else {
            echo "   ⚠️  May not be processing emails queue\n";
        }
    }
}
echo "\n";

// 2. Check cron job
echo "2. Cron Job Configuration:\n";
exec('crontab -l 2>/dev/null', $crontab);

if (empty($crontab)) {
    echo "   ❌ No cron jobs found!\n";
    echo "   → Set up cron job in cPanel\n\n";
} else {
    $queueWorkerCron = false;
    foreach ($crontab as $line) {
        if (stripos($line, 'queue:work') !== false) {
            $queueWorkerCron = true;
            echo "   ✓ Found queue worker cron job\n";
            
            // Check for common issues
            if (stripos($line, '--stop-when-empty') !== false) {
                echo "   ⚠️  Uses --stop-when-empty (worker will stop after processing)\n";
            }
            if (stripos($line, 'pgrep') === false && stripos($line, 'queue:work') !== false) {
                echo "   ⚠️  No check for existing worker (may start multiple workers)\n";
            }
            if (stripos($line, '--max-time') === false) {
                echo "   ⚠️  No --max-time specified\n";
            }
        }
    }
    
    if (!$queueWorkerCron) {
        echo "   ❌ No queue worker cron job found!\n";
        echo "   → Add cron job in cPanel\n\n";
    } else {
        echo "\n";
    }
}

// 3. Check pending jobs
echo "3. Pending Jobs:\n";
try {
    $pendingCount = \Illuminate\Support\Facades\DB::table('jobs')->count();
    echo "   Total pending: {$pendingCount}\n";
    
    if ($pendingCount > 0) {
        if (empty($workerProcesses)) {
            echo "   ❌ CRITICAL: Jobs are pending but worker is not running!\n";
        } else {
            echo "   ⚠️  Jobs are pending (worker should process them)\n";
            
            $jobs = \Illuminate\Support\Facades\DB::table('jobs')
                ->select('queue', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
                ->groupBy('queue')
                ->get();
            
            foreach ($jobs as $job) {
                echo "   Queue '{$job->queue}': {$job->count} jobs\n";
            }
        }
    } else {
        echo "   ✓ No pending jobs\n";
    }
} catch (\Exception $e) {
    echo "   ❌ Error checking jobs: " . $e->getMessage() . "\n";
}
echo "\n";

// 4. Check failed jobs
echo "4. Failed Jobs:\n";
try {
    $failedCount = \Illuminate\Support\Facades\DB::table('failed_jobs')->count();
    echo "   Total failed: {$failedCount}\n";
    
    if ($failedCount > 0) {
        echo "   ⚠️  There are failed jobs\n";
        echo "   → View with: php artisan queue:failed\n";
        echo "   → Retry with: php artisan queue:retry all\n";
        
        $recentFailed = \Illuminate\Support\Facades\DB::table('failed_jobs')
            ->orderBy('failed_at', 'desc')
            ->limit(3)
            ->get(['id', 'queue', 'failed_at']);
        
        if ($recentFailed->count() > 0) {
            echo "   Recent failures:\n";
            foreach ($recentFailed as $failed) {
                echo "   - ID: {$failed->id}, Queue: {$failed->queue}, Failed: {$failed->failed_at}\n";
            }
        }
    } else {
        echo "   ✓ No failed jobs\n";
    }
} catch (\Exception $e) {
    echo "   ❌ Error checking failed jobs: " . $e->getMessage() . "\n";
}
echo "\n";

// 5. Check queue worker logs
echo "5. Queue Worker Log Activity:\n";
$logFile = storage_path('logs/queue-worker.log');

if (!file_exists($logFile)) {
    echo "   ⚠️  Log file not found: {$logFile}\n";
    echo "   → This suggests the worker hasn't run recently\n";
} else {
    $lines = file($logFile);
    $lastLines = array_slice($lines, -10);
    
    // Check for recent activity (last 10 minutes)
    $recentActivity = false;
    foreach (array_reverse($lastLines) as $line) {
        if (preg_match('/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/', $line, $matches)) {
            $logTime = strtotime($matches[1]);
            if ($logTime > (time() - 600)) { // Last 10 minutes
                $recentActivity = true;
                break;
            }
        }
    }
    
    if ($recentActivity) {
        echo "   ✓ Recent activity found (last 10 minutes)\n";
    } else {
        echo "   ⚠️  No recent activity (last entry may be old)\n";
    }
    
    echo "   Last 5 lines:\n";
    foreach (array_slice($lastLines, -5) as $line) {
        echo "   " . trim($line) . "\n";
    }
}
echo "\n";

// 6. Check email configuration
echo "6. Email Configuration:\n";
$mailDriver = config('mail.default');
$mailHost = config('mail.mailers.smtp.host');
$mailPort = config('mail.mailers.smtp.port');
$mailFrom = config('mail.from.address');

echo "   Driver: {$mailDriver}\n";
echo "   Host: {$mailHost}\n";
echo "   Port: {$mailPort}\n";
echo "   From: {$mailFrom}\n";

if ($mailDriver === 'smtp' && $mailHost) {
    echo "   ✓ SMTP configured\n";
} else {
    echo "   ⚠️  SMTP may not be properly configured\n";
}
echo "\n";

// 7. Summary
echo "=== Summary ===\n\n";

$issues = [];
if (empty($workerProcesses)) {
    $issues[] = "Queue worker is not running";
}
if ($pendingCount > 0 && empty($workerProcesses)) {
    $issues[] = "Jobs are pending but worker is not running";
}
if ($failedCount > 0) {
    $issues[] = "There are {$failedCount} failed jobs";
}

if (empty($issues)) {
    echo "✓ Everything looks good!\n";
    echo "  - Queue worker is running\n";
    echo "  - No pending jobs\n";
    echo "  - No failed jobs\n";
} else {
    echo "⚠️  Issues found:\n";
    foreach ($issues as $issue) {
        echo "  - {$issue}\n";
    }
    echo "\n";
    echo "Recommended actions:\n";
    if (empty($workerProcesses)) {
        echo "1. Start queue worker:\n";
        echo "   cd ~/e-commerce.biruklemma.com/biruklir\n";
        echo "   php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &\n\n";
    }
    if ($failedCount > 0) {
        echo "2. Check failed jobs:\n";
        echo "   php artisan queue:failed\n\n";
    }
}

echo "\n";
echo "=== Check Complete ===\n";

