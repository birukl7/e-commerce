### Context: Image asset unification (frontend + backend)

- Implemented a shared helper `resources/js/lib/image.ts` providing `getImageUrl(rawPath, { bucket, placeholderText, width, height })` to normalize all image URLs.
- Refactored the following components to use the helper:
  - `resources/js/components/category/product-card.tsx`
  - `resources/js/components/ui/drop-down-menu.tsx`
  - `resources/js/components/homepage/gift-showcase.tsx`
- Goal: serve images from `/storage/<bucket>/<filename>` consistently. Buckets planned:
  - categories → `storage/categories/...`
  - products → `storage/products/...`
  - payment-proofs → `storage/payment-proofs/...`
  - other existing: brands (`storage/brands/...`), profile-images, product-requests.

### Current status

- Frontend helper added and used in key UI where mismatches existed.
- Some components still directly reference `/storage/...` or `/image/...` and should be updated to the helper over time (e.g., deals carousel, admin previews, wishlist listings, checkout summaries, etc.).
- Backend currently returns mixed paths: some endpoints emit `asset('image/...')` while uploads store to `public` disk (e.g., `categories`, `products`).

### Next steps

1) Backend responses: standardize URL generation
   - Update controllers to return storage-based paths or plain storage-relative paths the frontend can pass to `getImageUrl`:
     - `app/Http/Controllers/CategoryController.php` → replace `asset('/image/...')` with path only (e.g., `categories/<file>`) or `asset('/storage/<path>')`.
     - `app/Http/Controllers/Api/CategoryController.php` → stop prefixing with `asset('image/...')`; return storage-relative `categories/<file>`.
     - Product image transformations (controllers returning primary image) → use `products/<file>` rather than `asset()` or `/image/`.

2) Upload destinations: ensure buckets
   - Confirm/keep:
     - Categories: `store('categories', 'public')` (already correct)
     - Products: `store('products', 'public')` (already correct)
     - Payment proofs: converge to `store('payment-proofs', 'public')` (some places use `offline-payments`)
     - Product requests: `store('product-requests', 'public')` (already used)

3) Frontend sweep: replace manual `/storage` and `/image` usages
   - Files with direct `src={`/storage/...` or building `/image/...` identified via grep should use `getImageUrl()` with the correct bucket.
   - Priority targets:
     - `resources/js/components/homepage/deals-carousel.tsx`
     - `resources/js/pages/admin/payment/show.tsx` (proof preview)
     - `resources/js/pages/admin/product/index.tsx`, `show.tsx`
     - `resources/js/pages/user/*` listings (orders, dashboard, wishlist)
     - Any component assembling product/category images.

4) Storage symlink
   - Ensure `php artisan storage:link` is present in deployment and `public/storage` points to `storage/app/public`.

### Notes

- The helper is resilient to full URLs and already-prefixed `/storage/...` or `/image/...` paths.
- Prefer returning storage-relative paths from the API and delegating final URL construction to the client to keep flexibility.


