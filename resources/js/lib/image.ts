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
  if (options?.bucket) {
    return `/image/${options.bucket}/${path}`;
  }

  // Default: assume this is already a storage-relative path like categories/foo.jpg
  return `/image/${path}`;
}


