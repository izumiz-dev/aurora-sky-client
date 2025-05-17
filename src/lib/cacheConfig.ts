// キャッシュ設定の中央管理
export const cacheConfig = {
  // プロフィール情報のキャッシュ設定
  profile: {
    staleTime: 1000 * 60 * 10, // 10分間新鮮
    gcTime: 1000 * 60 * 30, // 30分間保持
  },

  // 投稿フィードのキャッシュ設定
  feed: {
    staleTime: 1000 * 60 * 3, // 3分間新鮮
    gcTime: 1000 * 60 * 15, // 15分間保持
  },

  // タイムラインのキャッシュ設定
  timeline: {
    staleTime: 1000 * 60 * 5, // 5分間新鮮
    gcTime: 1000 * 60 * 10, // 10分間保持
  },

  // 画像のキャッシュ設定
  images: {
    staleTime: 1000 * 60 * 60 * 24, // 24時間新鮮
    gcTime: 1000 * 60 * 60 * 48, // 48時間保持
  },
};

// キャッシュキーの定義
export const cacheKeys = {
  timeline: (userId?: string) => ['timeline', userId].filter(Boolean),
  profile: (handle: string) => ['profile', handle],
  authorFeed: (handle: string, filter: string) => ['authorFeed', handle, filter],
  preferences: () => ['preferences'],
} as const;
