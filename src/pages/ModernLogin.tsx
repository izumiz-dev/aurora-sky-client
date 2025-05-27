import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { useAuth } from '../context/AuthContext';
import { AppIcon } from '../components/AppIcon';
import { DevelopmentNotice } from '../components/DevelopmentNotice';
import { AuroraLoader } from '../components/AuroraLoader';

export const ModernLoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true); // デフォルトでチェック

  const { isAuthenticated, loading: authLoading, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      route('/');
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(identifier, password, rememberMe);
      route('/');
    } catch (err) {
      setError('ログインに失敗しました。IDまたはパスワードを確認してください。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center fade-enter">
        <AuroraLoader />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 fade-enter">
      <div className="max-w-md w-full relative">
        {/* 開発中の注意書き */}
        <DevelopmentNotice />
        
        {/* ロゴセクション */}
        <div className="text-center mb-8">
          <AppIcon size="lg" withGradientBg={false} className="mb-2" />
          <h1 className="text-3xl font-bold text-white mb-2">AuroraSkyへようこそ</h1>
          <p className="text-white/70">こころがやすまるクライアント</p>
        </div>

        {/* ログインフォーム */}
        <div className="glass-card p-8">
          {error && (
            <div className="mb-6 p-4 glass border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">ハンドル</label>
              <input
                type="text"
                value={identifier}
                onInput={(e) => setIdentifier((e.target as HTMLInputElement).value)}
                className="glass-input"
                placeholder="@username.bsky.social"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">App パスワード</label>
              <input
                type="password"
                value={password}
                onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                className="glass-input"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe((e.target as HTMLInputElement).checked)}
                  className="w-4 h-4 text-blue-600 border-white/30 rounded focus:ring-blue-500 bg-white/10"
                />
                <span className="ml-2 text-sm text-white/60">ログイン状態を保持</span>
              </label>

              <a
                href="https://bsky.app/settings/app-passwords"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:underline"
              >
                App パスワードの取得 →
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full glass-button btn-primary py-3"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  ログイン中...
                </div>
              ) : (
                'ログイン'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
