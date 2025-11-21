# Email Verification 403 "Invalid Signature" Fix

## Problem
When clicking the email verification link, users see a 403 "Forbidden" error with "Invalid signature" message.

## Root Causes

1. **APP_KEY Mismatch** - The APP_KEY used to generate the email link is different from the one validating it
2. **APP_URL Mismatch** - The APP_URL doesn't match the actual domain
3. **Route Configuration** - The route requires authentication before signature validation

## Solution Applied

### 1. Route Configuration Fix ✅
The verification route has been moved outside the `auth` middleware group. This allows the signature to be validated first, and `EmailVerificationRequest` will automatically authenticate the user if the signature is valid.

**Before:**
```php
Route::middleware('auth')->group(function () {
    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
});
```

**After:**
```php
// Email verification route - must be outside 'auth' middleware
Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');
```

### 2. Diagnostic Script
A diagnostic script has been created to help identify the issue:
- `diagnose-email-verification.php`

## Steps to Fix on cPanel

### Step 1: Run Diagnostic Script
```bash
cd ~/e-commerce.biruklemma.com/biruklir
php diagnose-email-verification.php
```

This will check:
- APP_KEY configuration
- APP_URL configuration
- Signature generation
- URL expiration
- Signature validation

### Step 2: Check Environment Variables
```bash
# Check APP_KEY
grep APP_KEY .env

# Check APP_URL
grep APP_URL .env
```

**Expected values:**
- `APP_URL=https://e-commerce.biruklemma.com`
- `APP_KEY=base64:...` (should be a long base64 string)

### Step 3: Verify APP_KEY Consistency
The APP_KEY must be the same on:
- The server where the email was generated
- The server where the link is being validated

**If APP_KEY changed:**
- All existing verification links will be invalid
- Users need to request new verification emails
- Or use the "Resend Verification Email" feature

### Step 4: Verify APP_URL
The APP_URL must match the actual domain:
```bash
# Should be:
APP_URL=https://e-commerce.biruklemma.com
```

**If APP_URL is wrong:**
1. Update `.env` file:
   ```bash
   APP_URL=https://e-commerce.biruklemma.com
   ```
2. Clear config cache:
   ```bash
   php artisan config:clear
   ```

### Step 5: Test the Fix
1. Deploy the updated route configuration
2. Request a new verification email
3. Click the verification link
4. It should work now

## Common Issues

### Issue: APP_KEY Changed
**Symptom:** All verification links fail with 403

**Solution:**
1. If you intentionally changed APP_KEY, users need new verification emails
2. If APP_KEY changed accidentally, restore the original key
3. Or generate a new key and have all users request new verification emails

### Issue: APP_URL Mismatch
**Symptom:** Links work but redirect to wrong domain

**Solution:**
1. Update `.env` with correct APP_URL
2. Run `php artisan config:clear`
3. Request new verification email

### Issue: URL Expired
**Symptom:** Link worked before but now shows 403

**Solution:**
- Verification links expire after a certain time (default: 60 minutes)
- User needs to request a new verification email

### Issue: Email Client Modified URL
**Symptom:** Link works in some email clients but not others

**Solution:**
- Some email clients add tracking parameters that break signatures
- User should copy the link directly or use a different email client

## Testing

### Test 1: Generate New Verification Link
```bash
php artisan tinker
```

```php
$user = App\Models\User::find(30); // Replace with actual user ID
$url = URL::temporarySignedRoute(
    'verification.verify',
    now()->addMinutes(60),
    ['id' => $user->id, 'hash' => sha1($user->email)]
);
echo $url;
```

Copy the URL and test it in a browser.

### Test 2: Check Route Registration
```bash
php artisan route:list | grep verification.verify
```

Should show:
```
GET|HEAD  verify-email/{id}/{hash} ............ verification.verify
```

### Test 3: Check Middleware
The route should have:
- `signed` middleware (validates signature)
- `throttle:6,1` middleware (rate limiting)
- **NOT** `auth` middleware (EmailVerificationRequest handles auth)

## Prevention

1. **Never change APP_KEY in production** without a migration plan
2. **Keep APP_URL consistent** across environments
3. **Monitor signature validation errors** in logs
4. **Test email verification** after deployments

## Logs

Check Laravel logs for signature validation errors:
```bash
tail -f storage/logs/laravel.log | grep -i "signature\|verification"
```

## Related Files

- `routes/auth.php` - Route configuration
- `app/Http/Controllers/Auth/VerifyEmailController.php` - Controller
- `app/Notifications/CustomVerifyEmail.php` - Email notification
- `diagnose-email-verification.php` - Diagnostic script

