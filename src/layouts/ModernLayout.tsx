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

type RouteComponentProps = {
  path?: string;
};

export const ModernLayout: FunctionalComponent<ModernLayoutProps & RouteComponentProps> = ({ children, path }) => {
  const { isAuthenticated } = useAuth();
  const isLoginPage = path === '/login';

  return (
    <>
      <header className="aurora-gradient-bg fixed top-0 left-0 right-0 w-full z-50 border-b border-white/10 shadow-lg"
        style={{ position: 'fixed !important' }}>
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-16 sm:h-12">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="hidden sm:block">
                  <AppIcon size="md" withGradientBg={false} />
                </div>
                <div className="block sm:hidden">
                  <AppIcon size="sm" withGradientBg={false} />
                </div>
                <span className="text-xl md:text-xl sm:text-lg font-bold text-white">AuroraSky</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {!isAuthenticated && !isLoginPage && (
                <Link href="/login" className="glass-button btn-primary">
                  ログイン
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-screen animated-bg">
        <BackgroundParticles />
        <div className="animated-gradient"></div>
        <main className="pt-16 md:pt-16 sm:pt-12">{children}</main>
      </div>

      {/* 浮かぶ設定ボタン */}
      {isAuthenticated && !isLoginPage && <FloatingSettings />}
    </>
  );
};
