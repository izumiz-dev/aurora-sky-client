import type { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Link, route } from 'preact-router';
import { useAuth } from '../context/AuthContext';

interface MainLayoutProps {
  children?: preact.ComponentChildren;
  path?: string;
}

export const MainLayout: FunctionalComponent<MainLayoutProps> = ({ children, path = '' }) => {
  const { isAuthenticated, logout, session } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // スクロールの検出
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    route('/login');
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/10' : 'bg-transparent'} backdrop-blur-sm border-b border-white/10`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
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
                  <span className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                    Bluesky
                  </span>
                </div>
              </Link>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex md:items-center md:gap-6">
              <Link
                href="/"
                className={`nav-link text-white/80 hover:text-white px-3 py-2 text-sm font-medium transition-colors ${path === '/' ? 'text-white' : ''}`}
              >
                ホーム
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  {session && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 overflow-hidden rounded-full">
                        <img
                          src="/default-avatar.png"
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium text-white/90">
                        @{session.handle.split('.')[0]}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <Link href="/login" className="btn-primary-small">
                  ログイン
                </Link>
              )}
            </nav>

            {/* モバイルメニューボタン */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">メインメニューを開く</span>
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        <div
          className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white/10 backdrop-blur-sm border-t border-white/10`}
        >
          <div className="py-3 space-y-1 px-4">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </Link>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors"
              >
                ログアウト
              </button>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-grow">{children}</main>

      {/* フッター */}
      <footer className="bg-transparent border-t border-white/10 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
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
              <span className="text-sm font-medium text-white/80">Bluesky Client</span>
            </div>
            <p className="text-xs text-white/60">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
