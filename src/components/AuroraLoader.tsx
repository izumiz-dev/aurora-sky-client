import { useState, useEffect } from 'preact/hooks';

interface AuroraLoaderProps {
  minDuration?: number; // ミリ秒単位の最低表示時間
  onMinDurationReached?: () => void;
}

export const AuroraLoader = ({ minDuration = 500, onMinDurationReached }: AuroraLoaderProps = {}) => {
  const [hasMetMinDuration, setHasMetMinDuration] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMetMinDuration(true);
      if (onMinDurationReached) {
        onMinDurationReached();
      }
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onMinDurationReached]);

  return (
    <div className="aurora-loader-container" data-min-duration-met={hasMetMinDuration}>
      {/* 背景の光の脈動 */}
      <div className="aurora-glow"></div>
      
      {/* 縦の流れ */}
      <div className="aurora-vertical-wave"></div>
      
      {/* メインのオーロラカーテン */}
      <div className="aurora-curtain">
        <div className="curtain-layer layer-1"></div>
        <div className="curtain-layer layer-2"></div>
        <div className="curtain-layer layer-3"></div>
        <div className="curtain-layer layer-4"></div>
        <div className="curtain-layer layer-5"></div>
      </div>
      
      {/* きらめき効果 */}
      <div className="aurora-shimmer"></div>
    </div>
  );
};