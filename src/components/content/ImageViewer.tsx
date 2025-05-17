interface Image {
  thumb: string;
  fullsize: string;
  alt: string;
  aspectRatio?: {
    width: number;
    height: number;
  };
}

interface ImageViewerProps {
  images: Image[];
}

export const ImageViewer = ({ images }: ImageViewerProps) => {
  if (!images || images.length === 0) return null;

  const imageCount = images.length;
  const gridClass =
    imageCount === 1
      ? 'grid-cols-1'
      : imageCount === 2
        ? 'grid-cols-2'
        : imageCount === 3
          ? 'grid-cols-2'
          : 'grid-cols-2';

  return (
    <div className={`grid ${gridClass} gap-2 mt-3`}>
      {images.map((image, index) => {
        // For images in view format, URLs are directly available
        const imageUrl = image.fullsize || image.thumb;

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
