/**
 * Shared validation and security helpers for server-side use.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

/** Max lengths to prevent DoS and DB bloat */
export const LIMITS = {
  COMMENT_CONTENT: 2000,
  RECIPE_TEXT: 50000,
  POST_DESCRIPTION: 2000,
  NOTIFICATION_ID: 200,
} as const;

export function clampString(value: string, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.slice(0, maxLen);
}

/** Sanitize upload filename: keep only basename and safe chars (no path traversal) */
export function sanitizeFileName(name: string): string {
  if (typeof name !== 'string') return 'image';
  const basename = name.replace(/^.*[/\\]/, '');
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_') || 'image';
}

/** Allowed image MIME types for upload */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function isAllowedImageType(type: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(type as (typeof ALLOWED_IMAGE_TYPES)[number]);
}
