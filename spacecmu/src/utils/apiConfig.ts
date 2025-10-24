// Dynamic API base URL that works on any machine
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : "http://localhost:3000");

/**
 * Convert old localhost URLs to current API base URL
 * This handles images that were uploaded before PUBLIC_BASE_URL was configured
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";

  // ถ้าเป็น absolute ที่ชี้ API_BASE_URL อยู่แล้ว
  if (url.startsWith(API_BASE_URL)) {
    return url;
  }

  // แทนที่ localhost:* ด้วยฐานใหม่ (รองรับรูปเก่า)
  if (/^http:\/\/localhost:\d+/.test(url)) {
    return url.replace(/http:\/\/localhost:\d+/, API_BASE_URL);
  }

  // ถ้าเป็น path เริ่มด้วย /uploads/ ให้ประกอบเป็น absolute
  if (url.startsWith("/uploads/")) {
    return `${API_BASE_URL}${url}`;
  }

  // กรณีเป็น URL ภายนอกอื่น ๆ ก็คืนตามเดิม
  return url;
}
