// Use Docker host IP for backend
export const API_BASE_URL = "http://26.171.147.78:3000";

/**
 * Convert old localhost URLs to current API base URL
 * This handles images that were uploaded before PUBLIC_BASE_URL was configured
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";

  // If it's already using the correct base URL, return as is
  if (url.startsWith(API_BASE_URL)) {
    return url;
  }

  // Replace localhost URLs with correct base URL
  if (url.includes("localhost:3000") || url.includes("localhost:3001")) {
    return url.replace(/http:\/\/localhost:\d+/, API_BASE_URL);
  }

  // If it's a relative URL (starts with /uploads/), make it absolute
  if (url.startsWith("/uploads/")) {
    return `${API_BASE_URL}${url}`;
  }

  // Return as is for other cases (external URLs, etc.)
  return url;
}
