interface YouTubeEmbedProps {
  videoId: string;
  url: string;
}

export const YouTubeEmbed = ({ videoId }: YouTubeEmbedProps) => {
  return (
    <div className="mt-3 relative overflow-hidden rounded-lg glass-card ambient-fade-in hover-lift">
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          loading="lazy"
          title="YouTube video"
        />
      </div>
    </div>
  );
};