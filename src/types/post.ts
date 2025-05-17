export interface Post {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  record: {
    text: string;
    createdAt: string;
    facets?: Array<{
      index: {
        byteStart: number;
        byteEnd: number;
      };
      features: Array<{
        $type: string;
        uri?: string;
        did?: string;
      }>;
    }>;
    reply?: {
      parent: {
        uri: string;
        cid: string;
      };
      root: {
        uri: string;
        cid: string;
      };
    };
  };
  likeCount?: number;
  replyCount?: number;
  repostCount?: number;
  viewer?: {
    like?: string;
    repost?: string;
  };
  reply?: {
    parent: {
      uri: string;
      cid: string;
      author: {
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
      };
      record?: {
        text?: string;
        createdAt?: string;
      };
    };
  };
  embed?: {
    $type: string;
    record?: {
      uri: string;
      cid: string;
      author?: {
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
      };
      value?: {
        text?: string;
        createdAt?: string;
        [key: string]: any;
      };
      record?: {
        text?: string;
        createdAt?: string;
        [key: string]: any;
      };
    };
    external?:
      | {
          external: {
            uri: string;
            title: string;
            description: string;
            thumb?: {
              $type: string;
              ref: {
                $link: string;
              };
              mimeType: string;
              size: number;
            };
          };
        }
      | {
          uri: string;
          title: string;
          description: string;
          thumb?: {
            $type: string;
            ref: {
              $link: string;
            };
            mimeType: string;
            size: number;
          };
        };
    images?: Array<{
      thumb: string | { ref: { $link: string } };
      fullsize: string | { ref: { $link: string } };
      alt: string;
      aspectRatio?: {
        width: number;
        height: number;
      };
      image?: {
        ref: { $link: string };
        mimeType: string;
        size: number;
      };
    }>;
    media?: {
      $type: string;
      images?: Array<{
        image: {
          ref: { $link: string };
          mimeType: string;
          size: number;
        };
        alt: string;
        aspectRatio?: {
          width: number;
          height: number;
        };
      }>;
      external?: {
        external: {
          uri: string;
          title: string;
          description: string;
          thumb?: {
            $type: string;
            ref: {
              $link: string;
            };
            mimeType: string;
            size: number;
          };
        };
      };
    };
    recordWithMedia?: {
      record: any;
      media: any;
    };
  };
}
