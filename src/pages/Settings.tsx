import { useState, useEffect } from 'preact/hooks';
import { useAuth } from '../context/AuthContext';
import { getPreferences, updatePreferences } from '../lib/api';
import { route } from 'preact-router';

// 言語コードと表示名のマッピング
const LANGUAGE_OPTIONS = [
  { code: 'ja', name: '日本語' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ko', name: '한국어' },
];

export const SettingsPage = () => {
  const { isAuthenticated, logout } = useAuth();
  const [contentLanguages, setContentLanguages] = useState<string[]>(['ja']);
  const [postLanguage, setPostLanguage] = useState<string>('ja');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!isAuthenticated) return;

      try {
        const prefs = await getPreferences();

        // コンテンツ言語設定を取得
        const prefs_any = prefs as any;
        const langPrefs = prefs_any.preferences.find(
          (p: any) => p.$type === 'app.bsky.actor.defs#contentLabelPref' && p.contentLanguages
        );

        if (langPrefs?.contentLanguages) {
          setContentLanguages(langPrefs.contentLanguages);
        }

        // 投稿言語設定を取得
        const postLangPref = prefs_any.preferences.find(
          (p: any) => p.$type === 'app.bsky.actor.defs#postLanguage'
        );

        if (postLangPref?.postLanguage) {
          setPostLanguage(postLangPref.postLanguage);
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [isAuthenticated]);

  const handleSave = async () => {
    if (!isAuthenticated) return;

    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const preferences = [
        {
          $type: 'app.bsky.actor.defs#contentLabelPref',
          contentLanguages,
        },
        {
          $type: 'app.bsky.actor.defs#postLanguage',
          postLanguage,
        },
      ];

      await updatePreferences(preferences);
      setSuccessMessage('設定を保存しました');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleContentLanguage = (langCode: string) => {
    setContentLanguages((prev) => {
      if (prev.includes(langCode)) {
        return prev.filter((code) => code !== langCode);
      } else {
        return [...prev, langCode];
      }
    });
  };

  const handleLogout = () => {
    logout();
    route('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">設定</h2>
          <p className="text-white/70">設定を表示するにはログインしてください</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex justify-center py-12">
          <div className="glass-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold text-white mb-6">設定</h1>

      {/* 成功メッセージ */}
      {successMessage && (
        <div className="mb-6 p-4 glass bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400">{successMessage}</p>
        </div>
      )}

      {/* 言語設定セクション */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">言語設定</h2>

        {/* 投稿言語 */}
        <div className="mb-6">
          <label className="block text-white/80 mb-2">投稿のデフォルト言語</label>
          <select
            value={postLanguage}
            onChange={(e) => setPostLanguage((e.target as HTMLSelectElement).value)}
            className="glass-input"
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-white/60 mt-2">新しい投稿を作成する際のデフォルト言語です</p>
        </div>

        {/* コンテンツ言語 */}
        <div>
          <label className="block text-white/80 mb-2">表示するコンテンツの言語</label>
          <div className="space-y-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <label key={lang.code} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contentLanguages.includes(lang.code)}
                  onChange={() => toggleContentLanguage(lang.code)}
                  className="w-5 h-5 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-white">{lang.name}</span>
              </label>
            ))}
          </div>
          <p className="text-sm text-white/60 mt-2">
            タイムラインに表示される投稿の言語をフィルタリングします
          </p>
        </div>
      </div>

      {/* アカウントセクション */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">アカウント</h2>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white">ログアウト</p>
            <p className="text-sm text-white/60">現在のアカウントからログアウトします</p>
          </div>
          <button
            onClick={handleLogout}
            className="glass-button bg-red-500/20 hover:bg-red-500/30 text-red-400"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={isSaving} className="glass-button btn-primary">
          {isSaving ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              保存中...
            </span>
          ) : (
            '設定を保存'
          )}
        </button>
      </div>
    </div>
  );
};
