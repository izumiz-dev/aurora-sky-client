import { type FunctionComponent } from 'preact';
import { useQuery } from '@tanstack/react-query';
import { getPostThread } from '../../lib/api';
import type { Post } from '../../types/post';
import type { ThreadViewPost } from '../../types/thread';
import { PostItem } from '../PostItem';
import { ErrorAlert } from '../ErrorAlert';
import { AuroraLoader } from '../AuroraLoader';

interface FullThreadViewProps {
  post: Post;
}

export const FullThreadView: FunctionComponent<FullThreadViewProps> = ({ post }) => {
  const { data: threadData, isLoading, error } = useQuery({
    queryKey: ['thread', post.uri],
    queryFn: () => getPostThread({ 
      uri: post.uri,
      depth: 10, // より深い階層を取得
      parentHeight: 10, // より多くの親を取得
    }),
  });

  // スレッド全体をフラット化する関数
  const flattenFullThread = (thread: ThreadViewPost): Post[] => {
    const posts: Post[] = [];
    
    // 親を再帰的に収集
    const collectAllParents = (node: ThreadViewPost) => {
      if (node.parent && 'post' in node.parent) {
        collectAllParents(node.parent);
      }
      posts.push(node.post);
    };
    
    // 返信を再帰的に収集
    const collectAllReplies = (node: ThreadViewPost, depth = 0) => {
      if (node.replies && node.replies.length > 0 && depth < 10) { // 深さ制限
        for (const reply of node.replies) {
          posts.push(reply.post);
          collectAllReplies(reply, depth + 1);
        }
      }
    };
    
    // 親を収集
    if (thread.parent && 'post' in thread.parent) {
      collectAllParents(thread.parent);
    }
    
    // 現在のノード
    posts.push(thread.post);
    
    // 返信を収集
    collectAllReplies(thread);
    
    // 重複を除去
    const uniquePosts = posts.filter((post, index, self) => 
      index === self.findIndex(p => p.uri === post.uri)
    );
    
    return uniquePosts;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <AuroraLoader />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorAlert 
        error={error} 
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!threadData?.data.thread) {
    return (
      <div className="text-center py-8 text-white/60">
        スレッドが見つかりませんでした
      </div>
    );
  }

  // Type guard to check if the thread is a valid ThreadViewPost
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isThreadViewPost = (thread: any): thread is ThreadViewPost => {
    return thread && 'post' in thread && thread.post;
  };

  if (!isThreadViewPost(threadData.data.thread)) {
    return (
      <div className="text-center py-8 text-white/60">
        スレッドが見つかりませんでした
      </div>
    );
  }

  const threadPosts = flattenFullThread(threadData.data.thread);

  return (
    <div className="relative space-y-0">
      {/* メインの接続線（アイコンの中心を通る） */}
      {threadPosts.length > 1 && (
        <div className="absolute left-[48px] top-20 bottom-0 w-0.5 bg-gradient-to-b from-white/30 via-white/20 to-white/10" />
      )}
      
      {threadPosts.map((threadPost, index, array) => {
        // const isOriginalPost = threadPost.uri === post.uri;
        const prevPost = index > 0 ? array[index - 1] : null;
        const isDirectReply = prevPost && 
          threadPost.record?.reply?.parent?.uri === prevPost.uri;
        
        return (
          <div key={threadPost.uri} className="relative">
            {/* 上部の接続線（アイコンの中心） */}
            {index > 0 && (
              <div className="absolute left-[48px] -top-4 h-4 w-0.5 bg-white/30" />
            )}
            
            {/* 投稿表示 */}
            <PostItem 
              post={threadPost} 
              hideReplyTo={isDirectReply || false}
              inModal={true}
            />
            
            {/* スペーシング */}
            {index < array.length - 1 && <div className="h-4" />}
          </div>
        );
      })}
    </div>
  );
};