import { useEffect } from 'preact/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { getPostThread } from '../lib/api';
import type { Post } from '../types/post';

interface UseThreadPreloaderOptions {
  posts: Post[];
  enabled?: boolean;
  priority?: 'high' | 'low';
}

export const useThreadPreloader = ({
  posts,
  enabled = true,
  priority = 'low',
}: UseThreadPreloaderOptions) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    // スレッドを持つ投稿をフィルタリング
    const postsWithReplies = posts.filter(
      (post) => (post.replyCount && post.replyCount > 0) || post.reply?.parent
    );

    // プリロードを実行（バッチ処理）
    const preloadThreads = async () => {
      const batchSize = priority === 'high' ? 5 : 3;
      const delay = priority === 'high' ? 100 : 300;

      for (let i = 0; i < postsWithReplies.length; i += batchSize) {
        const batch = postsWithReplies.slice(i, i + batchSize);

        // バッチ内の各投稿のスレッドをプリフェッチ
        await Promise.all(
          batch.map((post) =>
            queryClient.prefetchQuery({
              queryKey: ['thread', post.uri],
              queryFn: () => getPostThread({ uri: post.uri }),
              staleTime: 5 * 60 * 1000, // 5分間キャッシュ
            })
          )
        );

        // 次のバッチまで待機
        if (i + batchSize < postsWithReplies.length) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    };

    // 非同期でプリロードを開始
    preloadThreads().catch((error) => {
      console.warn('Thread preloading failed:', error);
    });
  }, [posts, enabled, priority, queryClient]);
};
