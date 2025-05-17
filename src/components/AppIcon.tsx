interface AppIconProps {
  size?: 'sm' | 'md' | 'lg' | 'favicon';
  withGradientBg?: boolean;
  className?: string;
}

export const AppIcon = ({ size = 'md', withGradientBg = true, className = '' }: AppIconProps) => {
  const sizeClasses = {
    sm: { container: 'w-14 h-14', icon: 'h-8 w-8' },
    md: { container: 'w-18 h-18', icon: 'h-11 w-11' },
    lg: { container: 'w-36 h-36', icon: 'h-22 w-22' },
    favicon: { container: 'w-16 h-16', icon: 'h-10 w-10' }, // 64x64px for favicon
  };

  // スマホアプリのアイコンのような角丸を適用（サイズに応じて調整）
  const roundedClass = size === 'lg' ? 'rounded-[36px]' : size === 'md' ? 'rounded-[18px]' : size === 'favicon' ? 'rounded-[16px]' : 'rounded-[14px]';
  const containerClasses = withGradientBg
    ? `${sizeClasses[size].container} ${roundedClass} bg-gradient-to-br from-green-400 via-cyan-500 via-blue-500 to-purple-600 inline-flex items-center justify-center shadow-lg ${className}`
    : `${sizeClasses[size].container} ${roundedClass} inline-flex items-center justify-center ${className}`;

  return (
    <div className={containerClasses}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size].icon}`}
        viewBox="0 0 24 24"
        fill="none"
      >
        {/* 夜空のグラデーション背景 */}
        <defs>
          <linearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#16213e" />
          </linearGradient>
          <linearGradient id="aurora" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.5" />
            <stop offset="25%" stopColor="#9333ea" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#00e887" stopOpacity="0.5" />
            <stop offset="75%" stopColor="#00d9ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0.5" />
          </linearGradient>
          {/* 輝くエフェクト */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* 背景の角丸四角形 */}
        <rect x="1" y="1" width="22" height="22" rx="5" ry="5" fill="url(#nightSky)" />
        
        {/* オーロラの層 */}
        <path d="M2 8C2 8 6 6 12 7C18 8 22 6 22 6L22 16C22 16 18 18 12 17C6 16 2 18 2 18L2 8Z" fill="url(#aurora)" opacity="0.8" />
        <path d="M3 10C3 10 7 9 12 10C17 11 21 9 21 9L21 14C21 14 17 15 12 14C7 13 3 15 3 15L3 10Z" fill="url(#aurora)" opacity="0.6" />
        
        {/* 星 */}
        <circle cx="6" cy="5" r="0.5" fill="white" opacity="0.8" filter="url(#glow)" />
        <circle cx="18" cy="4" r="0.5" fill="white" opacity="0.7" filter="url(#glow)" />
        <circle cx="15" cy="6" r="0.3" fill="white" opacity="0.9" />
        <circle cx="9" cy="4" r="0.3" fill="white" opacity="0.6" />
        <circle cx="20" cy="7" r="0.3" fill="white" opacity="0.7" />
        <circle cx="4" cy="7" r="0.3" fill="white" opacity="0.8" />
        
        {/* 蝶のシルエット（白く光らせる） */}
        <g transform="translate(12, 12) scale(0.65) translate(-12, -12)">
          <path
            d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.104 4.267-4.279 1.655-6.498-2.83-7.078a8.299 8.299 0 0 1-.415-.056c.14.017.28.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"
            fill="white"
            opacity="0.95"
            filter="url(#glow)"
          />
        </g>
      </svg>
    </div>
  );
};