import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { useAuth } from '../context/AuthContext';
import { AppIcon } from '../components/AppIcon';
import { DevelopmentNotice } from '../components/DevelopmentNotice';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // 実際のログイン処理を呼び出す
      await login(identifier, password);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-indigo-purple">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-white/70"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-indigo-purple px-4">
      <div className="max-w-md w-full space-y-8">
        <DevelopmentNotice />
        <div className="glass-card-simple p-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <AppIcon size="lg" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">AuroraSkyにログイン</h2>
          </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-100 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                className="form-input"
                placeholder="ハンドル (@username.bsky.social)"
                value={identifier}
                onInput={(e) => setIdentifier((e.target as HTMLInputElement).value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="form-input"
                placeholder="App パスワード"
                value={password}
                onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                disabled={isLoading}
              />
              <div className="text-right mt-2">
                <a
                  href="https://bsky.app/settings/app-passwords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  App パスワードの取得 →
                </a>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                </>
              ) : (
                'ログイン'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <a
            href="https://bsky.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            公式アプリで開く →
          </a>
        </div>
      </div>
    </div>
  );
};
