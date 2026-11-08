import {LOCK_SETTING_KEY} from '../utils/constants';
import {deleteSetting, getGalleryById, getSetting, setSetting} from './databaseService';

export type LockSession = {
  galleryId: string;
  initialIndex: number;
};

export async function getLockSession(): Promise<LockSession | null> {
  const raw = await getSetting(LOCK_SETTING_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as LockSession;
    if (!parsed?.galleryId) {
      await clearLockSession();
      return null;
    }
    const gallery = await getGalleryById(parsed.galleryId);
    if (!gallery) {
      await clearLockSession();
      return null;
    }
    return {
      galleryId: parsed.galleryId,
      initialIndex: Number(parsed.initialIndex ?? 0),
    };
  } catch {
    await clearLockSession();
    return null;
  }
}

export async function saveLockSession(session: LockSession): Promise<void> {
  await setSetting(LOCK_SETTING_KEY, JSON.stringify(session));
}

export async function clearLockSession(): Promise<void> {
  await deleteSetting(LOCK_SETTING_KEY);
}
