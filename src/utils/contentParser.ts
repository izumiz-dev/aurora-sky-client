export type ContentSegment = {
  type: 'text' | 'url' | 'youtube' | 'quote';
  content: string;
  metadata?: {
    title?: string;
    description?: string;
    thumbnail?: string;
    videoId?: string;
    quotedPostUri?: string;
  };
};

const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi;
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

export function parseContent(text: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  // First, find all URLs (including YouTube)
  const urlMatches = Array.from(text.matchAll(URL_REGEX));

  urlMatches.forEach((match) => {
    const url = match[0];
    const index = match.index || 0;

    // Add text before URL
    if (index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, index),
      });
    }

    // Check if it's a YouTube URL
    const youtubeMatch = url.match(YOUTUBE_REGEX);
    if (youtubeMatch) {
      const videoId = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
      segments.push({
        type: 'youtube',
        content: url,
        metadata: {
          videoId,
          title: 'YouTube Video',
        },
      });
    } else {
      segments.push({
        type: 'url',
        content: url,
      });
    }

    lastIndex = index + url.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  // If no URLs found, return the whole text
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: text,
    });
  }

  return segments;
}
