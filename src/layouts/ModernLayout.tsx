import type { FunctionalComponent } from 'preact';
import { Link } from 'preact-router';
import { useAuth } from '../context/AuthContext';
import { AppIcon } from '../components/AppIcon';
import { BackgroundParticles } from '../components/BackgroundParticles';
import { FloatingSettings } from '../components/FloatingSettings';

interface ModernLayoutProps {
  children?: preact.ComponentChildren;
  path?: string;
}

export const ModernLayout: FunctionalComponent<ModernLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen animated-bg">
      <BackgroundParticles />
      <div className="animated-gradient"></div>
      <header className="aurora-gradient-bg sticky top-0 z-50 border-b border-white/10 shadow-lg"
        style={{
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          color: 'white'
        }}>
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <AppIcon size="md" withGradientBg={false} />
                <span className="text-xl font-bold text-white">AuroraSky</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {!isAuthenticated && (
                <Link href="/login" className="glass-button btn-primary">
                  ログイン
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* 浮かぶ設定ボタン */}
      {isAuthenticated && <FloatingSettings />}
    </div>
  );
};
