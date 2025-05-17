// Sample timeline data for testing rich content rendering
export const sampleTimelineData = {
  feed: [
    // Quote post
    {
      uri: 'at://did:example:123/app.bsky.feed.post/xyz123',
      cid: 'xyz123',
      author: {
        did: 'did:example:123',
        handle: 'user.bsky.social',
        displayName: 'Test User',
        avatar: 'https://cdn.bsky.social/img/avatar/plain/did:example:123/xyz@jpeg'
      },
      record: {
        text: 'Check out this amazing post!',
        createdAt: new Date().toISOString(),
        facets: []
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
            avatar: 'https://cdn.bsky.social/img/avatar/plain/did:example:456/abc@jpeg'
          },
          value: {
            text: 'This is the quoted post content',
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          indexedAt: new Date(Date.now() - 3600000).toISOString()
        }
      }
    },
    // External embed with thumbnail
    {
      uri: 'at://did:example:789/app.bsky.feed.post/def789',
      cid: 'def789',
      author: {
        did: 'did:example:789',
        handle: 'news.bsky.social',
        displayName: 'News Account',
        avatar: ''
      },
      record: {
        text: 'Latest news article: https://example.com/news',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        facets: []
      },
      embed: {
        $type: 'app.bsky.embed.external#view',
        external: {
          $type: 'app.bsky.embed.external#viewExternal',
          uri: 'https://example.com/news',
          title: 'Breaking News: Important Update',
          description: 'This is a summary of the news article...',
          thumb: 'https://cdn.bsky.social/img/feed_thumbnail/plain/bafkreiexample123@jpeg'
        }
      }
    },
    // YouTube embed
    {
      uri: 'at://did:example:101/app.bsky.feed.post/ghi101',
      cid: 'ghi101',
      author: {
        did: 'did:example:101',
        handle: 'creator.bsky.social',
        displayName: 'Content Creator',
        avatar: ''
      },
      record: {
        text: 'Check out my new video! https://youtube.com/watch?v=dQw4w9WgXcQ',
        createdAt: new Date(Date.now() - 2700000).toISOString(),
        facets: []
      },
      embed: {
        $type: 'app.bsky.embed.external#view',
        external: {
          $type: 'app.bsky.embed.external#viewExternal',
          uri: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
          title: 'Amazing Video Title',
          description: 'This video is about something amazing...',
          thumb: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
        }
      }
    },
    // Image post
    {
      uri: 'at://did:example:202/app.bsky.feed.post/jkl202',
      cid: 'jkl202',
      author: {
        did: 'did:example:202',
        handle: 'photographer.bsky.social',
        displayName: 'Photographer',
        avatar: ''
      },
      record: {
        text: 'Beautiful sunset today!',
        createdAt: new Date(Date.now() - 5400000).toISOString(),
        facets: []
      },
      embed: {
        $type: 'app.bsky.embed.images#view',
        images: [
          {
            $type: 'app.bsky.embed.images#viewImage',
            thumb: 'https://cdn.bsky.social/img/feed_thumbnail/plain/bafkreisunset123@jpeg',
            fullsize: 'https://cdn.bsky.social/img/feed_fullsize/plain/bafkreisunset123@jpeg',
            alt: 'Sunset photo',
            aspectRatio: {
              width: 1920,
              height: 1080
            }
          }
        ]
      }
    },
    // Record with media (quote post with image)
    {
      uri: 'at://did:example:303/app.bsky.feed.post/mno303',
      cid: 'mno303',
      author: {
        did: 'did:example:303',
        handle: 'combo.bsky.social',
        displayName: 'Combo User',
        avatar: ''
      },
      record: {
        text: 'Adding context to this post with an image',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        facets: []
      },
      embed: {
        $type: 'app.bsky.embed.recordWithMedia',
        record: {
          uri: 'at://did:example:456/app.bsky.feed.post/xyz999',
          cid: 'xyz999',
          author: {
            did: 'did:example:456',
            handle: 'original.bsky.social',
            displayName: 'Original Poster',
            avatar: ''
          },
          value: {
            text: 'This is the original post being quoted',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        },
        media: {
          $type: 'app.bsky.embed.images',
          images: [
            {
              alt: 'Context image',
              image: {
                ref: {
                  $link: 'bafkreicontext888'
                },
                mimeType: 'image/jpeg',
                size: 300000
              },
              aspectRatio: {
                width: 1200,
                height: 800
              }
            }
          ]
        }
      }
    }
  ],
  cursor: 'cursor-next-page'
};