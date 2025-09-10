#!/bin/bash

# Stop any existing queue workers
echo "Stopping any existing queue workers..."
pkill -f 'queue:work' || true

# Clear the cache
echo "Clearing cache..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Create storage directories if they don't exist
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/framework/cache/data

# Set proper permissions
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/

# Start the queue worker
echo "Starting queue worker..."
nohup php artisan queue:work \
    --queue=emails,default \
    --sleep=3 \
    --tries=1 \
    --timeout=300 \
    --verbose \
    >> storage/logs/queue-worker.log 2>&1 &
