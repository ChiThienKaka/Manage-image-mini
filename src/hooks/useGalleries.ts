import {useCallback, useEffect, useState} from 'react';
import type {GalleryWithPreview} from '../types';
import {getGalleries} from '../services/databaseService';
import {createGallery, removeGallery} from '../services/imageService';

export function useGalleries() {
  const [galleries, setGalleries] = useState<GalleryWithPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGalleries();
      setGalleries(data);
      setError(null);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : 'Không thể tải danh sách gallery.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addGallery = useCallback(
    async (name: string) => {
      const gallery = await createGallery(name);
      await refresh();
      return gallery;
    },
    [refresh],
  );

  const deleteGallery = useCallback(
    async (id: string) => {
      await removeGallery(id);
      await refresh();
    },
    [refresh],
  );

  return {galleries, loading, error, refresh, addGallery, deleteGallery};
}
