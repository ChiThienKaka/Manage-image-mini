import {useEffect, useState} from 'react';
import {initDatabase} from '../services/databaseService';
import {ensureImageDirectory} from '../services/fileService';
import {getLockSession, type LockSession} from '../services/lockService';

export function useAppBootstrap() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockSession, setLockSession] = useState<LockSession | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await initDatabase();
        await ensureImageDirectory();
        const session = await getLockSession();
        if (!cancelled) {
          setLockSession(session);
          setReady(true);
        }
      } catch (bootstrapError) {
        if (!cancelled) {
          setError(
            bootstrapError instanceof Error
              ? bootstrapError.message
              : 'Không thể khởi tạo ứng dụng.',
          );
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  return {ready, error, lockSession};
}
