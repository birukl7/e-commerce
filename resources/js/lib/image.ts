export function getImageUrl(rawPath?: string | null, options?: { bucket?: string; placeholderText?: string; width?: number; height?: number }) {
  const path = (rawPath || '').toString().trim();

  if (!path) {
    const text = options?.placeholderText || 'Image';
    const w = options?.width || 300;
    const h = options?.height || 300;
    return `/placeholder.svg?height=${h}&width=${w}&text=${encodeURIComponent(text)}`;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
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
    return path.startsWith('/') ? path : `/${path}`;
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


