/**
 * Resolves product image URLs from Supabase storage, local public assets, or external CDNs.
 */
export function resolveImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') {
    return 'https://placehold.co/600x600/png?text=Product+Image';
  }

  const trimmed = url.trim();

  // Already a full HTTP/HTTPS URL or inline Data URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Local absolute path like /products/foo.jpg or /assets/...
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // Storage relative path or filename in product-images bucket
  const cleanPath = trimmed.replace(/^\/+/, '');
  if (cleanPath.startsWith('product-images/')) {
    return `https://ijpbacailliwtthsjuqs.supabase.co/storage/v1/object/public/${cleanPath}`;
  }

  return `https://ijpbacailliwtthsjuqs.supabase.co/storage/v1/object/public/product-images/${cleanPath}`;
}
