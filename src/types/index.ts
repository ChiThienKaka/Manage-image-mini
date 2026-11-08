export type Gallery = {
  id: string;
  name: string;
  created_at: string;
};

export type ImageRecord = {
  id: string;
  gallery_id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  width: number;
  height: number;
  created_at: string;
  missing?: boolean;
};

export type GalleryWithPreview = Gallery & {
  image_count: number;
  preview_path: string | null;
};

export type PickedImage = {
  uri: string;
  originalPath?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
};
