import { useState } from 'preact/hooks';
import type { Post } from '../types/post';
import { formatTimeAgo } from '../utils/date';
import { RichContent } from './content/RichContent';
import { ContextMenu, postMenuItems } from './ContextMenu';
import { Snackbar } from './Snackbar';

interface PostItemProps {
  post: Post;
  isNew?: boolean;
}

export const PostItem = ({ post, isNew = false }: PostItemProps) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string } | null>(null);
  const [liked, setLiked] = useState(post.viewer?.like ?? false);
  const [reposted, setReposted] = useState(post.viewer?.repost ?? false);
  const [animateAction, setAnimateAction] = useState<'like' | 'repost' | null>(null);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleMenuAction = async (actionId: string) => {
    switch (actionId) {
      case 'reply':
        // TODO: リプライ機能の実装
        // TODO: Implement reply functionality
        break;
      case 'repost':
        // すぐにアニメーションを開始
        setReposted(true);
        setAnimateAction('repost');

        // API呼び出しは非同期で
        (async () => {
          try {
            const { repost } = await import('../lib/api');
            await repost(post.uri, post.cid);
            setSnackbar({ message: 'リポストしました' });
          } catch (error) {
            console.error('Failed to repost:', error);
            setReposted(false); // 失敗時は元に戻す
            setSnackbar({ message: 'リポストに失敗しました' });
          }
        })();

        // アニメーション後にリセット（5秒に延長）
        setTimeout(() => setAnimateAction(null), 5000);
        break;
      case 'like':
        // すぐにアニメーションを開始
        setLiked(true);
        setAnimateAction('like');

        // API呼び出しは非同期で
        (async () => {
          try {
            const { likePost } = await import('../lib/api');
            await likePost(post.uri, post.cid);
            setSnackbar({ message: 'いいねしました' });
          } catch (error) {
            console.error('Failed to like:', error);
            setLiked(false); // 失敗時は元に戻す
            setSnackbar({ message: 'いいねに失敗しました' });
          }
        })();

        // アニメーション後にリセット（5秒に延長）
        setTimeout(() => setAnimateAction(null), 5000);
        break;
      case 'copy-link': {
        // bsky.appの投稿URLを生成してコピー
        const postUrl = `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`;
        try {
          await navigator.clipboard.writeText(postUrl);
          setSnackbar({ message: 'リンクをコピーしました' });
        } catch (error) {
          console.error('Failed to copy link:', error);
          setSnackbar({ message: 'リンクのコピーに失敗しました' });
        }
        break;
      }
    }
    closeContextMenu();
  };

  return (
    <>
      <div
        className={`glass-card p-6 ${isNew ? 'ambient-fade-in ambient-glow' : ''} ${
          liked ? 'liked-post' : ''
        } ${reposted ? 'reposted-post' : ''} ${
          animateAction === 'like' ? 'like-animation' : ''
        } ${animateAction === 'repost' ? 'repost-animation' : ''}`}
        onContextMenu={handleContextMenu}
      >
        {/* 返信先の表示 */}
        {(post.reply?.parent || post.record?.reply) && (
          <div className="flex items-center gap-2 mb-3 text-white/60 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            <span>
              返信先:
              {post.reply?.parent ? (
                <a
                  href={`/profile/@${post.reply.parent.author.handle}`}
                  className="font-medium hover:underline ml-1"
                >
                  {post.reply.parent.author.displayName || post.reply.parent.author.handle}
                </a>
              ) : (
                <span className="font-medium ml-1">返信投稿（詳細情報なし）</span>
              )}
            </span>
          </div>
        )}
        <div className="flex gap-3">
          <a
            href={`/profile/@${post.author.handle}`}
            className="avatar avatar-md flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <img
              src={post.author.avatar || 'https://via.placeholder.com/48'}
              alt={post.author.displayName || post.author.handle}
            />
          </a>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <a
                href={`/profile/@${post.author.handle}`}
                className={`font-semibold text-white ${isNew ? 'shimmer-text' : ''} hover:underline`}
              >
                {post.author.displayName || post.author.handle}
              </a>
              <a
                href={`/profile/@${post.author.handle}`}
                className="text-sm text-white/60 hover:underline"
              >
                @{post.author.handle}
              </a>
              <span className="text-sm text-white/60">
                · {formatTimeAgo(new Date(post.record.createdAt))}
              </span>
            </div>
            <div className="text-white">
              <RichContent text={post.record.text} embed={post.embed} facets={post.record.facets} />
            </div>
          </div>
        </div>
      </div>
      {contextMenu && (
        <ContextMenu
          items={postMenuItems}
          position={contextMenu}
          onClose={closeContextMenu}
          onItemClick={handleMenuAction}
        />
      )}
      {snackbar && <Snackbar message={snackbar.message} onClose={() => setSnackbar(null)} />}
    </>
  );
};
