/**
 * Sentryの統合（将来的な実装用のスタブ）
 * Sentryを使用する場合は、以下のパッケージをインストールしてください：
 * npm install @sentry/browser @sentry/tracing
 */

/**
 * Sentryの初期化
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn || import.meta.env.DEV) {
    return;
  }
  
  // Sentryがインストールされていない場合は何もしない
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('Sentry integration is not configured. To enable, install @sentry/browser');
  }
}

/**
 * エラーをSentryに報告
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    return;
  }
  
  // 開発環境ではコンソールに出力
  if (import.meta.env.DEV) {
    console.error('Sentry captureError:', error, context);
  }
}

/**
 * カスタムメッセージを送信
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    return;
  }
  
  // 開発環境ではコンソールに出力
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info(`Sentry captureMessage [${level}]:`, message);
  }
}

/**
 * ユーザー情報を設定
 */
export function setUser(user: { id: string; username?: string }): void {
  // 将来的な実装用
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('Sentry setUser:', user);
  }
}

/**
 * ユーザー情報をクリア
 */
export function clearUser(): void {
  // 将来的な実装用
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('Sentry clearUser');
  }
}