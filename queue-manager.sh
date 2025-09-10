#!/bin/bash

# Stop any existing queue workers
pkill -f 'queue:work.*emails,default'

# Start a new queue worker
nohup php artisan queue:work --queue=emails,default --sleep=3 --tries=3 --timeout=120 > storage/logs/queue-worker.log 2>&1 &
echo $! > storage/app/queue-worker.pid
echo "Queue worker started with PID $(cat storage/app/queue-worker.pid)"
