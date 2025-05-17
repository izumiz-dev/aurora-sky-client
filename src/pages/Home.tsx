import { useState, useEffect } from 'preact/hooks';
import { useQuery } from '@tanstack/react-query';
import { BskyAgent, AppBskyFeedDefs } from '@atproto/api';
import { useAuth } from '../context/AuthContext';
import type { SessionData } from '../types/session';

// 型定義
interface Post {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  record: {
    text: string;
    createdAt: string;
  };
  likeCount?: number;
  replyCount?: number;
  repostCount?: number;
  viewer?: {
    like?: string;
    repost?: string;
  };
}

// 実際のタイムライン取得関数
const fetchTimeline = async (
  session: SessionData,
  cursor?: string
): Promise<{ feed: Post[]; cursor?: string }> => {
  if (!session) {
    throw new Error('セッションがありません');
  }

  const agent = new BskyAgent({ service: 'https://bsky.social' });
  // @ts-ignore - Session type mismatch
  await agent.resumeSession(session);

  const response = await agent.getTimeline({ cursor, limit: 20 });

  // BlueskyのレスポンスをPost型に変換
  const feed = response.data.feed.map((item: { post: AppBskyFeedDefs.PostView }) => {
    const post = item.post as AppBskyFeedDefs.PostView;

    return {
      uri: post.uri,
      cid: post.cid,
      author: {
        did: post.author.did,
        handle: post.author.handle,
        displayName: post.author.displayName || post.author.handle,
        avatar: post.author.avatar || '',
      },
      record: {
        text: typeof post.record.text === 'string' ? post.record.text : '',
        createdAt:
          typeof post.record.createdAt === 'string'
            ? post.record.createdAt
            : new Date().toISOString(),
      },
      likeCount: post.likeCount || 0,
      replyCount: post.replyCount || 0,
      repostCount: post.repostCount || 0,
      viewer: post.viewer,
    };
  });

  return {
    feed,
    cursor: response.data.cursor,
  };
};

export const HomePage = () => {
  const { isAuthenticated, session } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['timeline', cursor, session?.did],
    queryFn: () => fetchTimeline(session!, cursor || undefined),
    enabled: isAuthenticated && !!session,
  });

  useEffect(() => {
    if (data) {
      if (cursor) {
        setPosts((prev) => [...prev, ...(data.feed || [])]);
      } else {
        setPosts(data.feed || []);
      }
      setCursor(data.cursor || null);
    }
  }, [data, cursor]);

  const handleLoadMore = () => {
    if (cursor && !isLoadingMore) {
      setIsLoadingMore(true);
      refetch().finally(() => setIsLoadingMore(false));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <div className="glass-card-simple max-w-md mx-auto p-8">
          <h2 className="text-2xl font-semibold text-white mb-3">AuroraSkyにログイン</h2>
          <p className="text-white/70 mb-6">タイムラインを表示するにはログインしてください</p>
          <a href="/login" className="btn-primary inline-block">
            ログインページへ
          </a>
        </div>
      </div>
    );
  }

  if (isLoading && !cursor) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-white/70"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-red-500/10 border border-red-500/30 text-red-100 px-6 py-4 rounded-lg">
          タイムラインの読み込み中にエラーが発生しました。
          <button
            onClick={() => refetch()}
            className="ml-3 text-blue-300 hover:text-blue-200 underline"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* 新規投稿ボックス */}
      <div className="glass-card-simple p-6 mb-8">
        <textarea
          className="w-full bg-transparent text-white resize-none focus:outline-none placeholder-white/50 text-base h-20"
          placeholder="今なにしてる？"
          disabled={!isAuthenticated}
        />
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-3">
            <button className="icon-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button className="icon-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
          <button className="btn-primary text-sm">投稿する</button>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="flex gap-6 border-b border-white/10 mb-8">
        <button className="pb-3 text-white font-medium border-b-2 border-blue-400">おすすめ</button>
        <button className="pb-3 text-white/60 font-medium hover:text-white/80 transition-colors">
          フォロー中
        </button>
      </div>

      {/* 投稿リスト */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.uri}
            className="glass-card-simple p-6 hover:bg-white/[0.08] transition-colors"
          >
            <div className="flex gap-4">
              <img
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10"
                src={post.author.avatar || '/default-avatar.png'}
                alt={post.author.displayName || post.author.handle}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="text-sm font-semibold text-white">
                    {post.author.displayName || post.author.handle}
                  </p>
                  <span className="text-sm text-white/50">@{post.author.handle}</span>
                  <span className="text-xs text-white/40">·</span>
                  <span
                    className="text-xs text-white/50"
                    title={new Date(post.record.createdAt).toLocaleString('ja-JP')}
                  >
                    {formatTimeAgo(new Date(post.record.createdAt))}
                  </span>
                </div>
                <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-4">
                  {post.record.text}
                </p>
                <div className="flex items-center gap-6 text-sm text-white/60">
                  <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                    <div className="icon-btn-small">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <span>{post.replyCount || 0}</span>
                  </button>
                  <button
                    className={`flex items-center gap-2 transition-colors ${post.viewer?.repost ? 'text-green-400' : 'hover:text-green-400'}`}
                  >
                    <div className="icon-btn-small">
                      <svg
                        className="h-4 w-4"
                        fill={post.viewer?.repost ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </div>
                    <span>{post.repostCount || 0}</span>
                  </button>
                  <button
                    className={`flex items-center gap-2 transition-colors ${post.viewer?.like ? 'text-pink-400' : 'hover:text-pink-400'}`}
                  >
                    <div className="icon-btn-small">
                      <svg
                        className="h-4 w-4"
                        fill={post.viewer?.like ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <span>{post.likeCount || 0}</span>
                  </button>
                  <button className="icon-btn-small ml-auto hover:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {posts.length > 0 && cursor && !isLoading && (
          <div className="flex justify-center pt-8 pb-4">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-full transition-all disabled:opacity-70 flex items-center"
            >
              {isLoadingMore ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  読み込み中...
                </>
              ) : (
                <>
                  <span>もっと読み込む</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {isLoading && posts.length > 0 && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white/70"></div>
          </div>
        )}

        {posts.length === 0 && !isLoading && (
          <div className="glass-card-simple p-12 text-center">
            <div className="bg-white/5 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">投稿がありません</h3>
            <p className="text-white/60 mb-6">タイムラインにはまだ投稿がありません。</p>
            <button className="btn-primary text-sm">更新する</button>
          </div>
        )}
      </div>
    </div>
  );
};

// 時間を相対的な表現に変換
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (minutes > 0) return `${minutes}分前`;
  return 'たった今';
}
