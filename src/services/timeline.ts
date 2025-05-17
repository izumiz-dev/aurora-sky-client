import { BskyAgent, AppBskyFeedDefs } from '@atproto/api';
import type { Post } from '../types/post';
import type { SessionData } from '../types/session';

export const fetchTimeline = async (
  session: SessionData,
  cursor?: string
): Promise<{ feed: Post[]; cursor?: string }> => {
  if (!session) {
    throw new Error('セッションがありません');
  }

  const agent = new BskyAgent({ service: 'https://bsky.social' });
  // @ts-ignore - Session type mismatch
  await agent.resumeSession(session);

  const response = await agent.getTimeline({ cursor, limit: 20 });

  const feed = response.data.feed.map((item: any) => {
    const post = item.post as AppBskyFeedDefs.PostView;
    const record = post.record as any;

    return {
      uri: post.uri,
      cid: post.cid,
      author: {
        did: post.author.did,
        handle: post.author.handle,
        displayName: post.author.displayName || post.author.handle,
        avatar: post.author.avatar || '',
      },
      record: {
        text: record.text || '',
        createdAt: record.createdAt || new Date().toISOString(),
        facets: record.facets || [],
        reply: record.reply || undefined,
      },
      likeCount: post.likeCount || 0,
      replyCount: post.replyCount || 0,
      repostCount: post.repostCount || 0,
      viewer: post.viewer,
      embed: post.embed as any,
      reply: item.reply || undefined,
    } as Post;
  });

  return {
    feed,
    cursor: response.data.cursor,
  };
};
