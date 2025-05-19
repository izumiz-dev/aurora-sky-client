import { useState } from 'preact/hooks';
import type { Post } from '../types/post';
import { formatTimeAgo } from '../utils/date';
import { RichContent } from './content/RichContent';
import { ContextMenu, postMenuItems } from './ContextMenu';
import { Snackbar } from './Snackbar';
import { CachedAvatar } from './CachedAvatar';
import { ThreadView } from './ThreadView';

interface PostItemProps {
  post: Post;
  isNew?: boolean;
  hideReplyTo?: boolean;
  inModal?: boolean;
}

export const PostItem = ({ post, isNew = false, hideReplyTo = false, inModal = false }: PostItemProps) => {
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

  // スレッド表示モーダルを開く
  const [showThreadModal, setShowThreadModal] = useState(false);

  const handleMenuAction = async (actionId: string) => {
    switch (actionId) {
      case 'reply':
        // モーダル内では新しいモーダルを開かない
        if (!inModal) {
          setShowThreadModal(true);
        }
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
        } ${animateAction === 'repost' ? 'repost-animation' : ''} ${!inModal ? 'cursor-pointer hover:bg-white/5' : ''} transition-colors`}
        onContextMenu={handleContextMenu}
        onClick={() => {
          if (!inModal) {
            setShowThreadModal(true);
          }
        }}
      >
        {/* 返信先の表示 */}
        {!hideReplyTo && (post.reply?.parent || post.record?.reply) && (
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
              {post.reply?.parent?.author ? (
                <a
                  href={`/profile/@${post.reply.parent.author.handle}`}
                  className="font-medium hover:underline ml-1"
                >
                  {post.reply.parent.author.displayName || post.reply.parent.author.handle}
                </a>
              ) : post.record?.reply ? (
                <span className="font-medium ml-1 text-white/50">
                  {/* record.replyは参照のみ持つため、詳細情報を表示できない */}
                  投稿への返信
                </span>
              ) : (
                <span className="font-medium ml-1">返信投稿</span>
              )}
            </span>
          </div>
        )}
        <div className="flex gap-3">
          <a
            href={`/profile/@${post.author.handle}`}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <CachedAvatar
              src={post.author.avatar}
              alt={post.author.displayName || post.author.handle}
              handle={post.author.handle}
              size="md"
            />
          </a>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
              <a
                href={`/profile/@${post.author.handle}`}
                className={`font-semibold text-white ${isNew ? 'shimmer-text' : ''} hover:underline max-w-[150px] sm:max-w-none truncate`}
              >
                {post.author.displayName || post.author.handle}
              </a>
              <div className="flex items-baseline gap-1 text-sm text-white/60">
                <a
                  href={`/profile/@${post.author.handle}`}
                  className="hover:underline max-w-[120px] sm:max-w-none truncate"
                >
                  @{post.author.handle}
                </a>
                <span>· {formatTimeAgo(new Date(post.record.createdAt))}</span>
              </div>
            </div>
            <div className="text-white">
              <RichContent text={post.record.text} embed={post.embed} facets={post.record.facets} inModal={inModal} />
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
      {showThreadModal && (
        <ThreadView 
          parentPost={post} 
          onClose={() => setShowThreadModal(false)} 
        />
      )}
    </>
  );
};
