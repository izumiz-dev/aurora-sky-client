import { useAuth } from '../context/AuthContext';
import { PostComposer } from '../components/PostComposer';
import { PostItem } from '../components/PostItem';
import { Snackbar } from '../components/Snackbar';
import { useTimeline } from '../hooks/useTimeline';

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
  } = useTimeline(session, isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full glass-accent flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Blueskyへようこそ</h2>
          <p className="text-white/70 mb-6">タイムラインを表示するにはログインしてください</p>
          <a href="/login" className="glass-button btn-primary">
            ログインする
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <PostComposer />

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
            <div className="glass-spinner"></div>
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
          posts.map((post) => (
            <PostItem key={post.uri} post={post} isNew={newPostIds.has(post.uri)} />
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
