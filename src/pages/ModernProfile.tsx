import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { TimelineThread } from '../components/thread/TimelineThread';
import { SelfThreadItem } from '../components/SelfThreadItem';
import { useAuth } from '../context/AuthContext';
import { getProfile, getAuthorFeed } from '../lib/api';
import type { UserProfile } from '../types/profile';
import type { Post } from '../types/post';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useSelfThreads } from '../hooks/useSelfThreads';
import { useDeduplicatedTimeline } from '../hooks/useDeduplicatedTimeline';
import { cacheConfig, cacheKeys } from '../lib/cacheConfig';
import { AuroraLoader } from '../components/AuroraLoader';

interface ProfilePageProps {
  handle?: string;
}

export const ModernProfilePage = ({ handle }: ProfilePageProps) => {
  const { isAuthenticated, session } = useAuth();
  const [authorFilter, setAuthorFilter] = useState<
    'posts_no_replies' | 'posts_with_replies' | 'posts_with_media'
  >('posts_no_replies');

  // プロフィールURLからハンドルを取得（@を除去）
  const userHandle = handle?.startsWith('@') ? handle.slice(1) : handle || session?.handle || '';

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: cacheKeys.profile(userHandle),
    queryFn: () => getProfile(userHandle),
    enabled: isAuthenticated && !!userHandle,
    ...cacheConfig.profile,
  });

  const {
    data: feedData,
    error: feedError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: feedLoading,
  } = useInfiniteQuery({
    queryKey: cacheKeys.authorFeed(userHandle, authorFilter),
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const response = await getAuthorFeed({
        actor: userHandle,
        cursor: pageParam,
        filter: authorFilter,
      });
      return response.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
    enabled: isAuthenticated && !!userHandle,
    ...cacheConfig.feed,
  });

  interface FeedPage {
    feed: any[];
    cursor?: string;
  }
  const feedItems = feedData?.pages?.flatMap((page: FeedPage) => page.feed) || [];
  const posts = feedItems.map((item) => {
    // feedItemはpostとreplyの両方を含む可能性がある
    const post = item.post || item;
    
    // デバッグ情報（開発環境のみ）
    if (import.meta.env.DEV && post.record?.reply) {
      console.log('ModernProfile: Reply post detected', {
        postUri: post.uri,
        hasReply: !!post.reply,
        hasRecordReply: !!post.record?.reply,
        isOwnPost: post.author.did === session?.did,
        authorFilter,
        rawItem: item,
      });
    }
    
    // 自分自身への返信の場合でも、標準のreply情報を保持
    return {
      ...post,
      reason: item.reason,
      reply: item.reply || post.reply,
    } as Post;
  });
  
  // Apply deduplication logic
  const deduplicatedPosts = useDeduplicatedTimeline(posts);
  const threadGroups = useSelfThreads(deduplicatedPosts);

  useInfiniteScroll({
    onLoadMore: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
    threshold: 300,
  });

  if (!isAuthenticated) {
    route('/login');
    return null;
  }

  if (!userHandle) {
    route('/login');
    return null;
  }

  if (profileLoading || feedLoading) {
    return (
      <div className="flex justify-center py-12">
        <AuroraLoader />
      </div>
    );
  }

  if (profileError || feedError) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-red-400">プロフィールの読み込みに失敗しました</p>
      </div>
    );
  }

  const userProfile = profile?.data as UserProfile;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 fade-enter">
      {/* プロフィールヘッダー */}
      <div className="glass-card mb-6 overflow-hidden">
        {/* バナー画像 */}
        {userProfile.banner && (
          <div className="h-48 overflow-hidden">
            <img src={userProfile.banner} alt="Banner" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6">
          <div className="flex gap-4 mb-4">
            {/* アバター */}
            <div className="flex-shrink-0">
              <div className="avatar avatar-xl">
                <img
                  src={userProfile.avatar || 'https://via.placeholder.com/80'}
                  alt={userProfile.displayName || userProfile.handle}
                />
              </div>
            </div>

            {/* ユーザー情報 */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {userProfile.displayName || userProfile.handle}
              </h1>
              <p className="text-white/60">@{userProfile.handle}</p>

              {userProfile.description && (
                <p className="mt-3 text-white/80 whitespace-pre-wrap">{userProfile.description}</p>
              )}

              {/* 統計情報 */}
              <div className="flex gap-6 mt-4">
                {userProfile.followersCount !== undefined && (
                  <div>
                    <span className="font-semibold text-white">{userProfile.followersCount}</span>
                    <span className="text-white/60 ml-1">フォロワー</span>
                  </div>
                )}
                {userProfile.followsCount !== undefined && (
                  <div>
                    <span className="font-semibold text-white">{userProfile.followsCount}</span>
                    <span className="text-white/60 ml-1">フォロー中</span>
                  </div>
                )}
                {userProfile.postsCount !== undefined && (
                  <div>
                    <span className="font-semibold text-white">{userProfile.postsCount}</span>
                    <span className="text-white/60 ml-1">投稿</span>
                  </div>
                )}
              </div>

              {/* フォローボタン（自分のプロフィールでない場合） */}
              {userProfile.did !== session?.did && (
                <div className="mt-4">
                  <button className="glass-button btn-primary">
                    {userProfile.viewer?.following ? 'フォロー中' : 'フォローする'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 投稿フィルター */}
      <div className="glass-card mb-4 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setAuthorFilter('posts_no_replies')}
            className={`glass-button flex-1 ${authorFilter === 'posts_no_replies' ? 'btn-primary' : ''}`}
          >
            投稿
          </button>
          <button
            onClick={() => setAuthorFilter('posts_with_replies')}
            className={`glass-button flex-1 ${authorFilter === 'posts_with_replies' ? 'btn-primary' : ''}`}
          >
            返信を含む
          </button>
          <button
            onClick={() => setAuthorFilter('posts_with_media')}
            className={`glass-button flex-1 ${authorFilter === 'posts_with_media' ? 'btn-primary' : ''}`}
          >
            メディア
          </button>
        </div>
      </div>

      {/* 投稿リスト */}
      <div className="space-y-4">
        {feedItems.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">投稿がありません</h3>
            <p className="text-white/70">このユーザーはまだ投稿していません</p>
          </div>
        ) : (
          threadGroups.map((group) => (
            group.type === 'thread' ? (
              <SelfThreadItem 
                key={group.id} 
                posts={group.posts}
              />
            ) : (
              <TimelineThread 
                key={group.posts[0].uri} 
                post={group.posts[0]} 
              />
            )
          ))
        )}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <div className="text-center py-8 text-white/60">これ以上の投稿はありません</div>
      )}
    </div>
  );
};