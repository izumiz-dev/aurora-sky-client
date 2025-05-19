import { useAuth } from '../context/AuthContext';
import { PostComposer } from '../components/PostComposer';
import { UnifiedThreadView } from '../components/UnifiedThreadView';
import { OptimizedSelfThread } from '../components/OptimizedSelfThread';
import { Snackbar } from '../components/Snackbar';
import { useTimeline } from '../hooks/useTimeline';
import { useSelfThreads } from '../hooks/useSelfThreads';
import { useThreadPreloader } from '../hooks/useThreadPreloader';
import { AppIcon } from '../components/AppIcon';
import { DevelopmentNotice } from '../components/DevelopmentNotice';
import { AuroraLoader } from '../components/AuroraLoader';

export const ModernHomeOptimized = () => {
  const { isAuthenticated, session } = useAuth();
  const {
    posts,
    isLoading,
    error,
    isLoadingMore,
    hasMore,
    loadError,
    newPostsCount,
    loadNewPosts,
    newPostIds,
    showSnackbar,
    handleCloseSnackbar,
    refreshTimeline,
  } = useTimeline(session, isAuthenticated);
  
  const threadGroups = useSelfThreads(posts);
  
  // スレッドのプリロード
  useThreadPreloader({
    posts: posts.slice(0, 10), // 最初の10投稿のみプリロード
    enabled: !isLoading,
    priority: 'low'
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 fade-enter">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <AppIcon size="lg" withGradientBg={false} className="mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-white mb-2">AuroraSkyへようこそ</h2>
          <p className="text-white/70 mb-6">タイムラインを表示するにはログインしてください</p>
          <a href="/login" className="glass-button btn-primary">
            ログインする
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 fade-enter">
      <DevelopmentNotice />
      <PostComposer onPostSuccess={refreshTimeline} />

      {newPostsCount > 0 && (
        <div className="mb-4 ambient-fade-in">
          <button
            onClick={loadNewPosts}
            className="glass-button w-full py-3 text-center hover:scale-[1.02] transition-transform ambient-glow"
          >
            <span className="shimmer-text">{newPostsCount}件の新しい投稿を表示</span>
          </button>
        </div>
      )}

      <div className="space-y-4">
        {isLoading && posts.length === 0 ? (
          <div className="flex justify-center py-12">
            <AuroraLoader />
          </div>
        ) : error ? (
          <div className="glass-card p-6 text-center">
            <p className="text-red-400 mb-4">タイムラインの読み込みに失敗しました</p>
            <button 
              onClick={refreshTimeline}
              className="glass-button"
            >
              再読み込み
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">タイムラインは空です</h3>
            <p className="text-white/70">フォローしているユーザーの投稿がここに表示されます</p>
          </div>
        ) : (
          threadGroups.map((group) => {
            if (group.type === 'thread') {
              return (
                <OptimizedSelfThread 
                  key={group.id} 
                  posts={group.posts} 
                  isNew={group.posts.some(p => newPostIds.has(p.uri))}
                />
              );
            } else {
              const post = group.posts[0];
              return (
                <UnifiedThreadView 
                  key={post.uri} 
                  post={post} 
                  isNew={newPostIds.has(post.uri)}
                  mode="inline"
                />
              );
            }
          })
        )}
      </div>

      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <AuroraLoader />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-white/60">
          これ以上の投稿はありません
        </div>
      )}

      {loadError && (
        <div className="text-center py-4 text-red-400">
          {loadError}
        </div>
      )}

      {showSnackbar && (
        <Snackbar
          message={`${newPostsCount}件の新しい投稿があります`}
          onClose={handleCloseSnackbar}
        />
      )}
    </div>
  );
};