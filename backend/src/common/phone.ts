// Format canonical: +62 diikuti 8-12 digit (total 10-14 digit angka)
export const PHONE_REGEX = /^\+62\d{8,12}$/;

/**
 * Menormalkan input nomor telepon ke format +62.
 * - Buang spasi/tanda hubung
 * - 08xxx / 03xxx -> +628xxx / +623xxx
 * - 628xxx        -> +628xxx
 * - 8xxx          -> +628xxx
 * - +62xxx        -> dipertahankan
 * Selain itu dikembalikan apa adanya (masih diketik user).
 */
export function normalizePhone(raw: unknown): string {
  if (typeof raw !== 'string') return '';

  const value = raw.replace(/[\s-]/g, '');
  if (!value) return '';

  if (value.startsWith('+62')) return value;
  if (value.startsWith('0')) return `+62${value.slice(1)}`;
  if (value.startsWith('62')) return `+62${value.slice(2)}`;
  if (/^\d/.test(value)) return `+62${value}`;

  return value;
}

export function isValidPhone(raw: string): boolean {
  return PHONE_REGEX.test(raw);
}
