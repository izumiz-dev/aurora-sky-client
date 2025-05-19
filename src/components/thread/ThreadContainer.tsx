import { useState } from 'preact/hooks';
import { useQuery } from '@tanstack/react-query';
import { getPostThread } from '../../lib/api';
import type { Post } from '../../types/post';
import type { ThreadViewPost } from '../../types/thread';
import { PostItem } from '../PostItem';

interface ThreadContainerProps {
  post: Post;
  isNew?: boolean;
  inline?: boolean; // インライン表示かモーダル表示か
}

export const ThreadContainer = ({ post, isNew = false }: ThreadContainerProps) => {
  const [expanded, setExpanded] = useState(false);

  // スレッドデータの取得
  const { data: threadData, isLoading, error } = useQuery({
    queryKey: ['thread', post.uri],
    queryFn: () => getPostThread({ uri: post.uri }),
    enabled: expanded,
  });

  // スレッドの存在確認
  const hasThread = (post.replyCount && post.replyCount > 0) || post.reply?.parent || post.record?.reply;

  if (!hasThread) {
    return <PostItem post={post} isNew={isNew} />;
  }

  // スレッドをフラット化する関数
  const flattenThread = (thread: any): Post[] => {
    const posts: Post[] = [];
    
    // 親を辿って収集（最上位から順に）
    const collectParents = (node: any) => {
      if (node.parent && 'post' in node.parent) {
        collectParents(node.parent);
      }
      posts.push(node.post);
    };
    
    // 返信を収集（深さ優先）
    const collectReplies = (node: ThreadViewPost) => {
      if (node.replies) {
        for (const reply of node.replies) {
          posts.push(reply.post);
          collectReplies(reply);
        }
      }
    };
    
    // 親を収集（現在のノード含む）
    if (thread.parent && 'post' in thread.parent) {
      collectParents(thread.parent);
    }
    
    // 現在のノードを追加
    posts.push(thread.post);
    
    // 子を収集
    collectReplies(thread);
    
    // 重複を除去（現在のポストが重複する可能性があるため）
    const uniquePosts = posts.filter((post, index, self) => 
      index === self.findIndex(p => p.uri === post.uri)
    );
    
    return uniquePosts;
  };

  return (
    <div className="relative">
      {/* メインポスト */}
      <PostItem post={post} isNew={isNew} />
      
      {/* スレッド展開ボタン */}
      <div className="ml-16 mt-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-all"
        >
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{expanded ? 'スレッドを閉じる' : 'スレッドを表示'}</span>
          {post.replyCount && post.replyCount > 0 && (
            <span className="text-white/40">({post.replyCount})</span>
          )}
        </button>
      </div>
      
      {/* スレッド表示 */}
      {expanded && (
        <div className="mt-4 animate-fade-in">
          {isLoading && (
            <div className="text-white/60 text-center py-4">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white/60 rounded-full" />
              <span className="ml-2">読み込み中...</span>
            </div>
          )}
          
          {error && (
            <div className="text-red-400 text-center py-4">
              スレッドの読み込みに失敗しました
            </div>
          )}
          
          {threadData?.data.thread && (
            <div className="relative">
              {/* メインの接続線 */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/30 to-white/10" />
              
              {/* スレッドポスト */}
              <div className="space-y-0">
                {flattenThread(threadData.data.thread).map((threadPost, index, array) => {
                  // 現在のポストはスキップ
                  if (threadPost.uri === post.uri) return null;
                  
                  // 直前のポストとの関係を確認
                  const prevPost = index > 0 ? array[index - 1] : null;
                  const isDirectReply = prevPost && 
                    threadPost.record?.reply?.parent?.uri === prevPost.uri;
                  
                  // 親の確認（現在のポストが最初に表示される親の場合）
                  const isParentOfCurrent = threadPost.uri === post.record?.reply?.parent?.uri;
                  
                  return (
                    <div key={threadPost.uri} className="relative transition-all">
                      {/* 上部の接続点 */}
                      {(index === 0 || array[index - 1]?.uri === post.uri) && (
                        <div className="absolute left-8 -top-4 h-4 w-0.5 bg-white/30" />
                      )}
                      
                      <PostItem
                        post={threadPost}
                        hideReplyTo={isDirectReply || false}
                      />
                      
                      {/* 現在のポストとの間に特別な表示 */}
                      {isParentOfCurrent && (
                        <div className="relative h-4">
                          <div className="absolute left-8 top-0 h-full w-0.5 bg-white/40" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};