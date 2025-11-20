<?php
/**
 * Queue Setup Verification Script
 * 
 * Run this script via: php verify-queue-setup.php
 * Or via cPanel Terminal
 */

echo "=== Laravel Mail Jobs Setup Verification ===\n\n";

$checks = [];
$errors = [];
$warnings = [];

// 1. Check if running from Laravel directory
if (!file_exists('artisan')) {
    echo "❌ ERROR: Not in Laravel root directory. Please run from application root.\n";
    exit(1);
}

echo "✓ Running from Laravel root directory\n\n";

// 2. Check .env file
echo "1. Checking .env file...\n";
if (!file_exists('.env')) {
    $errors[] = ".env file not found";
    echo "  ❌ .env file not found\n";
} else {
    echo "  ✓ .env file exists\n";
    
    // Check queue connection
    $env = file_get_contents('.env');
    if (strpos($env, 'QUEUE_CONNECTION=database') !== false) {
        echo "  ✓ QUEUE_CONNECTION=database\n";
        $checks['queue_connection'] = true;
    } else {
        $warnings[] = "QUEUE_CONNECTION not set to 'database'";
        echo "  ⚠️  QUEUE_CONNECTION not set to 'database'\n";
    }
    
    // Check mail settings
    if (strpos($env, 'MAIL_MAILER=smtp') !== false) {
        echo "  ✓ MAIL_MAILER=smtp\n";
        $checks['mail_mailer'] = true;
    } else {
        $warnings[] = "MAIL_MAILER not set to 'smtp'";
        echo "  ⚠️  MAIL_MAILER not set to 'smtp'\n";
    }
}

echo "\n";

// 3. Check database tables
echo "2. Checking database tables...\n";
try {
    require __DIR__ . '/vendor/autoload.php';
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    
    $db = \Illuminate\Support\Facades\DB::connection();
    
    // Check jobs table
    try {
        $jobsCount = \Illuminate\Support\Facades\DB::table('jobs')->count();
        echo "  ✓ jobs table exists (pending jobs: $jobsCount)\n";
        $checks['jobs_table'] = true;
    } catch (\Exception $e) {
        $errors[] = "jobs table not found: " . $e->getMessage();
        echo "  ❌ jobs table not found\n";
    }
    
    // Check failed_jobs table
    try {
        $failedCount = \Illuminate\Support\Facades\DB::table('failed_jobs')->count();
        echo "  ✓ failed_jobs table exists (failed jobs: $failedCount)\n";
        $checks['failed_jobs_table'] = true;
        if ($failedCount > 0) {
            $warnings[] = "$failedCount failed jobs found. Review them.";
        }
    } catch (\Exception $e) {
        $errors[] = "failed_jobs table not found: " . $e->getMessage();
        echo "  ❌ failed_jobs table not found\n";
    }
    
    // Check notification_outbox table
    try {
        $outboxCount = \Illuminate\Support\Facades\DB::table('notification_outbox')->count();
        echo "  ✓ notification_outbox table exists (notifications: $outboxCount)\n";
        $checks['notification_outbox_table'] = true;
    } catch (\Exception $e) {
        $errors[] = "notification_outbox table not found: " . $e->getMessage();
        echo "  ❌ notification_outbox table not found\n";
    }
} catch (\Exception $e) {
    $errors[] = "Database connection failed: " . $e->getMessage();
    echo "  ❌ Database connection failed\n";
}

echo "\n";

// 4. Check queue worker process
echo "3. Checking queue worker process...\n";
$queueProcess = shell_exec("ps aux | grep 'queue:work' | grep -v grep");
if (!empty($queueProcess)) {
    echo "  ✓ Queue worker is running\n";
    echo "  Process: " . trim($queueProcess) . "\n";
    $checks['queue_worker'] = true;
} else {
    $warnings[] = "Queue worker process not found. Set up Cron Job.";
    echo "  ⚠️  Queue worker process not found\n";
    echo "  → Set up Cron Job to run: php artisan queue:work --queue=emails,default\n";
}

echo "\n";

// 5. Check storage permissions
echo "4. Checking storage permissions...\n";
$storageWritable = is_writable('storage');
$logsWritable = is_writable('storage/logs');
$cacheWritable = is_writable('bootstrap/cache');

if ($storageWritable) {
    echo "  ✓ storage/ is writable\n";
    $checks['storage_permissions'] = true;
} else {
    $errors[] = "storage/ directory is not writable";
    echo "  ❌ storage/ is not writable\n";
}

if ($logsWritable) {
    echo "  ✓ storage/logs/ is writable\n";
} else {
    $errors[] = "storage/logs/ directory is not writable";
    echo "  ❌ storage/logs/ is not writable\n";
}

if ($cacheWritable) {
    echo "  ✓ bootstrap/cache/ is writable\n";
} else {
    $errors[] = "bootstrap/cache/ directory is not writable";
    echo "  ❌ bootstrap/cache/ is not writable\n";
}

echo "\n";

// 6. Check queue worker log
echo "5. Checking queue worker log...\n";
$logFile = 'storage/logs/queue-worker.log';
if (file_exists($logFile)) {
    $logSize = filesize($logFile);
    $logModified = date('Y-m-d H:i:s', filemtime($logFile));
    echo "  ✓ queue-worker.log exists\n";
    echo "  Size: " . number_format($logSize) . " bytes\n";
    echo "  Last modified: $logModified\n";
    
    // Check if log is recent (within last hour)
    $logAge = time() - filemtime($logFile);
    if ($logAge < 3600) {
        echo "  ✓ Log is recent (within last hour)\n";
        $checks['log_recent'] = true;
    } else {
        $warnings[] = "Queue worker log is old. Worker may not be running.";
        echo "  ⚠️  Log is old (last modified: $logModified)\n";
    }
} else {
    $warnings[] = "queue-worker.log not found. Worker may not have run yet.";
    echo "  ⚠️  queue-worker.log not found\n";
}

echo "\n";

// 7. Check mail configuration
echo "6. Checking mail configuration...\n";
try {
    $mailConfig = config('mail');
    $mailer = config('mail.default');
    echo "  ✓ Mail config loaded\n";
    echo "  Default mailer: $mailer\n";
    
    if ($mailer === 'smtp') {
        $host = config('mail.mailers.smtp.host');
        $port = config('mail.mailers.smtp.port');
        echo "  SMTP Host: $host\n";
        echo "  SMTP Port: $port\n";
        $checks['mail_config'] = true;
    }
} catch (\Exception $e) {
    $warnings[] = "Could not load mail config: " . $e->getMessage();
    echo "  ⚠️  Could not load mail config\n";
}

echo "\n";

// 8. Check queue configuration
echo "7. Checking queue configuration...\n";
try {
    $queueConnection = config('queue.default');
    echo "  ✓ Queue config loaded\n";
    echo "  Default connection: $queueConnection\n";
    
    if ($queueConnection === 'database') {
        echo "  ✓ Using database queue driver\n";
        $checks['queue_config'] = true;
    } else {
        $warnings[] = "Queue connection is '$queueConnection', not 'database'";
        echo "  ⚠️  Queue connection is '$queueConnection'\n";
    }
} catch (\Exception $e) {
    $warnings[] = "Could not load queue config: " . $e->getMessage();
    echo "  ⚠️  Could not load queue config\n";
}

echo "\n";

// Summary
echo "=== Summary ===\n\n";

$totalChecks = count($checks);
$passedChecks = count(array_filter($checks));

echo "Checks passed: $passedChecks/$totalChecks\n\n";

if (empty($errors) && empty($warnings)) {
    echo "✅ All checks passed! Mail jobs should be working correctly.\n";
} else {
    if (!empty($errors)) {
        echo "❌ ERRORS:\n";
        foreach ($errors as $error) {
            echo "  - $error\n";
        }
        echo "\n";
    }
    
    if (!empty($warnings)) {
        echo "⚠️  WARNINGS:\n";
        foreach ($warnings as $warning) {
            echo "  - $warning\n";
        }
        echo "\n";
    }
    
    echo "Please review the errors and warnings above.\n";
    echo "See CPANEL_QUICK_SETUP_GUIDE.md for setup instructions.\n";
}

echo "\n";

// Recommendations
echo "=== Recommendations ===\n\n";

if (!isset($checks['queue_worker']) || !$checks['queue_worker']) {
    echo "1. Set up Cron Job to run queue worker:\n";
    echo "   Command: cd " . getcwd() . " && php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1\n";
    echo "   Schedule: Every minute (* * * * *)\n\n";
}

if (isset($checks['failed_jobs_table']) && $checks['failed_jobs_table']) {
    try {
        $failedCount = \Illuminate\Support\Facades\DB::table('failed_jobs')->count();
        if ($failedCount > 0) {
            echo "2. Review failed jobs:\n";
            echo "   Run: php artisan queue:failed\n";
            echo "   Or check failed_jobs table in database\n\n";
        }
    } catch (\Exception $e) {
        // Ignore
    }
}

echo "3. Monitor queue worker:\n";
echo "   Check logs: tail -f storage/logs/queue-worker.log\n";
echo "   Check process: ps aux | grep queue:work\n\n";

echo "=== End of Verification ===\n";

