# Queue Worker Start Guide

## Problem
Queue worker stopped running, causing jobs to accumulate in the database.

## Solution: Start the Queue Worker

### Step 1: Start the Worker
```bash
cd ~/e-commerce.biruklemma.com/biruklir
php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

### Step 2: Verify It's Running
```bash
ps aux | grep "queue:work" | grep -v grep
```

You should see a process like:
```
biruklir  XXXXX  0.0  0.0  160300  63232 pts/0  S   HH:MM  0:00 /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default ...
```

### Step 3: Watch It Process Jobs
```bash
tail -f storage/logs/queue-worker.log
```

You should see:
```
INFO  Processing jobs from the [emails,default] queues.
INFO  Processing: App\Listeners\SendOrderNotifications
INFO  Processing: App\Jobs\SendOrderConfirmationEmail
```

### Step 4: Verify Jobs Are Being Processed
```bash
# In another terminal, check pending jobs count
php artisan tinker --execute="echo 'Pending: ' . DB::table('jobs')->count() . PHP_EOL;"
```

The count should decrease as jobs are processed.

## Ensure Cron Job is Running

The cron job should automatically restart the worker if it stops. Verify it's configured:

```bash
crontab -l
```

Should show:
```
* * * * * sleep $((RANDOM % 60)) && cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
```

## Troubleshooting

### Worker Stops Immediately
- Check PHP version: `php -v`
- Check for syntax errors: `php artisan queue:work --once`
- Check logs: `tail -n 50 storage/logs/laravel.log`

### Jobs Not Processing
- Verify queue name matches: `--queue=emails,default`
- Check job queue: `php artisan tinker --execute="DB::table('jobs')->select('queue')->distinct()->get();"`
- Restart worker: `php artisan queue:restart`

### Worker Keeps Dying
- Check `--max-time` value (should be 3600 seconds = 1 hour)
- Check system resources: `free -h` and `df -h`
- Consider running multiple workers for redundancy

## Monitoring

### Check Worker Status
```bash
ps aux | grep "queue:work" | grep -v grep | wc -l
```
Should return `1` or more (if multiple workers are running).

### Check Pending Jobs
```bash
php artisan tinker --execute="echo 'Pending: ' . DB::table('jobs')->count() . PHP_EOL;"
```

### Check Failed Jobs
```bash
php artisan queue:failed
```

### Watch Logs in Real-Time
```bash
tail -f storage/logs/queue-worker.log
```

## Expected Behavior

After starting the worker:
1. Pending jobs should start processing immediately
2. Logs should show job processing activity
3. Job count should decrease
4. Emails should be sent

## Next Steps

1. ✅ Start the queue worker (command above)
2. ✅ Verify it's running (`ps aux | grep "queue:work"`)
3. ✅ Watch logs (`tail -f storage/logs/queue-worker.log`)
4. ✅ Verify jobs are processing (check pending count)
5. ✅ Test by creating a new order/payment

