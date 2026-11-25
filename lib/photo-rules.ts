export const MAX_PHOTOS = 8;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const PHOTO_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const ALLOWED_EXT = /\.(jpe?g|png|webp|heic|heif)$/i;

export function isSupportedPhoto(file: File): boolean {
  return ALLOWED_MIME.has(file.type.toLowerCase()) || ALLOWED_EXT.test(file.name);
}

export function isHeicPhoto(file: File): boolean {
  return /image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}
