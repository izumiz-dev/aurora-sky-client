import { BskyAgent, AppBskyFeedDefs } from '@atproto/api';
import type { Post } from '../types/post';
import type { SessionData } from '../types/session';

// フォローリストのキャッシュ
interface FollowingCache {
  dids: Set<string>;
  timestamp: number;
}

const followingCache: Map<string, FollowingCache> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5分間のキャッシュ

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

  // フォローしているユーザーのリストを取得（キャッシュを活用）
  let followingDids: Set<string>;

  const cachedFollowing = followingCache.get(session.did);
  const now = Date.now();

  if (cachedFollowing && now - cachedFollowing.timestamp < CACHE_DURATION) {
    // キャッシュが有効な場合は使用
    followingDids = cachedFollowing.dids;
  } else {
    // キャッシュが無効または存在しない場合は取得
    followingDids = new Set<string>();
    followingDids.add(session.did); // 自分自身も含める

    try {
      const followsResponse = await agent.getFollows({
        actor: session.did,
        limit: 100,
      });

      // ページネーションを使って全フォローを取得
      let followsCursor = followsResponse.data.cursor;
      followsResponse.data.follows.forEach((follow) => followingDids.add(follow.did));

      while (followsCursor) {
        const moreFollows = await agent.getFollows({
          actor: session.did,
          cursor: followsCursor,
          limit: 100,
        });
        moreFollows.data.follows.forEach((follow) => followingDids.add(follow.did));
        followsCursor = moreFollows.data.cursor;
      }

      // キャッシュに保存
      followingCache.set(session.did, {
        dids: followingDids,
        timestamp: now,
      });
    } catch (error) {
      console.error('Failed to fetch following list:', error);
      // フォローリストの取得に失敗した場合は、フィルタリングなしで全ポストを返す
      return processTimeline(response, session);
    }
  }

  // フィルタリングを適用
  return processTimeline(response, session, followingDids);
};

// FeedItemの型定義
type FeedItem = AppBskyFeedDefs.FeedViewPost;

// タイムラインを処理する関数
const processTimeline = (
  response: {
    data: {
      feed: AppBskyFeedDefs.FeedViewPost[];
      cursor?: string;
    };
  },
  _session: SessionData,
  followingDids?: Set<string>
): { feed: Post[]; cursor?: string } => {
  interface PostRecord {
    text?: string;
    createdAt?: string;
    facets?: unknown[];
    reply?: {
      parent: {
        uri: string;
        cid: string;
      };
    };
  }

  // ポストをフィルタリング
  const filteredFeed = response.data.feed.filter((item: FeedItem) => {
    const post = item.post as AppBskyFeedDefs.PostView;
    const record = post.record as PostRecord;

    // フィルタリングが無効な場合は全て表示
    if (!followingDids) {
      return true;
    }

    // 返信ではない通常のポストは表示
    if (!record.reply) {
      return true;
    }

    // 返信の場合、返信先を確認
    if (
      item.reply &&
      item.reply.parent &&
      'author' in item.reply.parent &&
      item.reply.parent.author
    ) {
      const parentAuthorDid = item.reply.parent.author.did;

      // 返信先がフォローしているユーザー（または自分）の場合は表示
      if (followingDids.has(parentAuthorDid)) {
        return true;
      }

      // 返信先がフォローしていないユーザーの場合は非表示
      return false;
    }

    // その他の場合は表示（安全側に倒す）
    return true;
  });

  const feed = filteredFeed.map((item: FeedItem) => {
    const post = item.post as AppBskyFeedDefs.PostView;
    const record = post.record as PostRecord;

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
      embed: post.embed,
      reply: item.reply || undefined,
    } as Post;
  });

  return {
    feed,
    cursor: response.data.cursor,
  };
};
