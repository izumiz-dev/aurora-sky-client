import { useState, useEffect } from 'preact/hooks';
import { avatarCache } from '../lib/avatar-cache';

interface UseAvatarOptions {
  fallback?: string;
  handle?: string;
}

/**
 * アバター画像のキャッシュと表示を管理するカスタムフック
 */
export const useAvatar = (originalUrl: string | null | undefined, options: UseAvatarOptions = {}) => {
  const { fallback = 'https://via.placeholder.com/48', handle } = options;
  const [avatarUrl, setAvatarUrl] = useState<string>(originalUrl || fallback);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAvatar = async () => {
      // URLが無い場合はフォールバックを使用
      if (!originalUrl) {
        setAvatarUrl(fallback);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // キャッシュマネージャーから画像を取得
        const cachedUrl = await avatarCache.getAvatar(originalUrl, handle);
        
        if (mounted) {
          setAvatarUrl(cachedUrl);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setAvatarUrl(fallback);
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
    isPlaceholder: avatarUrl === fallback,
  };
};

/**
 * 複数のアバターをプリロードするフック
 */
export const useAvatarPreload = (
  avatars: Array<{ url?: string | null; handle?: string }>
) => {
  useEffect(() => {
    const validAvatars = avatars
      .filter(avatar => avatar.url)
      .map(avatar => ({ url: avatar.url!, handle: avatar.handle }));

    if (validAvatars.length > 0) {
      avatarCache.preloadAvatars(validAvatars);
    }
  }, [avatars]);
};