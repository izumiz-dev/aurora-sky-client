import { useEffect } from 'preact/hooks';
import { SessionManager } from '../lib/sessionManager';
import { useAuth } from '../context/AuthContext';

/**
 * マルチタブ間でセッションを同期するフック
 */
export function useSessionSync() {
  const { logout } = useAuth();

  useEffect(() => {
    let cleanup: (() => void) | void;

    // BroadcastChannelがサポートされているかチェック
    if (!('BroadcastChannel' in window)) {
      console.warn('[SessionSync] BroadcastChannel not supported, using storage events');

      // フォールバック: storageイベントを使用
      const handleStorageChange = async (e: StorageEvent) => {
        if (e.key === 'bsky-session-encrypted' || e.key === 'bsky-session-expiry') {
          console.log('[SessionSync] Session changed in another tab');

          // セッションが削除された場合
          if (!e.newValue) {
            console.log('[SessionSync] Session cleared in another tab, logging out');
            logout();
          } else {
            // セッションが更新された場合は再読み込み
            try {
              const session = await SessionManager.getSession();
              if (session) {
                console.log('[SessionSync] Reloading session from another tab');
                window.location.reload();
              }
            } catch (error) {
              console.error('[SessionSync] Failed to reload session:', error);
            }
          }
        }
      };

      (window as Window).addEventListener('storage', handleStorageChange);
      cleanup = () => (window as Window).removeEventListener('storage', handleStorageChange);
    } else {
      // BroadcastChannelを使用してタブ間通信
      const channel = new BroadcastChannel('aurora-sky-session');

      channel.onmessage = async (event) => {
        const { type } = event.data;
        console.log('[SessionSync] Received message:', type);

        switch (type) {
          case 'session-updated':
            // 他のタブでセッションが更新された
            console.log('[SessionSync] Session updated in another tab');
            try {
              const session = await SessionManager.getSession();
              if (session) {
                window.location.reload();
              }
            } catch (error) {
              console.error('[SessionSync] Failed to sync session:', error);
            }
            break;

          case 'session-cleared':
            // 他のタブでログアウトされた
            console.log('[SessionSync] Session cleared in another tab, logging out');
            logout();
            break;

          case 'token-refreshed':
            // 他のタブでトークンがリフレッシュされた
            console.log('[SessionSync] Token refreshed in another tab');
            try {
              await SessionManager.getSession();
            } catch (error) {
              console.error('[SessionSync] Failed to get refreshed session:', error);
            }
            break;
        }
      };

      // セッション更新をブロードキャスト
      const originalSaveSession = SessionManager.saveSession;
      SessionManager.saveSession = async function (...args) {
        const result = await originalSaveSession.apply(SessionManager, args);
        channel.postMessage({ type: 'session-updated', timestamp: Date.now() });
        return result;
      };

      // セッションクリアをブロードキャスト
      const originalClearSession = SessionManager.clearSession;
      SessionManager.clearSession = function () {
        originalClearSession.call(SessionManager);
        channel.postMessage({ type: 'session-cleared', timestamp: Date.now() });
      };

      // クリーンアップ
      cleanup = () => {
        channel.close();
        // 元のメソッドを復元
        SessionManager.saveSession = originalSaveSession;
        SessionManager.clearSession = originalClearSession;
      };
    }

    return cleanup;
  }, [logout]);
}
