import type { SessionData } from '../types/session';

/**
 * Fallback session storage for environments without Web Crypto API
 * WARNING: This is not secure and should only be used in development
 */
export class FallbackSessionStorage {
  private static readonly SESSION_KEY = 'bsky-session';
  private static readonly SESSION_EXPIRY_KEY = 'bsky-session-expiry';
  private static readonly SESSION_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days

  static save(data: SessionData, persist: boolean = true): void {
    // console.log('[FallbackStorage] Saving session, persist:', persist);
    const expiry = Date.now() + this.SESSION_DURATION;
    const serialized = JSON.stringify(data);

    if (persist) {
      localStorage.setItem(this.SESSION_KEY, serialized);
      localStorage.setItem(this.SESSION_EXPIRY_KEY, expiry.toString());
      // console.log('[FallbackStorage] Saved to localStorage');
    }

    sessionStorage.setItem(this.SESSION_KEY, serialized);
    sessionStorage.setItem(this.SESSION_EXPIRY_KEY, expiry.toString());
    // console.log('[FallbackStorage] Saved to sessionStorage');
  }

  static get(): SessionData | null {
    // console.log('[FallbackStorage] Getting session...');
    let data = sessionStorage.getItem(this.SESSION_KEY);
    let expiry = sessionStorage.getItem(this.SESSION_EXPIRY_KEY);
    // console.log('[FallbackStorage] SessionStorage data:', data ? 'Found' : 'Not found');

    if (!data) {
      data = localStorage.getItem(this.SESSION_KEY);
      expiry = localStorage.getItem(this.SESSION_EXPIRY_KEY);
      // console.log('[FallbackStorage] LocalStorage data:', data ? 'Found' : 'Not found');

      if (data && expiry) {
        sessionStorage.setItem(this.SESSION_KEY, data);
        sessionStorage.setItem(this.SESSION_EXPIRY_KEY, expiry);
      }
    }

    if (!data || !expiry) {
      return null;
    }

    if (Date.now() > parseInt(expiry, 10)) {
      this.clear();
      return null;
    }

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse session:', error);
      this.clear();
      return null;
    }
  }

  static clear(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.SESSION_EXPIRY_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.SESSION_EXPIRY_KEY);
  }
}
