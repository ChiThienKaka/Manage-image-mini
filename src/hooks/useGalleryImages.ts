import {useCallback, useEffect, useState} from 'react';
import type {Gallery, ImageRecord} from '../types';
import {getGalleryById} from '../services/databaseService';
import {
  addImagesToGallery,
  listGalleryImages,
  removeImage,
  replaceImage,
} from '../services/imageService';

export function useGalleryImages(galleryId: string) {
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextGallery, nextImages] = await Promise.all([
        getGalleryById(galleryId),
        listGalleryImages(galleryId),
      ]);
      setGallery(nextGallery);
      setImages(nextImages);
      setError(null);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : 'Không thể tải hình ảnh.',
      );
    } finally {
      setLoading(false);
    }
  }, [galleryId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addImages = useCallback(async () => {
    setBusy(true);
    try {
      const added = await addImagesToGallery(galleryId);
      if (added.length > 0) {
        await refresh();
      }
      return added;
    } finally {
      setBusy(false);
    }
  }, [galleryId, refresh]);

  const replaceCurrentImage = useCallback(
    async (imageId: string) => {
      setBusy(true);
      try {
        const updated = await replaceImage(imageId);
        if (updated) {
          await refresh();
        }
        return updated;
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const deleteCurrentImage = useCallback(
    async (imageId: string) => {
      setBusy(true);
      try {
        await removeImage(imageId);
        await refresh();
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  return {
    gallery,
    images,
    loading,
    busy,
    error,
    refresh,
    addImages,
    replaceCurrentImage,
    deleteCurrentImage,
  };
}
