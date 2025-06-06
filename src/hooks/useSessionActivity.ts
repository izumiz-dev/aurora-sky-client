import { useEffect, useRef } from 'preact/hooks';
import { SessionManager } from '../lib/sessionManager';

/**
 * アクティブユーザーのセッションを自動延長するフック
 */
export function useSessionActivity() {
  const lastActivityRef = useRef<number>(Date.now());
  const extendIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // アクティビティを記録するイベント
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // イベントリスナーを登録
    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // 定期的にセッションを延長（5分ごと、アクティブな場合のみ）
    extendIntervalRef.current = setInterval(
      async () => {
        const now = Date.now();
        const timeSinceActivity = now - lastActivityRef.current;
        const fiveMinutes = 5 * 60 * 1000;

        // 過去5分以内にアクティビティがあった場合のみセッションを延長
        if (timeSinceActivity < fiveMinutes) {
          try {
            console.log('[SessionActivity] User active, extending session');
            await SessionManager.extendSession();
          } catch (error) {
            console.error('[SessionActivity] Failed to extend session:', error);
          }
        }
      },
      5 * 60 * 1000
    ); // 5分ごとにチェック

    // クリーンアップ
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });

      if (extendIntervalRef.current) {
        clearInterval(extendIntervalRef.current);
      }
    };
  }, []);

  // 手動でアクティビティを記録する関数も提供
  const recordActivity = () => {
    lastActivityRef.current = Date.now();
  };

  return { recordActivity };
}
