# E2E Testing Troubleshooting Guide

## Common Issues and Solutions

### Issue: Test API Routes Return 404

**Symptoms:**
- Tests fail with "Failed to create test customer: 404 Not Found"
- Routes like `/api/test/users/customer` return 404

**Solutions:**

1. **Check Environment Variable**
   ```bash
   # Make sure APP_ENV is set to testing
   echo $APP_ENV
   # Should output: testing
   ```

2. **Verify Routes are Registered**
   ```bash
   # Check if routes are loaded
   php artisan route:list | grep "api/test"
   ```

3. **Test Route Manually**
   ```bash
   # Start server with testing environment
   APP_ENV=testing php artisan serve
   
   # In another terminal, test the route
   curl -X POST http://localhost:8000/api/test/users/customer
   ```

4. **Check Route Registration**
   - Ensure `routes/test-api.php` is included in `routes/web.php`
   - Verify the environment check: `app()->environment(['testing', 'local'])`

5. **Alternative: Use Local Environment**
   - The routes are now available in both `testing` and `local` environments
   - You can test with: `php artisan serve` (local environment)

### Issue: Database Connection Errors

**Symptoms:**
- Tests fail with database connection errors
- "SQLSTATE[HY000] [2002] Connection refused"

**Solutions:**

1. **Check .env.testing File**
   ```bash
   # Make sure .env.testing exists and has correct DB settings
   cat .env.testing | grep DB_
   ```

2. **Run Migrations**
   ```bash
   php artisan migrate --env=testing
   ```

3. **Seed Database**
   ```bash
   php artisan db:seed --env=testing --class=RoleAndPermissionSeeder
   ```

### Issue: User Factory Methods Not Found

**Symptoms:**
- "Call to undefined method customer()" or "admin()"

**Solutions:**

1. **Check UserFactory**
   - Ensure `database/factories/UserFactory.php` has `customer()` and `admin()` methods
   - Clear cache: `php artisan cache:clear`

2. **Verify Roles Exist**
   ```bash
   php artisan tinker --env=testing
   >>> \Spatie\Permission\Models\Role::all();
   ```

### Issue: Playwright Can't Start Server

**Symptoms:**
- Tests timeout waiting for server
- "Error: connect ECONNREFUSED"

**Solutions:**

1. **Check Port Availability**
   ```bash
   # Make sure port 8000 is available
   lsof -i :8000
   ```

2. **Manual Server Start**
   ```bash
   # Start server manually
   APP_ENV=testing php artisan serve
   
   # Then run tests without webServer in playwright.config.ts
   ```

3. **Increase Timeout**
   - In `playwright.config.ts`, increase `webServer.timeout`

### Issue: Authentication Fails

**Symptoms:**
- Login tests fail
- "Failed to login"

**Solutions:**

1. **Check Login Route**
   - Verify login route exists: `php artisan route:list | grep login`

2. **Verify User Creation**
   ```bash
   # Test user creation manually
   curl -X POST http://localhost:8000/api/test/users/customer
   ```

3. **Check Selectors**
   - Verify login form selectors match your actual form
   - Use Playwright's codegen: `npx playwright codegen http://localhost:8000/login`

## Debugging Tips

### 1. Enable Verbose Output
```bash
# Run tests with debug output
DEBUG=pw:api npm run test:e2e
```

### 2. Use UI Mode
```bash
# Run tests in interactive UI
npm run test:e2e:ui
```

### 3. Check Screenshots
- Failed tests automatically capture screenshots
- Check `test-results/` directory

### 4. View Test Report
```bash
# Open HTML report
npm run test:e2e:report
```

### 5. Test Routes Manually
```bash
# Health check
curl http://localhost:8000/api/test/health

# Create customer
curl -X POST http://localhost:8000/api/test/users/customer

# Create admin
curl -X POST http://localhost:8000/api/test/users/admin
```

## Environment Setup Checklist

- [ ] `.env.testing` file exists
- [ ] Database configured in `.env.testing`
- [ ] Migrations run: `php artisan migrate --env=testing`
- [ ] Roles seeded: `php artisan db:seed --class=RoleAndPermissionSeeder --env=testing`
- [ ] Test API routes accessible: `curl http://localhost:8000/api/test/health`
- [ ] Playwright browsers installed: `npx playwright install chromium`

## Getting Help

1. Check Laravel logs: `storage/logs/laravel.log`
2. Check Playwright trace: Open trace viewer after test failure
3. Review test screenshots in `test-results/`
4. Check comprehensive plan: `docs/E2E_TESTING_PLAN.md`

