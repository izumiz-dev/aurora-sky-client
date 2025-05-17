import { PostItem } from '../components/PostItem';
import type { Post } from '../types/post';

// Test data with various embed types based on actual AT Protocol view formats
const testPosts: Post[] = [
  // Quote post (app.bsky.embed.record#view)
  {
    uri: 'at://did:example:123/app.bsky.feed.post/xyz123',
    cid: 'xyz123',
    author: {
      did: 'did:example:123',
      handle: 'user.bsky.social',
      displayName: 'Test User',
      avatar: 'https://cdn.bsky.social/img/avatar/plain/did:example:123/xyz@jpeg',
    },
    record: {
      text: 'Check out this amazing post!',
      createdAt: new Date().toISOString(),
      facets: [],
    },
    likeCount: 10,
    replyCount: 5,
    repostCount: 3,
    embed: {
      $type: 'app.bsky.embed.record#view',
      record: {
        $type: 'app.bsky.embed.record#viewRecord',
        uri: 'at://did:example:456/app.bsky.feed.post/abc456',
        cid: 'abc456',
        author: {
          did: 'did:example:456',
          handle: 'quoted.bsky.social',
          displayName: 'Quoted User',
          avatar: 'https://cdn.bsky.social/img/avatar/plain/did:example:456/abc@jpeg',
        },
        value: {
          $type: 'app.bsky.feed.post',
          text: 'This is the quoted post content with some interesting insights about AT Protocol',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      },
    } as any,
  },

  // External embed with thumbnail (app.bsky.embed.external#view)
  {
    uri: 'at://did:example:789/app.bsky.feed.post/def789',
    cid: 'def789',
    author: {
      did: 'did:example:789',
      handle: 'news.bsky.social',
      displayName: 'News Account',
      avatar: '',
    },
    record: {
      text: 'Latest news article: https://example.com/news',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      facets: [
        {
          index: { byteStart: 21, byteEnd: 45 },
          features: [
            {
              $type: 'app.bsky.richtext.facet#link',
              uri: 'https://example.com/news',
            },
          ],
        },
      ],
    },
    embed: {
      $type: 'app.bsky.embed.external#view',
      external: {
        uri: 'https://example.com/news',
        title: 'Breaking News: Important Update About AT Protocol',
        description:
          'This article discusses the latest developments in the AT Protocol ecosystem...',
        thumb:
          'https://cdn.bsky.social/img/feed_thumbnail/plain/did:example:789/bafkreiexample123@jpeg',
      },
    } as any,
  },

  // YouTube video as external embed
  {
    uri: 'at://did:example:101/app.bsky.feed.post/ghi101',
    cid: 'ghi101',
    author: {
      did: 'did:example:101',
      handle: 'creator.bsky.social',
      displayName: 'Content Creator',
      avatar: '',
    },
    record: {
      text: 'Check out my new video! https://youtube.com/watch?v=dQw4w9WgXcQ',
      createdAt: new Date(Date.now() - 2700000).toISOString(),
      facets: [
        {
          index: { byteStart: 24, byteEnd: 63 },
          features: [
            {
              $type: 'app.bsky.richtext.facet#link',
              uri: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
            },
          ],
        },
      ],
    },
    embed: {
      $type: 'app.bsky.embed.external#view',
      external: {
        uri: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up (Official Video)',
        description: 'Rick Astley\'s official music video for "Never Gonna Give You Up"',
        thumb: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      },
    } as any,
  },

  // Images embed (app.bsky.embed.images#view)
  {
    uri: 'at://did:example:202/app.bsky.feed.post/jkl202',
    cid: 'jkl202',
    author: {
      did: 'did:example:202',
      handle: 'photographer.bsky.social',
      displayName: 'Photographer',
      avatar: '',
    },
    record: {
      text: 'Beautiful sunset today! 🌅',
      createdAt: new Date(Date.now() - 5400000).toISOString(),
      facets: [],
    },
    embed: {
      $type: 'app.bsky.embed.images#view',
      images: [
        {
          thumb:
            'https://cdn.bsky.social/img/feed_thumbnail/plain/did:example:202/bafkreisunset123@jpeg',
          fullsize:
            'https://cdn.bsky.social/img/feed_fullsize/plain/did:example:202/bafkreisunset123@jpeg',
          alt: 'A beautiful sunset over the ocean with orange and purple clouds',
        },
        {
          thumb:
            'https://cdn.bsky.social/img/feed_thumbnail/plain/did:example:202/bafkreisunset456@jpeg',
          fullsize:
            'https://cdn.bsky.social/img/feed_fullsize/plain/did:example:202/bafkreisunset456@jpeg',
          alt: 'Close-up of the sun setting behind mountains',
        },
      ],
    } as any,
  },

  // Record with media (quote post with images)
  {
    uri: 'at://did:example:303/app.bsky.feed.post/mno303',
    cid: 'mno303',
    author: {
      did: 'did:example:303',
      handle: 'combo.bsky.social',
      displayName: 'Combo User',
      avatar: '',
    },
    record: {
      text: 'Adding context to this post with an image',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      facets: [],
    },
    embed: {
      $type: 'app.bsky.embed.recordWithMedia#view',
      record: {
        record: {
          $type: 'app.bsky.embed.record#viewRecord',
          uri: 'at://did:example:456/app.bsky.feed.post/xyz999',
          cid: 'xyz999',
          author: {
            did: 'did:example:456',
            handle: 'original.bsky.social',
            displayName: 'Original Poster',
            avatar: '',
          },
          value: {
            $type: 'app.bsky.feed.post',
            text: 'This is the original post being quoted with media',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        },
      },
      media: {
        $type: 'app.bsky.embed.images#view',
        images: [
          {
            thumb:
              'https://cdn.bsky.social/img/feed_thumbnail/plain/did:example:303/bafkreicontext888@jpeg',
            fullsize:
              'https://cdn.bsky.social/img/feed_fullsize/plain/did:example:303/bafkreicontext888@jpeg',
            alt: 'Context image showing additional information',
          },
        ],
      },
    } as any,
  },
];

export const TestEmbedsPage = () => {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Embed Test Page</h1>
      <p className="text-white/70 mb-8">
        Testing various AT Protocol embed types with proper view formats
      </p>

      <div className="space-y-4">
        {testPosts.map((post) => (
          <>
            <h2 className="text-lg font-semibold text-white mt-6 mb-2">{post.embed?.$type}</h2>
            <PostItem key={post.uri} post={post} />
          </>
        ))}
      </div>
    </div>
  );
};
