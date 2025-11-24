<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckQueueWorker extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'queue:check 
                            {--detailed : Show detailed information}
                            {--test-email : Test sending an email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check if queue worker and cron jobs are running properly';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== Queue Worker & Cron Job Health Check ===');
        $this->newLine();

        // 1. Check queue worker process
        $this->checkQueueWorker();

        // 2. Check cron job
        $this->checkCronJob();

        // 3. Check pending jobs
        $this->checkPendingJobs();

        // 4. Check failed jobs
        $this->checkFailedJobs();

        // 5. Check queue worker logs
        $this->checkQueueWorkerLogs();

        // 6. Check email configuration
        if ($this->option('detailed')) {
            $this->checkEmailConfig();
        }

        // 7. Test email if requested
        if ($this->option('test-email')) {
            $this->testEmail();
        }

        $this->newLine();
        $this->info('=== Check Complete ===');
    }

    protected function checkQueueWorker()
    {
        $this->info('1. Queue Worker Status:');
        
        exec('ps aux | grep "queue:work" | grep -v grep', $workerProcesses);
        
        if (empty($workerProcesses)) {
            $this->error('   ❌ Queue worker is NOT running!');
            $this->warn('   → Start with: php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &');
        } else {
            $this->info('   ✓ Queue worker is running');
            
            foreach ($workerProcesses as $process) {
                // Extract PID and runtime
                if (preg_match('/(\d+)\s+.*?(\d+:\d+)/', $process, $matches)) {
                    $pid = $matches[1];
                    $runtime = $matches[2];
                    $this->line("   PID: {$pid}, Runtime: {$runtime}");
                }
                
                // Check if processing correct queues
                if (strpos($process, '--queue=emails,default') !== false || 
                    strpos($process, '--queue=default,emails') !== false) {
                    $this->info('   ✓ Processing emails and default queues');
                } else {
                    $this->warn('   ⚠️  May not be processing emails queue');
                }
                
                if ($this->option('detailed')) {
                    $this->line('   ' . substr($process, 0, 120));
                }
            }
        }
        
        $this->newLine();
    }

    protected function checkCronJob()
    {
        $this->info('2. Cron Job Configuration:');
        
        exec('crontab -l 2>/dev/null', $crontab);
        
        if (empty($crontab)) {
            $this->error('   ❌ No cron jobs found!');
            $this->warn('   → Set up cron job in cPanel');
        } else {
            $queueWorkerCron = false;
            foreach ($crontab as $line) {
                if (stripos($line, 'queue:work') !== false) {
                    $queueWorkerCron = true;
                    $this->info('   ✓ Found queue worker cron job');
                    
                    if ($this->option('detailed')) {
                        $this->line('   ' . trim($line));
                    }
                    
                    // Check for common issues
                    if (stripos($line, '--stop-when-empty') !== false) {
                        $this->warn('   ⚠️  Uses --stop-when-empty (worker will stop after processing)');
                    }
                    if (stripos($line, 'pgrep') === false && stripos($line, 'queue:work') !== false) {
                        $this->warn('   ⚠️  No check for existing worker (may start multiple workers)');
                    }
                    if (stripos($line, '--max-time') === false) {
                        $this->warn('   ⚠️  No --max-time specified');
                    }
                }
            }
            
            if (!$queueWorkerCron) {
                $this->error('   ❌ No queue worker cron job found!');
                $this->warn('   → Add cron job in cPanel');
            }
        }
        
        $this->newLine();
    }

    protected function checkPendingJobs()
    {
        $this->info('3. Pending Jobs:');
        
        try {
            $pendingCount = DB::table('jobs')->count();
            $this->line("   Total pending: {$pendingCount}");
            
            if ($pendingCount > 0) {
                // Check if worker is running
                exec('ps aux | grep "queue:work" | grep -v grep', $workerProcesses);
                
                if (empty($workerProcesses)) {
                    $this->error('   ❌ CRITICAL: Jobs are pending but worker is not running!');
                } else {
                    $this->warn('   ⚠️  Jobs are pending (worker should process them)');
                    
                    if ($this->option('detailed')) {
                        $jobs = DB::table('jobs')
                            ->select('queue', DB::raw('count(*) as count'))
                            ->groupBy('queue')
                            ->get();
                        
                        foreach ($jobs as $job) {
                            $this->line("   Queue '{$job->queue}': {$job->count} jobs");
                        }
                    }
                }
            } else {
                $this->info('   ✓ No pending jobs');
            }
        } catch (\Exception $e) {
            $this->error('   ❌ Error checking jobs: ' . $e->getMessage());
        }
        
        $this->newLine();
    }

    protected function checkFailedJobs()
    {
        $this->info('4. Failed Jobs:');
        
        try {
            $failedCount = DB::table('failed_jobs')->count();
            $this->line("   Total failed: {$failedCount}");
            
            if ($failedCount > 0) {
                $this->warn('   ⚠️  There are failed jobs');
                $this->line('   → View with: php artisan queue:failed');
                $this->line('   → Retry with: php artisan queue:retry all');
                
                if ($this->option('detailed')) {
                    $recentFailed = DB::table('failed_jobs')
                        ->orderBy('failed_at', 'desc')
                        ->limit(5)
                        ->get(['id', 'queue', 'failed_at']);
                    
                    $this->line('   Recent failures:');
                    foreach ($recentFailed as $failed) {
                        $this->line("   - ID: {$failed->id}, Queue: {$failed->queue}, Failed: {$failed->failed_at}");
                    }
                }
            } else {
                $this->info('   ✓ No failed jobs');
            }
        } catch (\Exception $e) {
            $this->error('   ❌ Error checking failed jobs: ' . $e->getMessage());
        }
        
        $this->newLine();
    }

    protected function checkQueueWorkerLogs()
    {
        $this->info('5. Queue Worker Log Activity:');
        
        $logFile = storage_path('logs/queue-worker.log');
        
        if (!file_exists($logFile)) {
            $this->warn('   ⚠️  Log file not found: ' . $logFile);
            $this->warn('   → This suggests the worker hasn\'t run recently');
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
                $this->info('   ✓ Recent activity found (last 10 minutes)');
            } else {
                $this->warn('   ⚠️  No recent activity (last entry may be old)');
            }
            
            if ($this->option('detailed')) {
                $this->line('   Last 5 lines:');
                foreach (array_slice($lastLines, -5) as $line) {
                    $this->line('   ' . trim($line));
                }
            }
        }
        
        $this->newLine();
    }

    protected function checkEmailConfig()
    {
        $this->info('6. Email Configuration:');
        
        $mailDriver = config('mail.default');
        $mailHost = config('mail.mailers.smtp.host');
        $mailPort = config('mail.mailers.smtp.port');
        $mailFrom = config('mail.from.address');
        
        $this->line("   Driver: {$mailDriver}");
        $this->line("   Host: {$mailHost}");
        $this->line("   Port: {$mailPort}");
        $this->line("   From: {$mailFrom}");
        
        if ($mailDriver === 'smtp' && $mailHost) {
            $this->info('   ✓ SMTP configured');
        } else {
            $this->warn('   ⚠️  SMTP may not be properly configured');
        }
        
        $this->newLine();
    }

    protected function testEmail()
    {
        $this->info('7. Testing Email Sending:');
        
        try {
            $user = \App\Models\User::first();
            
            if (!$user) {
                $this->error('   ❌ No users found to test email');
                return;
            }
            
            $this->line("   Sending test email to: {$user->email}");
            
            \Illuminate\Support\Facades\Mail::raw(
                'This is a test email from the queue worker health check.',
                function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Queue Worker Health Check - Test Email');
                }
            );
            
            $this->info('   ✓ Test email sent successfully');
            $this->line('   → Check inbox/spam folder');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed to send test email: ' . $e->getMessage());
        }
        
        $this->newLine();
    }
}

