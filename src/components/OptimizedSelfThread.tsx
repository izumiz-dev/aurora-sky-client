import { useState } from 'preact/hooks';
import type { Post } from '../types/post';
import { PostItem } from './PostItem';

interface OptimizedSelfThreadProps {
  posts: Post[];
  isNew?: boolean;
  maxInitialDisplay?: number;
  showConnectors?: boolean;
}

export const OptimizedSelfThread = ({
  posts,
  isNew = false,
  maxInitialDisplay = 3,
  showConnectors = true,
}: OptimizedSelfThreadProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (posts.length === 0) return null;

  const threadCount = posts.length;
  const initialPosts = posts.slice(0, maxInitialDisplay);
  const remainingPosts = posts.slice(maxInitialDisplay);
  const hasMore = remainingPosts.length > 0;

  return (
    <div className="relative">
      {/* スレッド全体の接続線 */}
      {showConnectors && threadCount > 1 && (
        <div
          className="absolute left-12 w-0.5 bg-gradient-to-b from-white/30 to-white/10"
          style={{
            top: '80px',
            bottom: hasMore && !isExpanded ? `${60}px` : '20px',
          }}
        />
      )}

      {/* 初期表示の投稿 */}
      <div className="space-y-0">
        {initialPosts.map((post, index) => (
          <div key={post.uri} className="relative">
            {/* 投稿への接続線（最初の投稿以外） */}
            {showConnectors && index > 0 && (
              <div className="absolute left-12 -top-4 h-4 w-0.5 bg-white/20" />
            )}

            <PostItem post={post} isNew={isNew && index === 0} hideReplyTo={index > 0} />
          </div>
        ))}
      </div>

      {/* 展開ボタン */}
      {hasMore && (
        <div className="relative z-10 ml-12 mt-2">
          {showConnectors && <div className="absolute left-0 -top-2 h-2 w-0.5 bg-white/20" />}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:text-white 
                       bg-black/50 hover:bg-black/70 rounded-full transition-all duration-200
                       shadow-lg hover:shadow-xl"
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
            <span>
              {isExpanded ? 'スレッドを折りたたむ' : `続きを表示 (${remainingPosts.length}件)`}
            </span>
          </button>
        </div>
      )}

      {/* 展開された投稿 */}
      {isExpanded && hasMore && (
        <div className="space-y-0 mt-0">
          {remainingPosts.map((post) => (
            <div key={post.uri} className="relative">
              {/* 投稿への接続線 */}
              {showConnectors && <div className="absolute left-12 -top-4 h-4 w-0.5 bg-white/20" />}

              <PostItem post={post} hideReplyTo={true} />
            </div>
          ))}
        </div>
      )}

      {/* スレッド終端のインジケーター */}
      {showConnectors && (
        <div className="relative">
          <div className="absolute left-12 -top-4 w-6 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
          <div className="absolute left-12 -top-4 w-2 h-2 bg-white/30 rounded-full" />
        </div>
      )}
    </div>
  );
};
