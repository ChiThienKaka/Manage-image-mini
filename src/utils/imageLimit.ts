import { MAX_IMAGES_PER_GALLERY } from './constants';

export function remainingImageSlots(currentCount: number): number {
  return Math.max(0, MAX_IMAGES_PER_GALLERY - currentCount);
}

export function canAddImages(currentCount: number, incomingCount = 1): boolean {
  return incomingCount > 0 && currentCount + incomingCount <= MAX_IMAGES_PER_GALLERY;
}
