import { useSessionMonitor } from './useSessionMonitor';

/**
 * 条件付きでセッション監視を有効化するラッパー
 */
export function useConditionalSessionMonitor() {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSessionMonitor();
  }
}
