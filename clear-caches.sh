#!/usr/bin/env bash
set -euo pipefail

# Run from the project root
cd "$(dirname "$0")"

php artisan optimize:clear
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "Caches cleared."

