import { useEffect } from 'preact/hooks';
import { SessionManager } from '../lib/sessionManager';
import { useAuth } from '../context/AuthContext';

/**
 * セッションの状態を監視し、デバッグ情報を提供するフック
 */
export function useSessionMonitor() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    // セッション状態をログに記録
    const logSessionState = async () => {
      try {
        const session = await SessionManager.getSession();
        if (session) {
          // JWTトークンのデコード（デバッグ用）
          const decodeJWT = (token: string) => {
            try {
              const parts = token.split('.');
              if (parts.length !== 3) return null;
              const payload = JSON.parse(atob(parts[1]));
              return payload;
            } catch {
              return null;
            }
          };

          const accessPayload = decodeJWT(session.accessJwt);
          const refreshPayload = decodeJWT(session.refreshJwt);

          const now = Date.now();
          const accessExpiry = accessPayload?.exp ? new Date(accessPayload.exp * 1000) : null;
          const refreshExpiry = refreshPayload?.exp ? new Date(refreshPayload.exp * 1000) : null;

          console.group('[SessionMonitor] Session State');
          console.log('DID:', session.did);
          console.log('Handle:', session.handle);
          console.log('Active:', session.active);

          if (accessExpiry) {
            const timeUntilAccessExpiry = (accessExpiry.getTime() - now) / 1000;
            console.log('Access Token Expires:', accessExpiry.toISOString());
            console.log(
              'Time until access expiry:',
              `${Math.floor(timeUntilAccessExpiry / 60)}m ${Math.floor(timeUntilAccessExpiry % 60)}s`
            );

            if (timeUntilAccessExpiry < 300) {
              console.warn('⚠️ Access token expires soon!');
            }
          }

          if (refreshExpiry) {
            const timeUntilRefreshExpiry = (refreshExpiry.getTime() - now) / 1000;
            console.log('Refresh Token Expires:', refreshExpiry.toISOString());
            console.log(
              'Time until refresh expiry:',
              `${Math.floor(timeUntilRefreshExpiry / 86400)}d ${Math.floor((timeUntilRefreshExpiry % 86400) / 3600)}h`
            );

            if (timeUntilRefreshExpiry < 86400) {
              // 1日以内
              console.warn('⚠️ Refresh token expires within 24 hours!');
            }
          }

          // ストレージの状態を確認
          const encryptedInLocal = !!localStorage.getItem('bsky-session-encrypted');
          const encryptedInSession = !!sessionStorage.getItem('bsky-session-encrypted');
          console.log('Storage State:', {
            localStorage: encryptedInLocal,
            sessionStorage: encryptedInSession,
          });

          console.groupEnd();
        } else {
          console.warn('[SessionMonitor] No active session found');
        }
      } catch (error) {
        console.error('[SessionMonitor] Failed to get session state:', error);
      }
    };

    // 初回ログ
    logSessionState();

    // 定期的にセッション状態をログ（開発環境のみ）
    let intervalId: NodeJS.Timeout | null = null;
    if (import.meta.env.DEV) {
      intervalId = setInterval(logSessionState, 60000); // 1分ごと
    }

    // ページ表示/非表示時にもログ
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[SessionMonitor] Page became visible, checking session...');
        logSessionState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // セッションイベントを監視
    const monitorSessionEvents = () => {
      // localStorageの変更を監視
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function (key: string, value: string) {
        if (key === 'bsky-session-encrypted' || key === 'bsky-session-expiry') {
          console.log(`[SessionMonitor] localStorage.${key} updated`);
        }
        return originalSetItem.call(this, key, value);
      };

      // sessionStorageの変更を監視
      const originalSessionSetItem = sessionStorage.setItem;
      sessionStorage.setItem = function (key: string, value: string) {
        if (key === 'bsky-session-encrypted' || key === 'bsky-session-expiry') {
          console.log(`[SessionMonitor] sessionStorage.${key} updated`);
        }
        return originalSessionSetItem.call(this, key, value);
      };

      return () => {
        localStorage.setItem = originalSetItem;
        sessionStorage.setItem = originalSessionSetItem;
      };
    };

    const cleanupMonitor = monitorSessionEvents();

    // クリーンアップ
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupMonitor();
    };
  }, [isAuthenticated]);
}
