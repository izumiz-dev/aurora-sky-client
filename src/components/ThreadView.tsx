import { useState } from 'preact/hooks';
import { useQuery } from '@tanstack/react-query';
import { getPostThread } from '../lib/api';
import type { Post } from '../types/post';
import type { ThreadViewPost } from '../types/thread';
import { PostItem } from './PostItem';
import { ErrorAlert } from './ErrorAlert';

interface ThreadViewProps {
  parentPost: Post;
  onClose?: () => void;
}

export const ThreadView = ({ parentPost, onClose }: ThreadViewProps) => {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ['thread', parentPost.uri],
    queryFn: () => getPostThread({ uri: parentPost.uri }),
  });

  const toggleThread = (uri: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(uri)) {
        next.delete(uri);
      } else {
        next.add(uri);
      }
      return next;
    });
  };

  const renderThreadPost = (threadPost: ThreadViewPost, depth: number = 0) => {
    const { post, replies } = threadPost;
    const hasReplies = replies && replies.length > 0;
    const isExpanded = expandedThreads.has(post.uri);

    return (
      <div key={post.uri} className={`${depth > 0 ? 'border-l-2 border-white/10 pl-4' : ''}`}>
        <PostItem
          post={post}
          showReplies={false}
        />
        {hasReplies && (
          <>
            <button
              onClick={() => toggleThread(post.uri)}
              className="mt-2 ml-4 flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
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
              {isExpanded ? 'スレッドを閉じる' : `${replies.length}件の返信を表示`}
            </button>
            {isExpanded && (
              <div className="mt-4 space-y-4">
                {replies.map((reply) => renderThreadPost(reply, depth + 1))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <ErrorAlert
        error={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 max-w-4xl mx-auto h-full overflow-y-auto">
        <div className="sticky top-0 bg-black/80 backdrop-blur-md p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">スレッド表示</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : data?.data.thread && 'post' in data.data.thread ? (
            renderThreadPost(data.data.thread as any)
          ) : (
            <div className="text-center py-8 text-white/60">
              スレッドが見つかりませんでした
            </div>
          )}
        </div>
      </div>
    </div>
  );
};