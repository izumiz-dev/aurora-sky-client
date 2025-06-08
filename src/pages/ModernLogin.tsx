import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { useAuth } from '../context/AuthContext';
import { AppIcon } from '../components/AppIcon';
import { DevelopmentNotice } from '../components/DevelopmentNotice';
import { AuroraLoader } from '../components/AuroraLoader';
import { CredentialStorage } from '../lib/credentialStorage';

export const ModernLoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true); // デフォルトでチェック
  const [enableAutoLogin, setEnableAutoLogin] = useState(false); // 自動ログイン
  const [showAutoLoginWarning, setShowAutoLoginWarning] = useState(false);

  const { isAuthenticated, loading: authLoading, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      route('/');
    }
  }, [isAuthenticated]);

  // 自動ログインチェックボックスの変更時
  const handleAutoLoginChange = (e: Event) => {
    const checked = (e.target as HTMLInputElement).checked;
    setEnableAutoLogin(checked);
    if (checked) {
      setShowAutoLoginWarning(true);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(identifier, password, rememberMe);

      // 自動ログインが有効な場合、クレデンシャルを保存
      if (enableAutoLogin) {
        await CredentialStorage.save(identifier, password);
        console.log('[Login] Auto-login credentials saved');
      }

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

            <div className="space-y-3">
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

              {/* 自動ログインオプション */}
              <div className="border-t border-white/10 pt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={enableAutoLogin}
                    onChange={handleAutoLoginChange}
                    className="w-4 h-4 text-orange-600 border-white/30 rounded focus:ring-orange-500 bg-white/10"
                  />
                  <span className="ml-2 text-sm text-orange-400">
                    自動ログインを有効にする（推奨されません）
                  </span>
                </label>
              </div>

              {/* 警告メッセージ */}
              {showAutoLoginWarning && enableAutoLogin && (
                <div className="p-4 glass border border-orange-500/30 rounded-lg animate-fadeIn">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div className="ml-3 text-sm">
                      <p className="font-semibold text-orange-400 mb-1">
                        セキュリティに関する重要な警告
                      </p>
                      <ul className="text-white/70 space-y-1 list-disc list-inside">
                        <li>パスワードが暗号化されてこのデバイスに保存されます</li>
                        <li>共有PCや公共の端末では絶対に使用しないでください</li>
                        <li>7日ごとに再認証が必要になります</li>
                        <li>セキュリティリスクを理解した上でご利用ください</li>
                      </ul>
                      <button
                        type="button"
                        onClick={() => setShowAutoLoginWarning(false)}
                        className="mt-3 text-xs text-orange-400 hover:text-orange-300 underline"
                      >
                        警告を閉じる
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
