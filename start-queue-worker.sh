#!/bin/bash

# Start the queue worker
nohup php artisan queue:work --sleep=3 --tries=3 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
echo $! > storage/app/queue-worker.pid
echo "Queue worker started with PID $(cat storage/app/queue-worker.pid)"
