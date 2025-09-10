#!/bin/bash

if [ -f "storage/app/queue-worker.pid" ]; then
    kill -9 $(cat storage/app/queue-worker.pid)
    rm storage/app/queue-worker.pid
    echo "Queue worker stopped"
else
    echo "No queue worker is currently running"
fi
