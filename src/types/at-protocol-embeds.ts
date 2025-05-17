// AT Protocol embed types based on the actual API structure

export interface BlobRef {
  $type: 'blob';
  ref: {
    $link: string;
  };
  mimeType: string;
  size: number;
}

// app.bsky.embed.external
export interface ExternalEmbed {
  $type: 'app.bsky.embed.external';
  external: {
    uri: string;
    title: string;
    description: string;
    thumb?: BlobRef;
  };
}

// app.bsky.embed.images
export interface ImagesEmbed {
  $type: 'app.bsky.embed.images';
  images: Array<{
    alt: string;
    image: BlobRef;
    aspectRatio?: {
      width: number;
      height: number;
    };
  }>;
}

// app.bsky.embed.record
export interface RecordEmbed {
  $type: 'app.bsky.embed.record';
  record: {
    uri: string;
    cid: string;
    author?: {
      did: string;
      handle: string;
      displayName?: string;
      avatar?: string;
    };
    value?: any;
    record?: any;
  };
}

// app.bsky.embed.recordWithMedia
export interface RecordWithMediaEmbed {
  $type: 'app.bsky.embed.recordWithMedia';
  record: RecordEmbed['record'];
  media: ExternalEmbed | ImagesEmbed;
}

export type Embed = ExternalEmbed | ImagesEmbed | RecordEmbed | RecordWithMediaEmbed;
