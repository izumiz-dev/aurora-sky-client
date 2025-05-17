import { useState, useEffect } from 'preact/hooks';
import { useAuth } from '../context/AuthContext';
import { useLanguagePreferences } from '../context/LanguagePreferences';
import { AppIcon } from '../components/AppIcon';

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

export const ModernSettingsPage = () => {
  const { isAuthenticated } = useAuth();
  const { preferences, updatePreferences: updateLangPrefs, isLoading } = useLanguagePreferences();
  const [contentLanguages, setContentLanguages] = useState<string[]>([]);
  const [showAllLanguages, setShowAllLanguages] = useState(true);
  const [postLanguage, setPostLanguage] = useState<string>('ja');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Update local state when context preferences change
    setPostLanguage(preferences.postLanguage);
    setContentLanguages(preferences.contentLanguages);
    setShowAllLanguages(preferences.showAllLanguages);
  }, [preferences]);

  const handleSave = async () => {
    if (!isAuthenticated) return;
    
    setIsSaving(true);
    setSuccessMessage(null);
    
    try {
      await updateLangPrefs({
        postLanguage,
        contentLanguages,
        showAllLanguages
      });
      
      setSuccessMessage('設定を保存しました');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setSuccessMessage('設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleContentLanguage = (langCode: string) => {
    setContentLanguages(prev => {
      if (prev.includes(langCode)) {
        return prev.filter(code => code !== langCode);
      } else {
        return [...prev, langCode];
      }
    });
  };

  const handleShowAllToggle = () => {
    setShowAllLanguages(!showAllLanguages);
    if (!showAllLanguages) {
      setContentLanguages([]);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="glass-card p-8 text-center ambient-fade-in">
          <AppIcon size="lg" withGradientBg={false} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">設定</h2>
          <p className="text-white/70">設定を表示するにはログインしてください</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex justify-center py-12">
          <div className="glass-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6">
      <h1 className="text-3xl font-bold text-white mb-8 shimmer-text">設定</h1>

      {/* 成功メッセージ */}
      {successMessage && (
        <div className={`mb-6 p-4 glass ${successMessage.includes('失敗') ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} border rounded-lg ambient-fade-in`}>
          <p className={`${successMessage.includes('失敗') ? 'text-red-400' : 'text-green-400'} flex items-center`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              {successMessage.includes('失敗') ? (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            {successMessage}
          </p>
        </div>
      )}

      {/* 言語設定セクション */}
      <div className="glass-card p-6 mb-6 ambient-fade-in">
        <div className="flex items-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
          <h2 className="text-xl font-semibold text-white">言語設定</h2>
        </div>
        
        {/* 投稿言語 */}
        <div className="mb-8 p-4 glass rounded-lg hover-lift">
          <label className="block text-white/90 font-medium mb-3">投稿のデフォルト言語</label>
          <select
            value={postLanguage}
            onChange={(e) => setPostLanguage(e.target.value)}
            className="glass-input ambient-hover"
          >
            {LANGUAGE_OPTIONS.map(lang => (
              <option key={lang.code} value={lang.code} className="bg-gray-900">
                {lang.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-white/60 mt-3">
            新しい投稿を作成する際のデフォルト言語です
          </p>
        </div>

        {/* コンテンツ言語 */}
        <div className="p-4 glass rounded-lg hover-lift">
          <label className="block text-white/90 font-medium mb-3">表示するコンテンツの言語</label>
          
          {/* すべての言語を表示する設定 */}
          <div className="mb-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 glass rounded-lg hover:bg-white/5 transition-all">
              <input
                type="checkbox"
                checked={showAllLanguages}
                onChange={handleShowAllToggle}
                className="w-5 h-5 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-white font-medium">すべての言語を表示</span>
            </label>
          </div>

          {/* 個別言語選択（すべてが選択されていない場合のみ表示） */}
          {!showAllLanguages && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {LANGUAGE_OPTIONS.map(lang => (
                <label key={lang.code} className="flex items-center space-x-3 cursor-pointer p-3 glass rounded-lg hover:bg-white/5 transition-all">
                  <input
                    type="checkbox"
                    checked={contentLanguages.includes(lang.code)}
                    onChange={() => toggleContentLanguage(lang.code)}
                    className="w-5 h-5 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-white select-none">{lang.name}</span>
                </label>
              ))}
            </div>
          )}

          <p className="text-sm text-white/60 mt-3">
            タイムラインに表示される投稿の言語をフィルタリングします
          </p>
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="glass-button btn-primary px-6 py-3 hover:scale-105 transition-transform"
        >
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