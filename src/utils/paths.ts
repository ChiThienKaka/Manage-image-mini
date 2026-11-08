export function toFileUri(path: string): string {
  if (path.startsWith('file://') || path.startsWith('content://')) {
    return path;
  }
  return `file://${path}`;
}

export function stripFileScheme(path: string): string {
  return path.replace(/^file:\/\//, '');
}

export function toCopySource(path: string): string {
  if (path.startsWith('content://')) {
    return path;
  }
  return stripFileScheme(path);
}

export function extensionFromNameOrMime(
  fileName?: string,
  mimeType?: string,
): string {
  if (fileName) {
    const fromName = fileName.split('.').pop()?.toLowerCase();
    if (
      fromName &&
      fromName !== fileName.toLowerCase() &&
      /^[a-z0-9]+$/.test(fromName)
    ) {
      return fromName;
    }
  }
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return 'jpg';
  }
  if (mimeType === 'image/png') {
    return 'png';
  }
  if (mimeType === 'image/webp') {
    return 'webp';
  }
  if (mimeType === 'image/heic') {
    return 'heic';
  }
  if (mimeType === 'image/heif') {
    return 'heif';
  }
  if (mimeType === 'image/gif') {
    return 'gif';
  }
  return 'jpg';
}
