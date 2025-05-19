import { useMemo } from 'preact/hooks';
import type { Post } from '../types/post';

interface DeduplicatedPost extends Post {
  hideParentContext?: boolean;
}

export const useDeduplicatedTimeline = (posts: Post[]): DeduplicatedPost[] => {
  return useMemo(() => {
    // 全ての投稿のURIを収集
    const postUris = new Set(posts.map(post => post.uri));
    
    // デバッグ情報（開発環境のみ）
    if (import.meta.env.DEV) {
      console.log('useDeduplicatedTimeline: Processing posts', {
        totalPosts: posts.length,
        uniqueUris: postUris.size,
        duplicates: posts.length - postUris.size
      });
    }
    
    // 返信でその親が既に表示されている投稿をマーク
    const processedPosts = posts.map(post => {
      const isReply = post.reply?.parent || post.record?.reply;
      
      if (isReply) {
        // 親投稿のURIを取得（複数ソースから確認）
        const parentUri = post.reply?.parent?.uri || post.record?.reply?.parent?.uri;
        
        // 親が既にタイムラインに存在する場合はコンテキスト非表示フラグを設定
        if (parentUri && postUris.has(parentUri)) {
          if (import.meta.env.DEV) {
            console.log('useDeduplicatedTimeline: Hiding parent context', {
              postUri: post.uri,
              parentUri,
              parentInTimeline: true
            });
          }
          
          return {
            ...post,
            hideParentContext: true
          };
        }
      }
      
      return post;
    });
    
    return processedPosts;
  }, [posts]);
};