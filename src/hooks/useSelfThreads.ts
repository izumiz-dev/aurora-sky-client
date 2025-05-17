import { useMemo } from 'preact/hooks';
import type { Post } from '../types/post';

interface ThreadGroup {
  id: string;
  posts: Post[];
  type: 'single' | 'thread';
}

export const useSelfThreads = (posts: Post[]): ThreadGroup[] => {
  return useMemo(() => {
    const threadGroups: ThreadGroup[] = [];
    const processedUris = new Set<string>();
    
    for (const post of posts) {
      if (processedUris.has(post.uri)) continue;
      
      // 自分の投稿への返信の場合
      if (post.reply?.parent && post.author.did === post.reply.parent.author?.did) {
        // すでに処理済みの親投稿を探す
        const parentGroup = threadGroups.find(group => 
          group.posts.some(p => p.uri === post.reply?.parent.uri)
        );
        
        if (parentGroup) {
          // 既存のスレッドに追加
          parentGroup.posts.push(post);
          processedUris.add(post.uri);
          continue;
        }
      }
      
      // 新しいグループを作成（単一投稿またはスレッドの開始）
      const thread: Post[] = [post];
      processedUris.add(post.uri);
      
      // この投稿への自己返信を探す
      let currentPost = post;
      while (true) {
        const reply = posts.find(p => 
          !processedUris.has(p.uri) &&
          p.reply?.parent.uri === currentPost.uri &&
          p.author.did === currentPost.author.did
        );
        
        if (!reply) break;
        
        thread.push(reply);
        processedUris.add(reply.uri);
        currentPost = reply;
      }
      
      threadGroups.push({
        id: post.uri,
        posts: thread,
        type: thread.length > 1 ? 'thread' : 'single'
      });
    }
    
    return threadGroups;
  }, [posts]);
};