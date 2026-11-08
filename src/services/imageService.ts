import {launchImageLibrary} from 'react-native-image-picker';
import type {ImageRecord, PickedImage} from '../types';
import {MAX_IMAGES_PER_GALLERY} from '../utils/constants';
import {createId} from '../utils/id';
import {canAddImages, remainingImageSlots} from '../utils/imageLimit';
import {ensurePhotoLibraryPermission} from '../utils/permissions';
import * as databaseService from './databaseService';
import * as fileService from './fileService';

export class ImageLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageLimitError';
  }
}

async function pickFromLibrary(selectionLimit: number): Promise<PickedImage[]> {
  if (selectionLimit <= 0) {
    throw new ImageLimitError('Gallery đã đạt giới hạn 5 ảnh.');
  }

  const allowed = await ensurePhotoLibraryPermission();
  if (!allowed) {
    throw new Error('Ứng dụng chưa được cấp quyền truy cập thư viện ảnh.');
  }

  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit,
    includeExtra: true,
    quality: 1,
    assetRepresentationMode: 'current',
  });

  if (result.didCancel) {
    return [];
  }

  if (result.errorCode) {
    throw new Error(result.errorMessage ?? 'Không thể mở thư viện ảnh.');
  }

  return (result.assets ?? [])
    .filter(asset => Boolean(asset.uri || asset.originalPath))
    .map(asset => ({
      uri: asset.uri || asset.originalPath || '',
      originalPath: asset.originalPath,
      fileName: asset.fileName,
      mimeType: asset.type,
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
    }));
}

async function persistPickedImage(
  galleryId: string,
  picked: PickedImage,
): Promise<ImageRecord> {
  const copied = await fileService.copyImageToAppStorage({
    sourceUri: picked.uri,
    fallbackUri: picked.originalPath,
    originalName: picked.fileName,
    mimeType: picked.mimeType,
  });

  const record: ImageRecord = {
    id: createId(),
    gallery_id: galleryId,
    file_name: copied.fileName,
    file_path: copied.filePath,
    mime_type: picked.mimeType ?? 'image/jpeg',
    file_size: copied.fileSize || picked.fileSize || 0,
    width: picked.width ?? 0,
    height: picked.height ?? 0,
    created_at: new Date().toISOString(),
  };

  try {
    await databaseService.insertImage(record);
  } catch (error) {
    await fileService.safeUnlink(copied.filePath);
    throw error;
  }

  return record;
}

export async function addImagesToGallery(galleryId: string): Promise<ImageRecord[]> {
  const currentCount = await databaseService.countImages(galleryId);
  const slots = remainingImageSlots(currentCount);
  if (!canAddImages(currentCount)) {
    throw new ImageLimitError('Gallery đã đạt giới hạn 5 ảnh.');
  }

  const picked = await pickFromLibrary(slots);
  if (picked.length === 0) {
    return [];
  }

  const allowed = picked.slice(0, slots);
  const saved: ImageRecord[] = [];
  const copiedPaths: string[] = [];

  try {
    for (const item of allowed) {
      const record = await persistPickedImage(galleryId, item);
      saved.push(record);
      copiedPaths.push(record.file_path);
    }
    return saved;
  } catch (error) {
    await Promise.all(
      saved.map(async record => {
        await databaseService.deleteImage(record.id);
      }),
    );
    await fileService.deleteStoredFiles(copiedPaths);
    throw error instanceof Error
      ? error
      : new Error('Lưu ảnh thất bại. Dữ liệu đã được hoàn tác.');
  }
}

export async function replaceImage(imageId: string): Promise<ImageRecord | null> {
  const existing = await databaseService.getImageById(imageId);
  if (!existing) {
    throw new Error('Không tìm thấy ảnh cần thay thế.');
  }

  const picked = await pickFromLibrary(1);
  if (picked.length === 0) {
    return null;
  }

  const next = picked[0];
  if (!next) {
    return null;
  }
  const copied = await fileService.copyImageToAppStorage({
    sourceUri: next.uri,
    fallbackUri: next.originalPath,
    originalName: next.fileName,
    mimeType: next.mimeType,
  });

  try {
    await databaseService.updateImage(existing.id, {
      file_name: copied.fileName,
      file_path: copied.filePath,
      mime_type: next.mimeType ?? existing.mime_type,
      file_size: copied.fileSize || next.fileSize || 0,
      width: next.width ?? existing.width,
      height: next.height ?? existing.height,
    });
  } catch (error) {
    await fileService.safeUnlink(copied.filePath);
    throw error;
  }

  await fileService.safeUnlink(existing.file_path);
  const updated = await databaseService.getImageById(existing.id);
  return updated;
}

export async function removeImage(imageId: string): Promise<void> {
  const existing = await databaseService.getImageById(imageId);
  if (!existing) {
    return;
  }
  await databaseService.deleteImage(imageId);
  await fileService.safeUnlink(existing.file_path);
}

export async function listGalleryImages(galleryId: string): Promise<ImageRecord[]> {
  const records = await databaseService.getImagesByGalleryId(galleryId);
  return Promise.all(
    records.map(async record => ({
      ...record,
      missing: !(await fileService.fileExists(record.file_path)),
    })),
  );
}

export async function createGallery(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Tên gallery không được để trống.');
  }
  const gallery = {
    id: createId(),
    name: trimmed,
    created_at: new Date().toISOString(),
  };
  await databaseService.insertGallery(gallery);
  return gallery;
}

export async function removeGallery(galleryId: string): Promise<void> {
  const images = await databaseService.getImagesByGalleryId(galleryId);
  await databaseService.deleteGallery(galleryId);
  await fileService.deleteStoredFiles(images.map(image => image.file_path));
}

export function isGalleryFull(count: number): boolean {
  return count >= MAX_IMAGES_PER_GALLERY;
}
