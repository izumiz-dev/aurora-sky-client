import { useAvatar } from '../hooks/useAvatar';
import { useState, useRef } from 'preact/hooks';

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
  const [hasError, setHasError] = useState(false);
  const errorCountRef = useRef(0);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  // エラーハンドリング
  const handleError = () => {
    errorCountRef.current += 1;
    // 無限ループを防ぐため、エラーが2回以上発生したら諦める
    if (errorCountRef.current <= 1) {
      setHasError(true);
    }
  };

  // フォールバック表示（アバターのプレースホルダー）
  if (hasError || !avatarUrl) {
    return (
      <div className={`avatar ${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-semibold text-lg">
            {handle ? handle.charAt(0).toUpperCase() : '?'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`avatar ${sizeClasses[size]} ${className}`}>
      <img
        src={avatarUrl}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover rounded-full"
        onError={handleError}
      />
    </div>
  );
};
