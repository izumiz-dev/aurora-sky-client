import type { FunctionalComponent } from 'preact';
import { Link } from 'preact-router';
import { useAuth } from '../context/AuthContext';
import { UserMenu } from '../components/UserMenu';

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
                <div className="w-10 h-10 rounded-lg glass-accent flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">Bluesky</span>
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
