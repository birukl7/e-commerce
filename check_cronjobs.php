#!/usr/bin/env php
<?php

/**
 * Cronjob and Laravel Queue Diagnostic Script
 * 
 * This script checks:
 * - System cronjobs (crontab)
 * - cPanel cronjobs
 * - Laravel scheduler configuration
 * - Laravel queue configuration
 * - Running queue workers
 * - Recent cron execution logs
 * 
 * Usage: php check_cronjobs.php
 */

// Color codes for terminal output
class Colors {
    const RESET = "\033[0m";
    const RED = "\033[31m";
    const GREEN = "\033[32m";
    const YELLOW = "\033[33m";
    const BLUE = "\033[34m";
    const MAGENTA = "\033[35m";
    const CYAN = "\033[36m";
    const BOLD = "\033[1m";
}

function printHeader($text) {
    echo "\n" . Colors::BOLD . Colors::CYAN . str_repeat("=", 80) . Colors::RESET . "\n";
    echo Colors::BOLD . Colors::CYAN . $text . Colors::RESET . "\n";
    echo Colors::BOLD . Colors::CYAN . str_repeat("=", 80) . Colors::RESET . "\n\n";
}

function printSection($text) {
    echo "\n" . Colors::BOLD . Colors::YELLOW . "▶ " . $text . Colors::RESET . "\n";
    echo str_repeat("-", 80) . "\n";
}

function printSuccess($text) {
    echo Colors::GREEN . "✓ " . $text . Colors::RESET . "\n";
}

function printError($text) {
    echo Colors::RED . "✗ " . $text . Colors::RESET . "\n";
}

function printWarning($text) {
    echo Colors::YELLOW . "⚠ " . $text . Colors::RESET . "\n";
}

function printInfo($text) {
    echo Colors::BLUE . "ℹ " . $text . Colors::RESET . "\n";
}

function executeCommand($command) {
    $output = [];
    $returnVar = 0;
    exec($command . " 2>&1", $output, $returnVar);
    return [
        'output' => $output,
        'return_code' => $returnVar,
        'success' => $returnVar === 0
    ];
}

function checkFileExists($path) {
    return file_exists($path) && is_readable($path);
}

function readFileContent($path) {
    if (!checkFileExists($path)) {
        return null;
    }
    return file_get_contents($path);
}

// Get project root directory
$projectRoot = __DIR__;
$laravelRoot = $projectRoot;

// Check if we're in a Laravel project
if (!file_exists($laravelRoot . '/artisan')) {
    printError("Laravel artisan file not found. Make sure you're running this from the Laravel root directory.");
    exit(1);
}

printHeader("Cronjob & Laravel Queue Diagnostic Tool");

// ============================================================================
// 1. SYSTEM INFORMATION
// ============================================================================
printSection("System Information");

$whoami = executeCommand('whoami');
$hostname = executeCommand('hostname');
$phpVersion = phpversion();
$osInfo = php_uname();

echo "User: " . Colors::BOLD . trim(implode("\n", $whoami['output'])) . Colors::RESET . "\n";
echo "Hostname: " . Colors::BOLD . trim(implode("\n", $hostname['output'])) . Colors::RESET . "\n";
echo "PHP Version: " . Colors::BOLD . $phpVersion . Colors::RESET . "\n";
echo "OS: " . Colors::BOLD . $osInfo . Colors::RESET . "\n";
echo "Project Root: " . Colors::BOLD . $projectRoot . Colors::RESET . "\n";

// ============================================================================
// 2. CHECK SYSTEM CRONTAB
// ============================================================================
printSection("System Crontab (Current User)");

$crontabList = executeCommand('crontab -l');
if ($crontabList['success'] && !empty($crontabList['output'])) {
    printSuccess("Found crontab entries:");
    foreach ($crontabList['output'] as $line) {
        if (trim($line) && !preg_match('/^#/', $line)) {
            echo "  " . Colors::GREEN . $line . Colors::RESET . "\n";
        } elseif (trim($line)) {
            echo "  " . Colors::BLUE . $line . Colors::RESET . "\n";
        }
    }
} else {
    printWarning("No crontab entries found for current user");
}

// Check root crontab (if accessible)
$rootCrontab = executeCommand('sudo crontab -l 2>/dev/null || crontab -l -u root 2>/dev/null');
if ($rootCrontab['success'] && !empty($rootCrontab['output'])) {
    printInfo("Root crontab entries:");
    foreach ($rootCrontab['output'] as $line) {
        if (trim($line) && !preg_match('/^#/', $line)) {
            echo "  " . Colors::GREEN . $line . Colors::RESET . "\n";
        }
    }
}

// ============================================================================
// 3. CHECK CPANEL CRONJOBS
// ============================================================================
printSection("cPanel Cronjobs");

$cpanelPaths = [
    '/var/spool/cron/cpaneljobs',
    '/var/spool/cron/' . trim(implode("\n", $whoami['output'])),
    '/usr/local/cpanel/var/spool/cron/' . trim(implode("\n", $whoami['output'])),
    getenv('HOME') . '/cpanel_cronjobs',
];

$foundCpanelCron = false;
foreach ($cpanelPaths as $path) {
    if (checkFileExists($path)) {
        printSuccess("Found cPanel cron file: " . $path);
        $content = readFileContent($path);
        if ($content) {
            $lines = explode("\n", $content);
            foreach ($lines as $line) {
                if (trim($line) && !preg_match('/^#/', $line)) {
                    echo "  " . Colors::GREEN . trim($line) . Colors::RESET . "\n";
                    $foundCpanelCron = true;
                }
            }
        }
    }
}

if (!$foundCpanelCron) {
    printWarning("Could not find cPanel cron files in common locations");
    printInfo("Common cPanel cron locations checked:");
    foreach ($cpanelPaths as $path) {
        echo "  - " . $path . "\n";
    }
}

// ============================================================================
// 4. CHECK CRON SERVICE STATUS
// ============================================================================
printSection("Cron Service Status");

$cronStatus = executeCommand('systemctl status crond 2>/dev/null || systemctl status cron 2>/dev/null || service crond status 2>/dev/null || service cron status 2>/dev/null');
if ($cronStatus['success']) {
    printSuccess("Cron service is running");
    echo implode("\n", array_slice($cronStatus['output'], 0, 5)) . "\n";
} else {
    printWarning("Could not determine cron service status");
}

// ============================================================================
// 5. CHECK RECENT CRON EXECUTION LOGS
// ============================================================================
printSection("Recent Cron Execution Logs");

$logPaths = [
    '/var/log/cron',
    '/var/log/crond.log',
    '/var/log/cron.log',
    '/var/log/syslog',
    '/var/log/messages',
];

$foundLogs = false;
foreach ($logPaths as $logPath) {
    if (checkFileExists($logPath)) {
        printInfo("Checking: " . $logPath);
        $grepResult = executeCommand("grep -i 'cron\|CRON' " . escapeshellarg($logPath) . " | tail -20");
        if ($grepResult['success'] && !empty($grepResult['output'])) {
            $foundLogs = true;
            foreach (array_slice($grepResult['output'], -10) as $line) {
                echo "  " . $line . "\n";
            }
        }
    }
}

if (!$foundLogs) {
    printWarning("Could not find cron log files");
}

// Check user-specific cron logs
$userCronLog = getenv('HOME') . '/cron.log';
if (checkFileExists($userCronLog)) {
    printSuccess("Found user cron log: " . $userCronLog);
    $logContent = readFileContent($userCronLog);
    if ($logContent) {
        $lines = explode("\n", $logContent);
        echo "Last 10 entries:\n";
        foreach (array_slice($lines, -10) as $line) {
            if (trim($line)) {
                echo "  " . $line . "\n";
            }
        }
    }
}

// ============================================================================
// 6. CHECK RUNNING CRON PROCESSES
// ============================================================================
printSection("Running Cron Processes");

$cronProcesses = executeCommand('ps aux | grep -i "[c]ron\|[c]rond"');
if ($cronProcesses['success'] && !empty($cronProcesses['output'])) {
    printSuccess("Found cron processes:");
    foreach ($cronProcesses['output'] as $process) {
        echo "  " . $process . "\n";
    }
} else {
    printWarning("No cron processes found");
}

// ============================================================================
// 7. LARAVEL SCHEDULER CONFIGURATION
// ============================================================================
printSection("Laravel Scheduler Configuration");

$kernelPath = $laravelRoot . '/app/Console/Kernel.php';
if (checkFileExists($kernelPath)) {
    printSuccess("Found Kernel.php");
    $kernelContent = readFileContent($kernelPath);
    
    // Check for schedule method
    if (preg_match('/protected function schedule\([^)]*\)\s*\{([^}]+)\}/s', $kernelContent, $matches)) {
        printInfo("Schedule method found:");
        $scheduleCode = $matches[1];
        $scheduleLines = explode("\n", $scheduleCode);
        foreach ($scheduleLines as $line) {
            $line = trim($line);
            if ($line && !preg_match('/^\/\//', $line) && !preg_match('/^\*/', $line)) {
                echo "  " . Colors::GREEN . $line . Colors::RESET . "\n";
            }
        }
    } else {
        printWarning("No schedule() method found or it's empty");
    }
    
    // Check for commands
    if (preg_match('/protected function commands\([^)]*\)\s*\{([^}]+)\}/s', $kernelContent, $matches)) {
        printInfo("Commands registered:");
        $commandsCode = $matches[1];
        if (preg_match_all('/\$this->commands\(\[([^\]]+)\]\)/', $commandsCode, $commandMatches)) {
            foreach ($commandMatches[1] as $cmd) {
                echo "  " . Colors::GREEN . trim($cmd) . Colors::RESET . "\n";
            }
        }
    }
} else {
    printError("Kernel.php not found at: " . $kernelPath);
}

// Check for scheduled commands in routes/console.php (Laravel 11+)
$consoleRoutesPath = $laravelRoot . '/routes/console.php';
if (checkFileExists($consoleRoutesPath)) {
    printSuccess("Found console.php routes file");
    $consoleContent = readFileContent($consoleRoutesPath);
    if (preg_match_all('/Schedule::[^;]+;/', $consoleContent, $scheduleMatches)) {
        printInfo("Scheduled commands found:");
        foreach ($scheduleMatches[0] as $schedule) {
            echo "  " . Colors::GREEN . trim($schedule) . Colors::RESET . "\n";
        }
    }
}

// ============================================================================
// 8. LARAVEL QUEUE CONFIGURATION
// ============================================================================
printSection("Laravel Queue Configuration");

$configPath = $laravelRoot . '/config/queue.php';
if (checkFileExists($configPath)) {
    printSuccess("Found queue.php config");
    
    // Try to load Laravel config
    require_once $laravelRoot . '/vendor/autoload.php';
    $app = require_once $laravelRoot . '/bootstrap/app.php';
    
    try {
        $queueConnection = config('queue.default');
        $queueDriver = config('queue.connections.' . $queueConnection . '.driver');
        
        echo "Default Queue Connection: " . Colors::BOLD . ($queueConnection ?? 'not set') . Colors::RESET . "\n";
        echo "Queue Driver: " . Colors::BOLD . ($queueDriver ?? 'not set') . Colors::RESET . "\n";
        
        if ($queueDriver === 'database') {
            printInfo("Using database queue driver");
            $queueTable = config('queue.connections.database.table', 'jobs');
            echo "Queue Table: " . Colors::BOLD . $queueTable . Colors::RESET . "\n";
        } elseif ($queueDriver === 'redis') {
            printInfo("Using Redis queue driver");
        } elseif ($queueDriver === 'sqs') {
            printInfo("Using SQS queue driver");
        }
    } catch (Exception $e) {
        printWarning("Could not load Laravel config: " . $e->getMessage());
    }
} else {
    printWarning("queue.php config not found");
}

// ============================================================================
// 9. CHECK RUNNING QUEUE WORKERS
// ============================================================================
printSection("Running Queue Workers");

$queueWorkers = executeCommand('ps aux | grep -i "[q]ueue:work\|[q]ueue:listen\|artisan queue"');
if ($queueWorkers['success'] && !empty($queueWorkers['output'])) {
    printSuccess("Found queue worker processes:");
    foreach ($queueWorkers['output'] as $worker) {
        echo "  " . Colors::GREEN . $worker . Colors::RESET . "\n";
    }
} else {
    printWarning("No queue workers are currently running");
    printInfo("To start a queue worker, run: php artisan queue:work");
}

// ============================================================================
// 10. CHECK LARAVEL LOGS FOR ERRORS
// ============================================================================
printSection("Recent Laravel Log Errors");

$logPath = $laravelRoot . '/storage/logs/laravel.log';
if (checkFileExists($logPath)) {
    printInfo("Checking Laravel log file");
    $logTail = executeCommand('tail -50 ' . escapeshellarg($logPath));
    if ($logTail['success'] && !empty($logTail['output'])) {
        $errorLines = array_filter($logTail['output'], function($line) {
            return stripos($line, 'error') !== false || 
                   stripos($line, 'exception') !== false ||
                   stripos($line, 'failed') !== false;
        });
        
        if (!empty($errorLines)) {
            printWarning("Found errors in log:");
            foreach (array_slice($errorLines, -10) as $line) {
                echo "  " . Colors::RED . $line . Colors::RESET . "\n";
            }
        } else {
            printSuccess("No recent errors found in log");
        }
    }
} else {
    printWarning("Laravel log file not found");
}

// ============================================================================
// 11. CHECK ARTISAN COMMANDS
// ============================================================================
printSection("Available Artisan Commands");

$artisanList = executeCommand('cd ' . escapeshellarg($laravelRoot) . ' && php artisan list | grep -i "schedule\|queue\|cron"');
if ($artisanList['success'] && !empty($artisanList['output'])) {
    printSuccess("Found relevant artisan commands:");
    foreach ($artisanList['output'] as $cmd) {
        echo "  " . Colors::GREEN . trim($cmd) . Colors::RESET . "\n";
    }
} else {
    printWarning("Could not list artisan commands");
}

// ============================================================================
// 12. TEST SCHEDULER COMMAND
// ============================================================================
printSection("Testing Laravel Scheduler");

$scheduleTest = executeCommand('cd ' . escapeshellarg($laravelRoot) . ' && php artisan schedule:list 2>&1');
if ($scheduleTest['success']) {
    printSuccess("Scheduled tasks:");
    foreach ($scheduleTest['output'] as $line) {
        if (trim($line)) {
            echo "  " . $line . "\n";
        }
    }
} else {
    printError("Could not run schedule:list");
    if (!empty($scheduleTest['output'])) {
        foreach ($scheduleTest['output'] as $line) {
            echo "  " . Colors::RED . $line . Colors::RESET . "\n";
        }
    }
}

// ============================================================================
// 13. RECOMMENDATIONS
// ============================================================================
printSection("Recommendations & Next Steps");

echo "\n";

// Check if Laravel scheduler is in crontab
$schedulerCommand = "* * * * * cd " . $laravelRoot . " && php artisan schedule:run >> /dev/null 2>&1";
$hasScheduler = false;
if ($crontabList['success']) {
    foreach ($crontabList['output'] as $line) {
        if (strpos($line, 'schedule:run') !== false) {
            $hasScheduler = true;
            printSuccess("Laravel scheduler found in crontab");
            break;
        }
    }
}

if (!$hasScheduler) {
    printWarning("Laravel scheduler not found in crontab!");
    echo "\n";
    printInfo("Add this to your crontab:");
    echo Colors::BOLD . Colors::GREEN . $schedulerCommand . Colors::RESET . "\n";
    echo "\n";
    printInfo("To add it, run:");
    echo Colors::BOLD . "crontab -e" . Colors::RESET . "\n";
    echo "Then paste the line above.\n";
}

// Check queue workers
if (empty($queueWorkers['output'])) {
    printWarning("No queue workers are running!");
    echo "\n";
    printInfo("To start a queue worker, run:");
    echo Colors::BOLD . "php artisan queue:work" . Colors::RESET . "\n";
    echo "\n";
    printInfo("To run it in the background:");
    echo Colors::BOLD . "nohup php artisan queue:work > /dev/null 2>&1 &" . Colors::RESET . "\n";
    echo "\n";
    printInfo("Or add to crontab to restart on reboot:");
    echo Colors::BOLD . "@reboot cd " . $laravelRoot . " && php artisan queue:work >> storage/logs/queue.log 2>&1" . Colors::RESET . "\n";
}

// Check cron service
if (!$cronStatus['success']) {
    printError("Cron service might not be running!");
    echo "\n";
    printInfo("Check cron service status:");
    echo Colors::BOLD . "systemctl status cron" . Colors::RESET . " (systemd)\n";
    echo Colors::BOLD . "service cron status" . Colors::RESET . " (init.d)\n";
}

echo "\n";
printInfo("For cPanel cronjobs:");
echo "1. Go to cPanel → Cron Jobs\n";
echo "2. Check if your cronjob command is correct\n";
echo "3. Make sure the path to PHP is correct (use: " . Colors::BOLD . "which php" . Colors::RESET . ")\n";
echo "4. Make sure the path to your project is absolute\n";
echo "5. Check cPanel error logs in: " . Colors::BOLD . getenv('HOME') . "/logs/" . Colors::RESET . "\n";

echo "\n";
printHeader("Diagnostic Complete");

echo Colors::BOLD . "Summary:" . Colors::RESET . "\n";
echo "- System crontab: " . ($crontabList['success'] && !empty($crontabList['output']) ? Colors::GREEN . "Found" : Colors::YELLOW . "Empty/Not found") . Colors::RESET . "\n";
echo "- Laravel scheduler in crontab: " . ($hasScheduler ? Colors::GREEN . "Yes" : Colors::RED . "No") . Colors::RESET . "\n";
echo "- Queue workers running: " . (!empty($queueWorkers['output']) ? Colors::GREEN . "Yes" : Colors::YELLOW . "No") . Colors::RESET . "\n";
echo "- Cron service: " . ($cronStatus['success'] ? Colors::GREEN . "Running" : Colors::YELLOW . "Unknown") . Colors::RESET . "\n";

echo "\n";

