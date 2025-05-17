import { useState, useEffect, useCallback } from 'preact/hooks';

interface UrlPreviewProps {
  url: string;
}

interface LinkPreview {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export const UrlPreview = ({ url }: UrlPreviewProps) => {
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPreview = useCallback(async () => {
    try {
      // In a real implementation, you would fetch metadata from the URL
      // For now, we'll show a basic preview
      setPreview({
        title: url,
        description: 'Link preview',
        siteName: new URL(url).hostname,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchPreview();
  }, [url, fetchPreview]);

  if (loading) {
    return (
      <div className="glass-card p-4 mt-2 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-white/10 rounded w-full"></div>
      </div>
    );
  }

  if (error || !preview) {
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block glass-card p-4 mt-2 hover:bg-white/5 transition-colors"
    >
      <div className="flex gap-4">
        {preview.image && (
          <img src={preview.image} alt={preview.title} className="w-20 h-20 rounded object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">{preview.title}</h4>
          {preview.description && (
            <p className="text-sm text-white/70 line-clamp-2 mt-1">{preview.description}</p>
          )}
          <p className="text-xs text-white/50 mt-2">{preview.siteName}</p>
        </div>
      </div>
    </a>
  );
};
