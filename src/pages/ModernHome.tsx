import { useAuth } from '../context/AuthContext';
import { PostComposer } from '../components/PostComposer';
import { TimelineThread } from '../components/thread/TimelineThread';
import { SelfThreadItem } from '../components/SelfThreadItem';
import { Snackbar } from '../components/Snackbar';
import { useTimeline } from '../hooks/useTimeline';
import { useSelfThreads } from '../hooks/useSelfThreads';
import { useDeduplicatedTimeline } from '../hooks/useDeduplicatedTimeline';
import { AppIcon } from '../components/AppIcon';
import { DevelopmentNotice } from '../components/DevelopmentNotice';
import { AuroraLoader } from '../components/AuroraLoader';

export const ModernHomePage = () => {
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
  
  // Apply deduplication logic
  const deduplicatedPosts = useDeduplicatedTimeline(posts);
  const threadGroups = useSelfThreads(deduplicatedPosts);

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
            className="aurora-gradient-bg w-full py-3 text-center hover:scale-[1.02] transition-transform ambient-glow rounded-lg border border-white/20 shadow-lg"
          >
            <span className="text-white font-medium">{newPostsCount}件の新しい投稿を表示</span>
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
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">タイムラインは空です</h3>
            <p className="text-white/70">フォローしているユーザーの投稿がここに表示されます</p>
          </div>
        ) : (
          threadGroups.map((group) => (
            group.type === 'thread' ? (
              <SelfThreadItem 
                key={group.id} 
                posts={group.posts} 
                isNew={group.posts.some(p => newPostIds.has(p.uri))}
                onReplySuccess={refreshTimeline}
              />
            ) : (
              <TimelineThread 
                key={group.posts[0].uri} 
                post={group.posts[0]} 
                isNew={newPostIds.has(group.posts[0].uri)} 
                onReplySuccess={refreshTimeline}
              />
            )
          ))
        )}
      </div>

      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-white/60">これ以上の投稿はありません</div>
      )}

      {loadError && <div className="text-center py-4 text-red-400">{loadError}</div>}

      {showSnackbar && (
        <Snackbar
          message={`${newPostsCount}件の新しい投稿があります`}
          onClose={handleCloseSnackbar}
        />
      )}
    </div>
  );
};