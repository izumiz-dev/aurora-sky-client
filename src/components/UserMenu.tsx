import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import { useAuth } from '../context/AuthContext';

export const UserMenu = () => {
  const { session, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    route('/login');
    setIsMenuOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="rounded-lg p-2 hover:bg-white/10 transition-all duration-200 backdrop-filter backdrop-blur-lg bg-white/5 border border-white/10"
      >
        <div className="avatar avatar-sm">
          <img
            src={session?.avatar || '/default-avatar.png'}
            alt={session?.handle || 'User'}
            onError={(e) => {
              console.error('Avatar load error in header:', e);
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
        </div>
        <span className="hidden md:block text-sm font-medium text-white/90">
          @{session?.handle.split('.')[0]}
        </span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg backdrop-filter backdrop-blur-lg bg-white/5 border border-white/10">
          <div className="py-1">
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-100 hover:bg-white/10 transition-colors"
            >
              プロフィール
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-100 hover:bg-white/10 transition-colors"
            >
              設定
            </a>
            <hr className="my-1 border-white/10" />
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-white/10 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
