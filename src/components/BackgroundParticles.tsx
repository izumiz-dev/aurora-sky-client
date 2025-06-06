import { useState, useEffect } from 'preact/hooks';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export const BackgroundParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // 減らされたモーションが設定されている場合は粒子を表示しない
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // モバイルデバイスではパーティクルを無効化してパフォーマンス向上
    const isMobile = window.innerWidth <= 640 || 'ontouchstart' in window;
    if (isMobile) {
      return;
    }

    // デバイスの幅に応じて粒子の数を調整
    const particleCount = window.innerWidth < 768 ? 10 : 20;

    // ランダムな位置に粒子を生成
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100, // vw単位でのX座標
        y: Math.random() * 100, // vh単位でのY座標
        size: Math.random() * 4 + 1, // 1-5pxのサイズ
        opacity: Math.random() * 0.6 + 0.3, // 0.3-0.9の不透明度
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
      <div className="relative w-full h-full">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, ${particle.opacity * 0.5})`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
