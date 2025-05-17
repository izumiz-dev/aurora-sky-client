import { useAvatar } from '../hooks/useAvatar';

interface CachedAvatarProps {
  src?: string | null;
  alt: string;
  handle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fallback?: string;
}

/**
 * キャッシュ対応のアバターコンポーネント
 */
export const CachedAvatar = ({
  src,
  alt,
  handle,
  size = 'md',
  className = '',
  fallback,
}: CachedAvatarProps) => {
  const { avatarUrl } = useAvatar(src, { handle, fallback });

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`avatar ${sizeClasses[size]} ${className}`}>
      <img
        src={avatarUrl}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover rounded-full"
      />
    </div>
  );
};