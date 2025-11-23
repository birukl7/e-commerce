# Fix: Payment Proof Images Not Displaying on cPanel

## Problem
Payment proof images (and other uploaded files) appear as dark/blank on the admin dashboard. This happens because the storage symlink hasn't been created on your cPanel server.

## What's Happening

- Files are uploaded to: `storage/app/public/payment-proofs/`
- Frontend tries to access them at: `/storage/payment-proofs/...`
- Without the symlink, the browser can't find the files → shows broken/dark images

## Solution: Create Storage Symlink on cPanel

### Option 1: Using cPanel Terminal (Recommended)

1. **Access cPanel Terminal**
   - Log into cPanel
   - Go to **Terminal** (under Advanced section)
   - Or use SSH if you have access

2. **Navigate to your project directory**
   ```bash
   cd ~/e-commerce.biruklemma.com/biruklir
   # Or your actual project path
   ```

3. **Run the storage link command**
   ```bash
   /opt/alt/php83/usr/bin/php artisan storage:link
   ```
   (Replace `php83` with your PHP version if different)

4. **Verify the symlink was created**
   ```bash
   ls -la public/storage
   ```
   Should show something like:
   ```
   lrwxrwxrwx 1 username username 34 Nov 25 10:00 public/storage -> /home/username/.../storage/app/public
   ```

### Option 2: Using cPanel File Manager

1. **Go to cPanel → File Manager**
2. **Navigate to your project's `public` folder**
   - Usually: `public_html` or `domains/yourdomain.com/public_html`
   - Then go to `public` subdirectory
3. **Check if `storage` folder exists**
   - If it exists and is a regular folder, delete it first
   - If it's already a symlink, you're good!
4. **Create the symlink manually:**
   - In File Manager, you might need to use Terminal for this
   - Or use the "Create Symbolic Link" option if available

### Option 3: Manual Symlink Creation via Terminal

If `php artisan storage:link` doesn't work, create it manually:

```bash
cd ~/e-commerce.biruklemma.com/biruklir/public
ln -s ../storage/app/public storage
```

Or with full absolute path:
```bash
cd ~/e-commerce.biruklemma.com/biruklir/public
ln -s /home/username/e-commerce.biruklemma.com/biruklir/storage/app/public storage
```

### Option 4: Using cPanel Cron Job (One-time)

If you can't access Terminal, create a one-time cron job:

1. **Go to cPanel → Cron Jobs**
2. **Add New Cron Job:**
   - **Minute:** `*`
   - **Hour:** `*`
   - **Day:** `*`
   - **Month:** `*`
   - **Weekday:** `*`
   - **Command:**
     ```bash
     cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan storage:link
     ```
3. **Save** and wait a minute
4. **Delete the cron job** after it runs (it's a one-time fix)

## Verify the Fix

### Method 1: Check via Terminal
```bash
cd ~/e-commerce.biruklemma.com/biruklir
ls -la public/storage
```

Should show a symlink pointing to `storage/app/public`

### Method 2: Check via File Manager
- Go to `public` folder in File Manager
- Look for `storage` folder
- It should show as a link/symlink (not a regular folder)

### Method 3: Test in Browser
1. Upload a payment proof
2. Go to Admin Dashboard → View Payment Details
3. The payment proof image should now display correctly

### Method 4: Direct URL Test
Try accessing a payment proof image directly:
```
https://yourdomain.com/storage/payment-proofs/filename.jpg
```

If you get a 404 or the image doesn't load, the symlink isn't working.

## Troubleshooting

### Issue: "The link already exists"
**Solution:**
```bash
cd ~/e-commerce.biruklemma.com/biruklir/public
rm storage  # Remove the existing link/folder
/opt/alt/php83/usr/bin/php artisan storage:link  # Create new symlink
```

### Issue: "Permission denied"
**Solution:**
```bash
cd ~/e-commerce.biruklemma.com/biruklir
chmod -R 755 storage/app/public
chmod -R 755 public
```

### Issue: Symlink exists but images still don't load
**Check:**
1. **File permissions:**
   ```bash
   ls -la storage/app/public/payment-proofs
   ```
   Files should be readable (644 permissions)

2. **Symlink target:**
   ```bash
   readlink public/storage
   ```
   Should point to the correct path

3. **Web server can follow symlinks:**
   - Check if your `.htaccess` allows symlinks (usually it does by default)
   - Some hosts disable symlinks for security

### Issue: Images work locally but not on cPanel
- **Local:** Symlink might already exist
- **cPanel:** Symlink needs to be created (this guide)

## What Gets Fixed

After creating the symlink, these will work:
- ✅ Payment proof images
- ✅ Product images
- ✅ Category images
- ✅ Brand images
- ✅ Product request images
- ✅ Profile images
- ✅ Any file stored in `storage/app/public/`

## Storage Structure

```
your-project/
├── storage/
│   └── app/
│       └── public/
│           ├── payment-proofs/     ← Files stored here
│           ├── products/
│           ├── categories/
│           └── ...
└── public/
    └── storage -> ../storage/app/public  ← Symlink points here
```

When you access `/storage/payment-proofs/file.jpg`, it resolves to `storage/app/public/payment-proofs/file.jpg`

## Notes

- The symlink is a one-time setup per deployment
- If you redeploy/restore from backup, you may need to recreate it
- Some deployment scripts automatically create the symlink
- The symlink persists across code updates (it's in the `public` folder, not version controlled)

## Quick Reference Commands

```bash
# Create symlink
php artisan storage:link

# Check if symlink exists
ls -la public/storage

# Remove and recreate symlink
rm public/storage && php artisan storage:link

# Check symlink target
readlink public/storage

# List files in storage
ls -la storage/app/public/payment-proofs
```

