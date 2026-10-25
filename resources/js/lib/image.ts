export function getImageUrl(rawPath?: string | null, options?: { bucket?: string; placeholderText?: string; width?: number; height?: number }) {
  const path = (rawPath || '').toString().trim();

  const placeholderFallback = '/image/placeholder.png';

  if (!path || path.includes('placeholder.svg')) {
    return placeholderFallback;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    if (path.includes('/image/image/')) {
      return path.replace('/image/image/', '/image/');
    }
    return path;
  }

  if (path.startsWith('/storage/')) {
    return path;
  }

  if (path.startsWith('storage/')) {
    return `/${path}`;
  }

  // Allow serving built-in public assets under /image/
  if (path.startsWith('/image/') || path.startsWith('image/')) {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return normalized.replace('/image/image/', '/image/');
  }

  // If a bucket is provided, assume filename or relative path under that bucket
  // Storage paths should use /storage/ not /image/
  if (options?.bucket) {
    // Check if path already includes the bucket name
    if (path.startsWith(`${options.bucket}/`)) {
      return `/storage/${path}`;
    }
    return `/storage/${options.bucket}/${path}`;
  }

  // Check if path looks like a storage path (products/, categories/, brands/, etc.)
  const storageBuckets = ['products', 'categories', 'brands', 'payment-proofs', 'product-requests', 'offline-payments', 'profile-images'];
  const isStoragePath = storageBuckets.some(bucket => path.startsWith(`${bucket}/`));
  
  if (isStoragePath) {
    return `/storage/${path}`;
  }

  // Default: assume this is already a storage-relative path like categories/foo.jpg
  return `/storage/${path}`;
}


