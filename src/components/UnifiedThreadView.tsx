import { useState } from 'preact/hooks';
import { useQuery } from '@tanstack/react-query';
import { getPostThread } from '../lib/api';
import type { Post } from '../types/post';
import type { ThreadViewPost } from '../types/thread';
import { PostItem } from './PostItem';

interface UnifiedThreadViewProps {
  post: Post;
  isNew?: boolean;
  mode?: 'inline' | 'expanded' | 'modal';
  onClose?: () => void;
  showConnectors?: boolean;
  depth?: number;
}

interface ThreadNodeProps {
  node: any;
  currentDepth: number;
  maxDepth: number;
  showConnectors: boolean;
  isMainPost: boolean;
  previousPost?: ThreadViewPost | null;
}

const ThreadNode = ({
  node,
  currentDepth,
  maxDepth,
  showConnectors,
  isMainPost,
  previousPost,
}: ThreadNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasReplies = node.replies && node.replies.length > 0;
  const isAtMaxDepth = currentDepth >= maxDepth;

  // 直接の返信かどうかをチェック
  const isDirectReply =
    previousPost && node.post.record?.reply?.parent?.uri === previousPost.post.uri;

  return (
    <div className="relative">
      {/* 接続線（最初の投稿以外） */}
      {showConnectors && !isMainPost && (
        <div className="absolute left-8 -top-4 h-4 w-0.5 bg-gradient-to-b from-white/20 to-white/30" />
      )}

      {/* 下への接続線（返信がある場合） */}
      {showConnectors && hasReplies && isExpanded && (
        <div className="absolute left-8 top-[60px] bottom-0 w-0.5 bg-gradient-to-b from-white/30 to-white/10" />
      )}

      {/* 投稿本体 */}
      <div className={isMainPost ? '' : 'mt-4'}>
        <PostItem post={node.post} hideReplyTo={isDirectReply || false} isNew={false} />
      </div>

      {/* 返信の展開/折りたたみボタン */}
      {hasReplies && !isAtMaxDepth && (
        <div className="mt-2 ml-16">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:text-white 
                       bg-white/5 hover:bg-white/10 rounded-full transition-all duration-200"
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
            <span>{isExpanded ? '返信を隠す' : `返信を表示 (${node.replies!.length}件)`}</span>
          </button>
        </div>
      )}

      {/* 返信の表示 */}
      {hasReplies && isExpanded && !isAtMaxDepth && (
        <div className="space-y-0">
          {node.replies!.map((reply: any) => (
            <ThreadNode
              key={reply.post.uri}
              node={reply}
              currentDepth={currentDepth + 1}
              maxDepth={maxDepth}
              showConnectors={showConnectors}
              isMainPost={false}
              previousPost={node}
            />
          ))}
        </div>
      )}

      {/* 深さ制限に達した場合のメッセージ */}
      {hasReplies && isAtMaxDepth && (
        <div className="mt-2 ml-16 text-sm text-white/50">
          さらに{node.replies!.length}件の返信があります
        </div>
      )}
    </div>
  );
};

export const UnifiedThreadView = ({
  post,
  isNew = false,
  mode = 'inline',
  onClose,
  showConnectors = true,
  depth = 3,
}: UnifiedThreadViewProps) => {
  const [isThreadVisible, setIsThreadVisible] = useState(mode === 'expanded');

  const { data, isLoading, error } = useQuery({
    queryKey: ['thread', post.uri],
    queryFn: () => getPostThread({ uri: post.uri, depth }),
    enabled: isThreadVisible || mode === 'modal',
  });

  const hasReplies = (post.replyCount ?? 0) > 0;
  const isReply = !!post.reply?.parent || !!post.record?.reply;
  const showThreadButton = (hasReplies || isReply) && mode === 'inline';

  if (mode === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="relative z-10 max-w-4xl mx-auto h-full overflow-y-auto">
          <div className="sticky top-0 bg-black/80 backdrop-blur-md p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">スレッド</h2>
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
          <div className="p-4">{renderThreadContent()}</div>
        </div>
      </div>
    );
  }

  function renderThreadContent() {
    if (error) {
      return <div className="text-red-400 text-center py-4">スレッドの読み込みに失敗しました</div>;
    }

    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!data?.data.thread || !('post' in data.data.thread)) {
      return <PostItem post={post} isNew={isNew} />;
    }

    return (
      <ThreadNode
        node={data.data.thread}
        currentDepth={0}
        maxDepth={depth}
        showConnectors={showConnectors}
        isMainPost={true}
        previousPost={null}
      />
    );
  }

  return (
    <div className="relative">
      {/* メイン投稿 */}
      <PostItem post={post} isNew={isNew} />

      {/* スレッド表示ボタン（インラインモードのみ） */}
      {showThreadButton && (
        <div className="mt-3 ml-16">
          <button
            onClick={() => setIsThreadVisible(!isThreadVisible)}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {isThreadVisible ? 'スレッドを閉じる' : 'スレッドを表示'}
            {hasReplies && <span className="text-white/40">({post.replyCount})</span>}
          </button>
        </div>
      )}

      {/* スレッド表示 */}
      {isThreadVisible && <div className="mt-4">{renderThreadContent()}</div>}
    </div>
  );
};
