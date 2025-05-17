import type { FunctionalComponent } from 'preact';
import { Link } from 'preact-router';
import { useAuth } from '../context/AuthContext';
import { UserMenu } from '../components/UserMenu';
import { AppIcon } from '../components/AppIcon';

interface ModernLayoutProps {
  children?: preact.ComponentChildren;
  path?: string;
}

export const ModernLayout: FunctionalComponent<ModernLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen animated-bg">
      <div className="animated-gradient"></div>
      <header className="glass-header">
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
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <Link href="/login" className="glass-button btn-primary">
                  ログイン
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
};
