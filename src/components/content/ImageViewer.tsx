interface Image {
  // View format (from API responses)
  thumb?: string | { ref: { $link: string } };
  fullsize?: string | { ref: { $link: string } };
  alt: string;
  aspectRatio?: {
    width: number;
    height: number;
  };
  // Input format (for creation)
  image?: {
    ref: { $link: string };
    mimeType: string;
    size: number;
  };
}

interface ImageViewerProps {
  images: Image[];
}

export const ImageViewer = ({ images }: ImageViewerProps) => {
  if (!images || images.length === 0) return null;

  const imageCount = images.length;
  const gridClass = imageCount === 1 
    ? 'grid-cols-1' 
    : imageCount === 2 
    ? 'grid-cols-2' 
    : imageCount === 3 
    ? 'grid-cols-2' 
    : 'grid-cols-2';

  const getImageUrl = (image: Image) => {
    // Priority 1: Direct fullsize URL from view format
    if (typeof image.fullsize === 'string') {
      return image.fullsize;
    }
    // Priority 2: Handle blob references for creation format
    if (image.image?.ref?.$link) {
      return `https://cdn.bsky.social/img/feed_fullsize/plain/${image.image.ref.$link}@jpeg`;
    }
    // Priority 3: Check for blob reference in fullsize
    if (typeof image.fullsize === 'object' && image.fullsize?.ref?.$link) {
      return `https://cdn.bsky.social/img/feed_fullsize/plain/${image.fullsize.ref.$link}@jpeg`;
    }
    // Priority 4: Use thumb URL from view format
    if (typeof image.thumb === 'string') {
      return image.thumb;
    }
    // Priority 5: Handle blob reference in thumb
    if (typeof image.thumb === 'object' && image.thumb?.ref?.$link) {
      return `https://cdn.bsky.social/img/feed_thumbnail/plain/${image.thumb.ref.$link}@jpeg`;
    }
    return '';
  };

  return (
    <div className={`grid ${gridClass} gap-2 mt-3`}>
      {images.map((image, index) => {
        const imageUrl = getImageUrl(image);
        
        if (!imageUrl) return null;

        return (
          <div 
            key={index} 
            className={`relative overflow-hidden rounded-lg glass-card ambient-fade-in hover-lift ${
              imageCount === 3 && index === 0 ? 'row-span-2' : ''
            }`}
          >
            <img
              src={imageUrl}
              alt={image.alt || '画像'}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onClick={() => window.open(imageUrl, '_blank')}
            />
          </div>
        );
      })}
    </div>
  );
};