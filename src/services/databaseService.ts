import {open, type DB} from '@op-engineering/op-sqlite';
import {DATABASE_NAME} from '../utils/constants';
import type {Gallery, GalleryWithPreview, ImageRecord} from '../types';

let database: DB | null = null;

function getDb(): DB {
  if (!database) {
    throw new Error('Cơ sở dữ liệu chưa được khởi tạo.');
  }
  return database;
}

function mapImage(row: Record<string, unknown>): ImageRecord {
  return {
    id: String(row.id),
    gallery_id: String(row.gallery_id),
    file_name: String(row.file_name),
    file_path: String(row.file_path),
    mime_type: String(row.mime_type),
    file_size: Number(row.file_size ?? 0),
    width: Number(row.width ?? 0),
    height: Number(row.height ?? 0),
    created_at: String(row.created_at),
  };
}

export async function initDatabase(): Promise<void> {
  if (database) {
    return;
  }

  database = open({name: DATABASE_NAME});

  await database.execute(`
    CREATE TABLE IF NOT EXISTS galleries (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY NOT NULL,
      gallery_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (gallery_id) REFERENCES galleries(id)
    );
  `);
}

export async function insertGallery(gallery: Gallery): Promise<void> {
  await getDb().execute(
    'INSERT INTO galleries (id, name, created_at) VALUES (?, ?, ?)',
    [gallery.id, gallery.name, gallery.created_at],
  );
}

export async function getGalleries(): Promise<GalleryWithPreview[]> {
  const result = await getDb().execute(`
    SELECT
      g.id,
      g.name,
      g.created_at,
      COUNT(i.id) AS image_count,
      (
        SELECT i2.file_path
        FROM images i2
        WHERE i2.gallery_id = g.id
        ORDER BY i2.created_at ASC
        LIMIT 1
      ) AS preview_path
    FROM galleries g
    LEFT JOIN images i ON i.gallery_id = g.id
    GROUP BY g.id
    ORDER BY g.created_at DESC
  `);

  return result.rows.map(row => ({
    id: String(row.id),
    name: String(row.name),
    created_at: String(row.created_at),
    image_count: Number(row.image_count ?? 0),
    preview_path: row.preview_path ? String(row.preview_path) : null,
  }));
}

export async function getGalleryById(id: string): Promise<Gallery | null> {
  const result = await getDb().execute(
    'SELECT id, name, created_at FROM galleries WHERE id = ? LIMIT 1',
    [id],
  );
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  return {
    id: String(row.id),
    name: String(row.name),
    created_at: String(row.created_at),
  };
}

export async function deleteGallery(id: string): Promise<void> {
  const db = getDb();
  await db.execute('DELETE FROM images WHERE gallery_id = ?', [id]);
  await db.execute('DELETE FROM galleries WHERE id = ?', [id]);
}

export async function getImagesByGalleryId(
  galleryId: string,
): Promise<ImageRecord[]> {
  const result = await getDb().execute(
    `SELECT id, gallery_id, file_name, file_path, mime_type, file_size, width, height, created_at
     FROM images
     WHERE gallery_id = ?
     ORDER BY created_at ASC`,
    [galleryId],
  );
  return result.rows.map(row => mapImage(row));
}

export async function countImages(galleryId: string): Promise<number> {
  const result = await getDb().execute(
    'SELECT COUNT(id) AS total FROM images WHERE gallery_id = ?',
    [galleryId],
  );
  return Number(result.rows[0]?.total ?? 0);
}

export async function insertImage(image: ImageRecord): Promise<void> {
  await getDb().execute(
    `INSERT INTO images (
      id, gallery_id, file_name, file_path, mime_type, file_size, width, height, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      image.id,
      image.gallery_id,
      image.file_name,
      image.file_path,
      image.mime_type,
      image.file_size,
      image.width,
      image.height,
      image.created_at,
    ],
  );
}

export async function updateImage(
  id: string,
  fields: Pick<
    ImageRecord,
    'file_name' | 'file_path' | 'mime_type' | 'file_size' | 'width' | 'height'
  >,
): Promise<void> {
  await getDb().execute(
    `UPDATE images
     SET file_name = ?, file_path = ?, mime_type = ?, file_size = ?, width = ?, height = ?
     WHERE id = ?`,
    [
      fields.file_name,
      fields.file_path,
      fields.mime_type,
      fields.file_size,
      fields.width,
      fields.height,
      id,
    ],
  );
}

export async function deleteImage(id: string): Promise<void> {
  await getDb().execute('DELETE FROM images WHERE id = ?', [id]);
}

export async function getImageById(id: string): Promise<ImageRecord | null> {
  const result = await getDb().execute(
    `SELECT id, gallery_id, file_name, file_path, mime_type, file_size, width, height, created_at
     FROM images WHERE id = ? LIMIT 1`,
    [id],
  );
  const row = result.rows[0];
  return row ? mapImage(row) : null;
}

export async function getSetting(key: string): Promise<string | null> {
  const result = await getDb().execute(
    'SELECT value FROM app_settings WHERE key = ? LIMIT 1',
    [key],
  );
  const value = result.rows[0]?.value;
  return value == null ? null : String(value);
}

export async function setSetting(key: string, value: string): Promise<void> {
  await getDb().execute(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}

export async function deleteSetting(key: string): Promise<void> {
  await getDb().execute('DELETE FROM app_settings WHERE key = ?', [key]);
}
