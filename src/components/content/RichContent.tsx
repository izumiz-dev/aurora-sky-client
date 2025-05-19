import { parseContent } from '../../utils/contentParser';
import type { ContentSegment } from '../../utils/contentParser';
import { renderTextWithFacets } from '../../utils/facetRenderer';
import { UrlPreview } from './UrlPreview';
import { YouTubeEmbed } from './YouTubeEmbed';
import { QuotedPost } from './QuotedPost';
import { ImageViewer } from './ImageViewer';

interface RichContentProps {
  text: string;
  embed?: {
    $type: string;
    record?: unknown;
    external?: unknown;
    images?: unknown[];
    media?: unknown;
    [key: string]: unknown;
  };
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
  inModal?: boolean;
}

export const RichContent = ({ text, embed, facets, inModal = false }: RichContentProps) => {
  // If we have facets, use the facet renderer instead of parsing
  const hasRichText = facets && facets.length > 0;
  const segments = hasRichText ? [] : parseContent(text);

  // Debug logging removed

  // Handle different embed types based on $type
  const embedTyped = embed as {
    $type?: string;
    record?: { record?: unknown };
    media?: { $type?: string; images?: unknown; external?: unknown };
    external?: unknown;
    images?: unknown[];
  };
  
  const embedType = embedTyped?.$type;

  // Check for view formats (AT Protocol returns data in view format)
  const isQuotePost = embedType === 'app.bsky.embed.record#view';
  const isQuoteWithMedia = embedType === 'app.bsky.embed.recordWithMedia#view';
  const isExternalEmbed = embedType === 'app.bsky.embed.external#view';
  const isImageEmbed = embedType === 'app.bsky.embed.images#view';

  // Extract the actual data based on embed type
  let quotedRecord = null;
  let externalData = null;
  let imageData = null;

  if (isQuotePost && embedTyped?.record) {
    quotedRecord = embedTyped.record;
  } else if (isQuoteWithMedia && embedTyped) {
    quotedRecord = embedTyped.record?.record;
    // Handle media in recordWithMedia
    if (embedTyped.media?.$type === 'app.bsky.embed.images#view') {
      imageData = embedTyped.media.images;
    } else if (embedTyped.media?.$type === 'app.bsky.embed.external#view') {
      externalData = embedTyped.media.external;
    }
  }

  if (isExternalEmbed && embedTyped?.external) {
    externalData = embedTyped.external;
  }

  if (isImageEmbed && embedTyped?.images) {
    imageData = embedTyped.images;
  }

  return (
    <div>
      <div className="whitespace-pre-wrap break-words">
        {hasRichText
          ? renderTextWithFacets(text, facets)
          : segments.map((segment, index) => (
              <ContentRenderer
                key={index}
                segment={segment}
                skipUrlPreview={!!externalData && segment.content === (externalData as any).uri}
              />
            ))}
      </div>

      {/* Handle quoted posts */}
      {quotedRecord && <QuotedPost record={quotedRecord as any} />}

      {/* Handle external embeds (link cards) */}
      {externalData && (
        <ExternalEmbed 
          embed={externalData as { uri: string; title: string; description: string; thumb?: string }} 
        />
      )}

      {/* Handle images */}
      {imageData && Array.isArray(imageData) && imageData.length > 0 && (
        <ImageViewer images={imageData as any} inModal={inModal} />
      )}
    </div>
  );
};

interface ContentRendererProps {
  segment: ContentSegment;
  skipUrlPreview?: boolean;
}

const ContentRenderer = ({ segment, skipUrlPreview }: ContentRendererProps) => {
  switch (segment.type) {
    case 'text':
      return <span>{segment.content}</span>;

    case 'url':
      return (
        <>
          <a
            href={segment.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {segment.content}
          </a>
          {!skipUrlPreview && <UrlPreview url={segment.content} />}
        </>
      );

    case 'youtube':
      return (
        <>
          <a
            href={segment.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {segment.content}
          </a>
          {segment.metadata?.videoId && (
            <YouTubeEmbed videoId={segment.metadata.videoId} url={segment.content} />
          )}
        </>
      );

    default:
      return <span>{segment.content}</span>;
  }
};

interface ExternalEmbedProps {
  embed: {
    uri: string;
    title: string;
    description: string;
    thumb?: string;
  };
}

const ExternalEmbed = ({ embed }: ExternalEmbedProps) => {
  // Check if this is a YouTube URL for special handling
  const isYouTube = embed.uri.includes('youtube.com/watch') || embed.uri.includes('youtu.be/');

  // Extract YouTube video ID if it's a YouTube URL
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const youtubeId = isYouTube ? getYouTubeId(embed.uri) : null;

  // Handle YouTube embeds differently
  if (isYouTube && youtubeId) {
    return (
      <div className="mt-3">
        <YouTubeEmbed videoId={youtubeId} url={embed.uri} />
      </div>
    );
  }

  return (
    <a
      href={embed.uri}
      target="_blank"
      rel="noopener noreferrer"
      className="block glass-card p-4 mt-3 hover:bg-white/5 transition-all duration-300 ambient-hover"
    >
      <div className="flex gap-4">
        {embed.thumb && (
          <div className="relative w-24 h-24 rounded overflow-hidden glass-card flex-shrink-0">
            <img
              src={embed.thumb}
              alt={embed.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {embed.title && <h4 className="font-medium text-white truncate">{embed.title}</h4>}
          {embed.description && (
            <p className="text-sm text-white/70 line-clamp-2 mt-1">{embed.description}</p>
          )}
          <p className="text-xs text-white/50 mt-2">
            {(() => {
              try {
                return new URL(embed.uri).hostname;
              } catch {
                return embed.uri;
              }
            })()}
          </p>
        </div>
      </div>
    </a>
  );
};
