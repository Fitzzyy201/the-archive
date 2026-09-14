const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80";

/**
 * Normalizes product image URL from database / upload response.
 * Handles:
 * - full URLs (http://, https://, data:image)
 * - relative paths starting with /uploads/ or uploads/
 * - raw filenames (e.g. 1789362032044-972199463.jpeg)
 * - null / undefined / empty string
 */
export function getProductImageUrl(fotoProduk?: string | null): string {
  if (!fotoProduk || typeof fotoProduk !== "string" || !fotoProduk.trim()) {
    return FALLBACK_PRODUCT_IMAGE;
  }

  const trimmed = fotoProduk.trim();

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  // Clean duplicate slashes and remove existing prefix if any
  let cleanPath = trimmed.replace(/\\/g, "/");

  // Remove leading slashes
  while (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.slice(1);
  }

  // If path starts with uploads/, clean it to get the relative route
  if (cleanPath.startsWith("uploads/")) {
    return `${API_BASE}/${cleanPath}`;
  }

  return `${API_BASE}/uploads/${cleanPath}`;
}
