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
    record?: any;
    external?: any;
    images?: any[];
    media?: any;
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
}

export const RichContent = ({ text, embed, facets }: RichContentProps) => {
  // If we have facets, use the facet renderer instead of parsing
  const hasRichText = facets && facets.length > 0;
  const segments = hasRichText ? [] : parseContent(text);
  
  // Handle different embed types based on $type
  const embedType = embed?.$type;
  
  // Check for different embed types based on view types
  const isQuotePost = embedType === 'app.bsky.embed.record' || embedType === 'app.bsky.embed.record#view';
  const isQuoteWithMedia = embedType === 'app.bsky.embed.recordWithMedia' || embedType === 'app.bsky.embed.recordWithMedia#view';
  const isExternalEmbed = embedType === 'app.bsky.embed.external' || embedType === 'app.bsky.embed.external#view';
  const isImageEmbed = embedType === 'app.bsky.embed.images' || embedType === 'app.bsky.embed.images#view';
  
  // Extract the actual data based on embed type - handle both input and view formats
  const quotedRecord = isQuotePost && embed ? embed.record : 
                      isQuoteWithMedia && embed ? 
                        (embed.record?.record || embed.recordWithMedia?.record || embed.record) : 
                      null;
  
  // Handle external embeds - check for view formats
  const externalData = isExternalEmbed && embed ? embed.external : 
                      isQuoteWithMedia && embed ? 
                        (embed.media?.external?.external || embed.recordWithMedia?.media?.external || embed.media?.external) : 
                      null;
  
  // Handle images - check for view formats
  const imageData = isImageEmbed && embed ? embed.images : 
                   isQuoteWithMedia && embed ? 
                     (embed.media?.images || embed.recordWithMedia?.media?.images) : 
                   null;
  

  return (
    <div>
      <div className="whitespace-pre-wrap break-words">
        {hasRichText ? (
          renderTextWithFacets(text, facets)
        ) : (
          segments.map((segment, index) => (
            <ContentRenderer 
              key={index} 
              segment={segment} 
              skipUrlPreview={!!externalData && segment.content === externalData.uri}
            />
          ))
        )}
      </div>
      
      {/* Handle quoted posts */}
      {quotedRecord && (
        <QuotedPost record={quotedRecord} />
      )}
      
      {/* Handle external embeds (link cards) */}
      {externalData && (
        <ExternalEmbed embed={externalData} />
      )}
      
      {/* Handle images */}
      {imageData && imageData.length > 0 && (
        <ImageViewer images={imageData} />
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
            <YouTubeEmbed 
              videoId={segment.metadata.videoId} 
              url={segment.content}
            />
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
    thumb?: string | {
      $type: string;
      ref: {
        $link: string;
      };
      mimeType: string;
      size: number;
    };
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
  
  // Convert AT Protocol blob reference to URL or use direct URL from view
  const getThumbnailUrl = () => {
    // Direct URL from view format
    if (typeof embed.thumb === 'string') {
      return embed.thumb;
    }
    // Blob reference from input format
    if (embed.thumb?.ref?.$link) {
      return `https://cdn.bsky.social/img/feed_thumbnail/plain/${embed.thumb.ref.$link}@jpeg`;
    }
    // Fallback for YouTube thumbnails
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
    }
    return null;
  };
  
  const thumbUrl = getThumbnailUrl();

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
        {thumbUrl && (
          <div className="relative w-24 h-24 rounded overflow-hidden glass-card flex-shrink-0">
            <img 
              src={thumbUrl} 
              alt={embed.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {embed.title && (
            <h4 className="font-medium text-white truncate">
              {embed.title}
            </h4>
          )}
          {embed.description && (
            <p className="text-sm text-white/70 line-clamp-2 mt-1">
              {embed.description}
            </p>
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