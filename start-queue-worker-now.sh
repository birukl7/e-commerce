#!/bin/bash

# Quick script to start queue worker on cPanel
# Run: bash start-queue-worker-now.sh

cd ~/e-commerce.biruklemma.com/biruklir

# Check if worker is already running
if pgrep -f 'queue:work.*emails' > /dev/null; then
    echo "Queue worker is already running!"
    ps aux | grep "queue:work" | grep -v grep
    exit 0
fi

# Start the worker
echo "Starting queue worker..."
/opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &

# Wait a moment
sleep 2

# Verify it started
if pgrep -f 'queue:work.*emails' > /dev/null; then
    echo "✓ Queue worker started successfully!"
    ps aux | grep "queue:work" | grep -v grep
    echo ""
    echo "It will process your 2 pending jobs now."
else
    echo "❌ Failed to start queue worker"
    echo "Check logs: tail -n 50 storage/logs/queue-worker.log"
fi

