import {canAddImages, remainingImageSlots} from '../src/utils/imageLimit';
import {MAX_IMAGES_PER_GALLERY} from '../src/utils/constants';

describe('image limit', () => {
  it('keeps a hard cap of 5 images', () => {
    expect(MAX_IMAGES_PER_GALLERY).toBe(5);
    expect(remainingImageSlots(0)).toBe(5);
    expect(remainingImageSlots(3)).toBe(2);
    expect(remainingImageSlots(5)).toBe(0);
  });

  it('blocks adding when the gallery is full', () => {
    expect(canAddImages(5)).toBe(false);
    expect(canAddImages(4, 2)).toBe(false);
    expect(canAddImages(3, 2)).toBe(true);
  });
});
