<?php

/**
 * Cron Job Queue Worker Diagnostic Script
 * 
 * This script helps diagnose why the queue worker keeps stopping
 * 
 * Run this on your cPanel server:
 * php diagnose-cron-queue-worker.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Cron Job Queue Worker Diagnostic ===\n\n";

// 1. Check if queue worker is running
echo "1. Queue Worker Status:\n";
exec('ps aux | grep "queue:work" | grep -v grep', $workerProcesses);
if (empty($workerProcesses)) {
    echo "   ❌ Queue worker is NOT running\n\n";
} else {
    echo "   ✓ Queue worker is running\n";
    foreach ($workerProcesses as $process) {
        // Extract PID and runtime
        if (preg_match('/(\d+)\s+.*?(\d+:\d+)/', $process, $matches)) {
            $pid = $matches[1];
            $runtime = $matches[2];
            echo "   PID: {$pid}, Runtime: {$runtime}\n";
        }
        echo "   " . substr($process, 0, 120) . "\n";
    }
    echo "\n";
}

// 2. Check cron job configuration
echo "2. Cron Job Configuration:\n";
exec('crontab -l 2>/dev/null', $crontab);
if (empty($crontab)) {
    echo "   ❌ No cron jobs found!\n";
    echo "   Fix: Set up cron job in cPanel\n\n";
} else {
    $queueWorkerCron = false;
    foreach ($crontab as $line) {
        if (stripos($line, 'queue:work') !== false || stripos($line, 'queue-worker') !== false) {
            $queueWorkerCron = true;
            echo "   ✓ Found queue worker cron job:\n";
            echo "   " . trim($line) . "\n";
            
            // Check for common issues
            if (stripos($line, '--stop-when-empty') !== false) {
                echo "   ⚠️  WARNING: Uses --stop-when-empty (worker will stop after processing jobs)\n";
            }
            if (stripos($line, '--max-time') === false) {
                echo "   ⚠️  WARNING: No --max-time specified (worker may run indefinitely)\n";
            }
            if (stripos($line, 'pgrep') === false && stripos($line, 'queue:work') !== false) {
                echo "   ⚠️  WARNING: No check for existing worker (may start multiple workers)\n";
            }
        }
    }
    
    if (!$queueWorkerCron) {
        echo "   ❌ No queue worker cron job found!\n";
        echo "   Fix: Add cron job in cPanel\n\n";
    } else {
        echo "\n";
    }
}

// 3. Check recent queue worker log activity
echo "3. Queue Worker Log Activity:\n";
$logFile = storage_path('logs/queue-worker.log');
if (file_exists($logFile)) {
    $lines = file($logFile);
    $lastLines = array_slice($lines, -20);
    
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
} else {
    echo "   ⚠️  Log file not found: {$logFile}\n";
    echo "   This suggests the worker hasn't run recently\n";
}
echo "\n";

// 4. Check for errors in logs
echo "4. Error Check:\n";
$laravelLog = storage_path('logs/laravel.log');
if (file_exists($laravelLog)) {
    $lines = file($laravelLog);
    $errors = [];
    foreach (array_reverse($lines) as $line) {
        if (stripos($line, 'error') !== false || 
            stripos($line, 'exception') !== false ||
            stripos($line, 'fatal') !== false) {
            if (stripos($line, 'queue') !== false || 
                stripos($line, 'worker') !== false ||
                stripos($line, 'job') !== false) {
                $errors[] = trim($line);
                if (count($errors) >= 3) break;
            }
        }
    }
    
    if (empty($errors)) {
        echo "   ✓ No recent queue-related errors found\n";
    } else {
        echo "   ⚠️  Recent errors found:\n";
        foreach ($errors as $error) {
            echo "   " . substr($error, 0, 150) . "\n";
        }
    }
} else {
    echo "   ⚠️  Laravel log not found\n";
}
echo "\n";

// 5. Check pending jobs
echo "5. Pending Jobs:\n";
$pendingCount = \Illuminate\Support\Facades\DB::table('jobs')->count();
echo "   Total pending: {$pendingCount}\n";

if ($pendingCount > 0 && empty($workerProcesses)) {
    echo "   ❌ CRITICAL: Jobs are pending but worker is not running!\n";
} elseif ($pendingCount > 0) {
    echo "   ⚠️  Jobs are pending (worker should process them)\n";
} else {
    echo "   ✓ No pending jobs\n";
}
echo "\n";

// 6. Check worker uptime (if running)
if (!empty($workerProcesses)) {
    echo "6. Worker Uptime Analysis:\n";
    foreach ($workerProcesses as $process) {
        if (preg_match('/(\d+):(\d+)/', $process, $matches)) {
            $hours = (int)$matches[1];
            $minutes = (int)$matches[2];
            $totalMinutes = ($hours * 60) + $minutes;
            
            echo "   Worker has been running for: {$hours}h {$minutes}m ({$totalMinutes} minutes)\n";
            
            if ($totalMinutes > 55) {
                echo "   ⚠️  Worker is approaching --max-time=3600 (1 hour) limit\n";
                echo "   Worker will stop soon and cron should restart it\n";
            } elseif ($totalMinutes < 5) {
                echo "   ✓ Worker recently started (cron is working)\n";
            } else {
                echo "   ✓ Worker is running normally\n";
            }
        }
    }
    echo "\n";
}

// 7. Recommendations
echo "=== Recommendations ===\n\n";

if (empty($workerProcesses)) {
    echo "❌ CRITICAL: Queue worker is not running!\n\n";
    echo "Immediate Actions:\n";
    echo "1. Start worker manually:\n";
    echo "   cd ~/e-commerce.biruklemma.com/biruklir\n";
    echo "   php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &\n\n";
    
    echo "2. Verify cron job is set up correctly (see below)\n\n";
}

echo "=== Recommended Cron Job Configuration ===\n\n";

echo "Option 1: Smart Cron (Only starts if not running) - RECOMMENDED\n";
echo "Command:\n";
echo "*/5 * * * * pgrep -f 'queue:work.*emails' > /dev/null || cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &\n\n";

echo "Schedule: Every 5 minutes (*/5 * * * *)\n";
echo "What it does:\n";
echo "- Checks if worker is already running (pgrep)\n";
echo "- Only starts new worker if none is running\n";
echo "- Prevents multiple workers\n";
echo "- Auto-restarts if worker stops\n\n";

echo "Option 2: Every Minute (May start multiple workers)\n";
echo "Command:\n";
echo "* * * * * sleep \$((RANDOM % 60)) && cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1\n\n";

echo "Schedule: Every minute (* * * * *)\n";
echo "What it does:\n";
echo "- Runs every minute with random delay\n";
echo "- Worker stops after 1 hour (--max-time=3600)\n";
echo "- Cron restarts it within 1 minute\n";
echo "⚠️  May start multiple workers if timing overlaps\n\n";

echo "=== How to Fix ===\n\n";
echo "1. Go to cPanel → Cron Jobs\n";
echo "2. Edit or create cron job with Option 1 (recommended)\n";
echo "3. Save and wait 5 minutes\n";
echo "4. Verify: ps aux | grep 'queue:work' | grep -v grep\n\n";

echo "=== Testing ===\n\n";
echo "After updating cron job:\n";
echo "1. Wait 5-10 minutes\n";
echo "2. Check if worker is running:\n";
echo "   ps aux | grep 'queue:work' | grep -v grep\n";
echo "3. Check logs:\n";
echo "   tail -f storage/logs/queue-worker.log\n";
echo "4. Verify jobs are processing:\n";
echo "   php artisan tinker --execute=\"echo 'Pending: ' . DB::table('jobs')->count() . PHP_EOL;\"\n\n";

