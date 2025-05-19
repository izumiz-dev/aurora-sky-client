import { type FunctionComponent } from 'preact';
import type { ThreadViewPost } from '../types/thread';
import { PostItem } from './PostItem';

interface ThreadDisplayProps {
  thread: ThreadViewPost;
  showConnector?: boolean;
  isLastInThread?: boolean;
  previousPost?: ThreadViewPost | null;
}

export const ThreadDisplay: FunctionComponent<ThreadDisplayProps> = ({ 
  thread, 
  showConnector = true,
  isLastInThread = false,
  previousPost = null
}) => {
  // 直上のポストが返信先かどうかをチェック
  const isDirectReplyToPrevious = previousPost && 
    thread.post.record?.reply?.parent?.uri === previousPost.post.uri;
  
  return (
    <div className="relative">
      {/* ポスト間の接続線 */}
      {showConnector && !isLastInThread && (
        <div className="absolute left-8 top-[60px] bottom-0 w-0.5 bg-gradient-to-b from-white/30 to-white/10 pointer-events-none animate-fade-in" />
      )}
      
      {/* 前のポストとの接続線（上部） */}
      {showConnector && previousPost && (
        <div className="absolute left-8 -top-4 h-4 w-0.5 bg-white/30 pointer-events-none" />
      )}
      
      {/* ポストの表示 */}
      <div className="relative z-10">
        <PostItem 
          post={thread.post}
          hideReplyTo={isDirectReplyToPrevious || false}
        />
      </div>
      
      {/* 返信の表示 */}
      {thread.replies && thread.replies.length > 0 && (
        <div className="space-y-4">
          {thread.replies.map((reply, index) => (
            <ThreadDisplay 
              key={reply.post.uri}
              thread={reply}
              showConnector={true}
              isLastInThread={index === (thread.replies?.length || 0) - 1}
              previousPost={thread}
            />
          ))}
        </div>
      )}
    </div>
  );
};