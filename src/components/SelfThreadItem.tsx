import { useState } from 'preact/hooks';
import { PostItem } from './PostItem';
import type { Post } from '../types/post';

interface SelfThreadItemProps {
  posts: Post[];
  isNew?: boolean;
  onReplySuccess?: () => void;
}

export const SelfThreadItem = ({ posts, isNew = false, onReplySuccess }: SelfThreadItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (posts.length === 0) return null;

  const mainPost = posts[0];
  const threadCount = posts.length - 1;

  return (
    <div className="relative">
      {/* スレッドインジケーター */}
      {threadCount > 0 && <div className="absolute left-12 top-20 bottom-0 w-0.5 bg-white/20" />}

      {/* メイン投稿 */}
      <PostItem post={mainPost} isNew={isNew} onReplySuccess={onReplySuccess} />

      {/* スレッド展開ボタン */}
      {threadCount > 0 && (
        <div className="relative z-10 ml-12 -mt-2 mb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:text-white 
                       bg-black/50 hover:bg-black/70 rounded-full transition-all duration-200"
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <span>{isExpanded ? 'スレッドを折りたたむ' : `続きを表示 (${threadCount}件)`}</span>
          </button>
        </div>
      )}

      {/* スレッドの残りの投稿 */}
      {isExpanded && threadCount > 0 && (
        <div className="space-y-0">
          {posts.slice(1).map((post, index) => (
            <div key={post.uri} className="relative">
              {/* 最後の投稿以外に接続線を表示 */}
              {index < threadCount - 1 && (
                <div className="absolute left-12 top-0 h-full w-0.5 bg-white/20" />
              )}
              <div className="relative">
                {/* 投稿への接続線 */}
                <div className="absolute left-12 top-8 w-8 h-0.5 bg-white/20" />
                <PostItem post={post} onReplySuccess={onReplySuccess} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
