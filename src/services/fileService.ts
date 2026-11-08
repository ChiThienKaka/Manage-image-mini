import {
  copyFile,
  exists,
  mkdir,
  readFile,
  stat,
  unlink,
  writeFile,
  DocumentDirectoryPath,
} from '@dr.pogodin/react-native-fs';
import {APP_IMAGE_DIR_NAME} from '../utils/constants';
import {createId} from '../utils/id';
import {extensionFromNameOrMime, toCopySource} from '../utils/paths';

function imagesDirectory(): string {
  return `${DocumentDirectoryPath}/${APP_IMAGE_DIR_NAME}`;
}

export async function ensureImageDirectory(): Promise<string> {
  const directory = imagesDirectory();
  const directoryExists = await exists(directory);
  if (!directoryExists) {
    await mkdir(directory);
  }
  return directory;
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    return await exists(toCopySource(path));
  } catch {
    return false;
  }
}

export async function getFileSize(path: string): Promise<number> {
  try {
    const info = await stat(toCopySource(path));
    return Number(info.size ?? 0);
  } catch {
    return 0;
  }
}

async function copyExactFile(source: string, destination: string): Promise<void> {
  const from = toCopySource(source);
  try {
    await copyFile(from, destination);
    return;
  } catch {
    const data = await readFile(from, 'base64');
    await writeFile(destination, data, 'base64');
  }
}

export async function copyImageToAppStorage(params: {
  sourceUri: string;
  fallbackUri?: string;
  originalName?: string;
  mimeType?: string;
}): Promise<{fileName: string; filePath: string; fileSize: number}> {
  const directory = await ensureImageDirectory();
  const extension = extensionFromNameOrMime(params.originalName, params.mimeType);
  const fileName = `${createId()}.${extension}`;
  const destination = `${directory}/${fileName}`;
  const sources = [params.sourceUri, params.fallbackUri].filter(
    (value): value is string => Boolean(value),
  );

  let lastError: unknown;
  for (const source of sources) {
    try {
      await copyExactFile(source, destination);
      const copied = await exists(destination);
      if (!copied) {
        throw new Error('Tệp đích không tồn tại sau khi sao chép.');
      }
      const fileSize = await getFileSize(destination);
      if (fileSize <= 0) {
        throw new Error('Tệp ảnh sao chép bị rỗng.');
      }
      return {fileName, filePath: destination, fileSize};
    } catch (error) {
      lastError = error;
      await safeUnlink(destination);
    }
  }

  throw new Error(
    lastError instanceof Error
      ? `Không thể sao chép ảnh: ${lastError.message}`
      : 'Không thể sao chép ảnh vào bộ nhớ ứng dụng.',
  );
}

export async function safeUnlink(path: string): Promise<void> {
  try {
    const target = toCopySource(path);
    if (await exists(target)) {
      await unlink(target);
    }
  } catch {
    // Orphan files are cleaned on the next successful delete attempt.
  }
}

export async function deleteStoredFiles(paths: string[]): Promise<void> {
  await Promise.all(paths.map(path => safeUnlink(path)));
}
