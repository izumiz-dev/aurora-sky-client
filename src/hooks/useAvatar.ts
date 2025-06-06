import { useState, useEffect } from 'preact/hooks';
import { avatarCache } from '../lib/avatar-cache';

interface UseAvatarOptions {
  fallback?: string;
  handle?: string;
}

/**
 * アバター画像のキャッシュと表示を管理するカスタムフック
 */
export const useAvatar = (
  originalUrl: string | null | undefined,
  options: UseAvatarOptions = {}
) => {
  const { fallback, handle } = options;
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    // 初期値の検証
    if (!originalUrl || originalUrl === '/default-avatar.png') {
      return ''; // フォールバックはコンポーネント側で処理
    }
    return originalUrl;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAvatar = async () => {
      if (!originalUrl || originalUrl === '/default-avatar.png') {
        setAvatarUrl('');
        return;
      }

      // 有効なURLかチェック
      try {
        const url = new URL(originalUrl);
        // httpsまたはhttpのみ許可
        if (!['https:', 'http:'].includes(url.protocol)) {
          throw new Error('Invalid protocol');
        }
      } catch {
        setAvatarUrl('');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const cachedUrl = await avatarCache.getAvatar(originalUrl, handle);

        if (mounted) {
          setAvatarUrl(cachedUrl);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setAvatarUrl('');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAvatar();

    return () => {
      mounted = false;
    };
  }, [originalUrl, fallback, handle]);

  return {
    avatarUrl,
    loading,
    error,
    isPlaceholder: !avatarUrl || avatarUrl === fallback,
  };
};

/**
 * 複数のアバターをプリロードするフック
 */
export const useAvatarPreload = (avatars: Array<{ url?: string | null; handle?: string }>) => {
  useEffect(() => {
    const validAvatars = avatars
      .filter((avatar) => avatar.url)
      .map((avatar) => ({ url: avatar.url!, handle: avatar.handle }));

    if (validAvatars.length > 0) {
      avatarCache.preloadAvatars(validAvatars);
    }
  }, [avatars]);
};
