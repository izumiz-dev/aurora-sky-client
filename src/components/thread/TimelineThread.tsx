import { type FunctionComponent } from 'preact';
import { useQuery } from '@tanstack/react-query';
import { getPostThread } from '../../lib/api';
import type { Post } from '../../types/post';
import type { ThreadViewPost } from '../../types/thread';
import { PostItem } from '../PostItem';

interface TimelineThreadProps {
  post: Post & { hideParentContext?: boolean };
  isNew?: boolean;
  onReplySuccess?: () => void;
}

export const TimelineThread: FunctionComponent<TimelineThreadProps> = ({
  post,
  isNew = false,
  onReplySuccess,
}) => {
  // 返信投稿の場合、親投稿を取得（ただしhideParentContextが設定されている場合はスキップ）
  // post.replyはAPI返答に含まれる親投稿情報、post.record.replyは投稿自体の返信情報
  const isReply = !!(post.reply?.parent || post.record?.reply);
  const shouldFetchParent = isReply && !post.hideParentContext;

  // デバッグ情報（開発環境のみ）
  /*
  if (import.meta.env.DEV && isReply) {
    console.log('TimelineThread: Reply detected', {
      postUri: post.uri,
      hasReplyParent: !!post.reply?.parent,
      hasRecordReply: !!post.record?.reply,
      hideParentContext: post.hideParentContext,
      shouldFetchParent,
      replyData: post.reply,
      recordReply: post.record?.reply,
    });
  }
  */

  const { data: threadData, isLoading } = useQuery({
    queryKey: ['thread', post.uri],
    queryFn: () =>
      getPostThread({
        uri: post.uri,
        depth: 10,
        parentHeight: 10,
      }),
    enabled: shouldFetchParent, // 親のコンテキストを隠す場合は無効化
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });

  // 単独投稿の場合、または親のコンテキストを隠す場合
  if (!isReply || post.hideParentContext) {
    return <PostItem post={post} isNew={isNew} onReplySuccess={onReplySuccess} />;
  }

  // ローディング中
  if (isLoading) {
    return <PostItem post={post} isNew={isNew} onReplySuccess={onReplySuccess} />;
  }

  // スレッドから最小限の親投稿を抽出
  const getMinimalThread = (thread: ThreadViewPost): Post[] => {
    const posts: Post[] = [];

    // 親投稿を再帰的に収集（最も遠い親から）
    const collectParents = (node: ThreadViewPost) => {
      if (node.parent && 'post' in node.parent) {
        collectParents(node.parent);
        posts.push(node.parent.post);
      }
    };

    collectParents(thread);

    // 現在の投稿
    posts.push(thread.post);

    // デバッグ情報（開発環境のみ）
    /*
    if (import.meta.env.DEV) {
      console.log('getMinimalThread: Thread collected', {
        threadRootUri: thread.post.uri,
        count: posts.length,
        posts: posts.map(p => ({ 
          uri: p.uri, 
          author: p.author.handle,
          text: p.record.text.slice(0, 50) + '...',
          hasParent: !!p.record?.reply?.parent,
        })),
        hasMoreParents: thread.parent?.parent ? 'yes' : 'no',
      });
    }
    */

    return posts;
  };

  if (!threadData?.data.thread) {
    return <PostItem post={post} isNew={isNew} onReplySuccess={onReplySuccess} />;
  }

  // デバッグ: 取得したスレッドデータの確認
  /*
  if (import.meta.env.DEV) {
    console.log('TimelineThread: Thread data received', {
      postUri: post.uri,
      threadStructure: {
        hasParent: !!('parent' in threadData.data.thread && threadData.data.thread.parent && 'post' in threadData.data.thread.parent),
        parentCount: 'post' in threadData.data.thread ? countParents(threadData.data.thread) : 0,
        hasReplies: !!('replies' in threadData.data.thread && threadData.data.thread.replies?.length),
        replyCount: ('replies' in threadData.data.thread ? (threadData.data.thread.replies?.length || 0) : 0) as number,
      },
    });
  }
  */

  // Type guard to check if the thread is a valid ThreadViewPost
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isThreadViewPost = (thread: any): thread is ThreadViewPost => {
    return thread && 'post' in thread && thread.post;
  };

  const threadPosts =
    threadData?.data?.thread && isThreadViewPost(threadData.data.thread)
      ? getMinimalThread(threadData.data.thread)
      : [];

  // スレッド表示する投稿を収集
  const displayPosts: Post[] = [];

  // 親投稿がある場合は追加（既にthreadPostsに全ての親が含まれている）
  if (threadPosts.length > 1) {
    // 最初の投稿から最後から2番目までが親投稿
    displayPosts.push(...threadPosts.slice(0, -1));
  }

  // 現在の投稿を追加（元のpostを使用）
  displayPosts.push(post);

  return (
    <div className="relative space-y-0">
      {/* 親投稿がある場合の接続線（アイコンの中心を通る） */}
      {displayPosts.length > 1 && (
        <div className="absolute left-[48px] top-20 bottom-8 w-0.5 bg-gradient-to-b from-white/30 via-white/20 to-white/10" />
      )}

      {displayPosts.map((displayPost, index, array) => {
        const isCurrent = displayPost.uri === post.uri;
        const isFirst = index === 0;
        const isLast = index === array.length - 1;

        return (
          <div key={displayPost.uri} className="relative">
            {/* 上部の接続線（最初の投稿以外） */}
            {!isFirst && <div className="absolute left-[48px] -top-4 h-4 w-0.5 bg-white/30" />}

            {/* 全ての投稿を同じスタイルで表示 */}
            <PostItem
              post={displayPost}
              isNew={isCurrent && isNew}
              hideReplyTo={index > 0}
              onReplySuccess={onReplySuccess}
            />

            {/* 投稿間のスペース（最後の投稿以外） */}
            {!isLast && <div className="h-4" />}
          </div>
        );
      })}
    </div>
  );
};
