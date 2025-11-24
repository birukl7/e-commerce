# Quick Commands Reference

## Always Start Here

```bash
cd ~/e-commerce.biruklemma.com/biruklir
```

Then run your commands.

## Common Commands

### Check Worker Status
```bash
cd ~/e-commerce.biruklemma.com/biruklir
ps aux | grep "queue:work" | grep -v grep
```

### Check Manager Logs
```bash
cd ~/e-commerce.biruklemma.com/biruklir
tail -n 20 storage/logs/queue-manager.log
```

### Check Worker Logs
```bash
cd ~/e-commerce.biruklemma.com/biruklir
tail -n 20 storage/logs/queue-worker.log
```

### Run Diagnostic
```bash
cd ~/e-commerce.biruklemma.com/biruklir
bash diagnose-queue-manager.sh
```

### Check Pending Jobs
```bash
cd ~/e-commerce.biruklemma.com/biruklir
php artisan tinker --execute="echo 'Pending: ' . DB::table('jobs')->count() . PHP_EOL;"
```

### Start Worker Manually (if needed)
```bash
cd ~/e-commerce.biruklemma.com/biruklir
php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 >> storage/logs/queue-worker.log 2>&1 &
```

### Kill All Workers (cleanup)
```bash
pkill -f 'queue:work'
```

