import { useState } from 'preact/hooks';

export const DevelopmentNotice = () => {
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('dev-notice-dismissed') === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('dev-notice-dismissed', 'true');
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="glass-card bg-yellow-500/10 border border-yellow-500/30 p-4 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
        aria-label="閉じる"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start space-x-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5"
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

        <div className="flex-1 pr-6">
          <h3 className="font-semibold text-yellow-400 mb-1">開発版のご利用にあたって</h3>
          <p className="text-sm text-white/90 leading-relaxed">
            本アプリケーションは現在開発中のプレビュー版です。
            機能の不具合やデータの消失が発生する可能性があります。
            利用に起因するいかなる損害についても、開発者は責任を負いかねます。
            ご理解の上でお使いください。
          </p>
          <p className="text-xs text-white/60 mt-2">
            フィードバックは
            <a
              href="https://github.com/izumiz-dev/aurora-sky-client/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline ml-1"
            >
              GitHub Issues
            </a>
            までお寄せください。
          </p>
        </div>
      </div>
    </div>
  );
};