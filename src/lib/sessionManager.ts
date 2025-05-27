import { SessionCrypto } from './crypto';
import { FallbackSessionStorage } from './sessionStorage';
import type { SessionData } from '../types/session';

/**
 * セキュアなセッション管理を行うクラス
 */
export class SessionManager {
  private static readonly SESSION_KEY = 'bsky-session-encrypted';
  private static readonly SESSION_EXPIRY_KEY = 'bsky-session-expiry';
  private static readonly SESSION_DURATION = 14 * 24 * 60 * 60 * 1000; // 14日間（安全のため短めに設定）

  /**
   * セッションを暗号化して保存
   */
  static async saveSession(sessionData: SessionData, persist: boolean = true): Promise<void> {
    try {
      console.log('[SessionManager] Saving session, persist:', persist);
      console.log('[SessionManager] Session data:', { 
        did: sessionData.did, 
        handle: sessionData.handle,
        active: sessionData.active 
      });
      
      // Web Crypto APIが利用可能かチェック
      if (!crypto || !crypto.subtle) {
        console.warn('[SessionManager] Web Crypto API not available, using fallback storage');
        FallbackSessionStorage.save(sessionData, persist);
        return;
      }
      
      // セッションデータを暗号化
      const encrypted = await SessionCrypto.encrypt(JSON.stringify(sessionData));
      
      // 有効期限を設定
      const expiry = Date.now() + this.SESSION_DURATION;
      
      if (persist) {
        // localStorageを優先的に使用（ブラウザを閉じても保持される）
        localStorage.setItem(this.SESSION_KEY, encrypted);
        localStorage.setItem(this.SESSION_EXPIRY_KEY, expiry.toString());
        console.log('[SessionManager] Saved encrypted session to localStorage');
      }
      
      // sessionStorageにも保存（現在のタブでの高速アクセス用）
      sessionStorage.setItem(this.SESSION_KEY, encrypted);
      sessionStorage.setItem(this.SESSION_EXPIRY_KEY, expiry.toString());
      console.log('[SessionManager] Saved encrypted session to sessionStorage');
    } catch (error) {
      console.error('Failed to save session:', error);
      // 暗号化に失敗した場合はフォールバックを使用
      if (error instanceof Error && error.message.includes('Web Crypto API')) {
        console.warn('Falling back to unencrypted storage');
        FallbackSessionStorage.save(sessionData, persist);
        return;
      }
      throw new Error('セッションの保存に失敗しました');
    }
  }

  /**
   * 暗号化されたセッションを取得・復号化
   */
  static async getSession(): Promise<SessionData | null> {
    try {
      console.log('[SessionManager] Getting session...');
      console.log('[SessionManager] Crypto available:', !!crypto?.subtle);
      
      // Web Crypto APIが利用できない場合はフォールバックを使用
      if (!crypto || !crypto.subtle) {
        console.warn('[SessionManager] Web Crypto API not available, using fallback storage');
        const fallbackSession = FallbackSessionStorage.get();
        console.log('[SessionManager] Fallback session:', fallbackSession ? 'Found' : 'Not found');
        return fallbackSession;
      }
      
      // まずsessionStorageから取得を試みる（高速アクセス）
      let encrypted = sessionStorage.getItem(this.SESSION_KEY);
      let expiry = sessionStorage.getItem(this.SESSION_EXPIRY_KEY);
      console.log('[SessionManager] SessionStorage encrypted:', encrypted ? 'Found' : 'Not found');
      
      // sessionStorageにない場合はlocalStorageから取得
      if (!encrypted) {
        encrypted = localStorage.getItem(this.SESSION_KEY);
        expiry = localStorage.getItem(this.SESSION_EXPIRY_KEY);
        console.log('[SessionManager] LocalStorage encrypted:', encrypted ? 'Found' : 'Not found');
        
        // localStorageから取得できた場合、sessionStorageにもコピー
        if (encrypted && expiry) {
          sessionStorage.setItem(this.SESSION_KEY, encrypted);
          sessionStorage.setItem(this.SESSION_EXPIRY_KEY, expiry);
        }
      }
      
      if (!encrypted || !expiry) {
        console.log('[SessionManager] No encrypted session found, checking fallback...');
        
        // 旧形式のセッションをチェック（マイグレーション用）
        const oldSession = localStorage.getItem('bsky-session');
        console.log('[SessionManager] Old format session:', oldSession ? 'Found' : 'Not found');
        if (oldSession) {
          try {
            const parsed = JSON.parse(oldSession);
            // 旧セッションを新形式で保存
            await this.saveSession(parsed, true);
            // 旧セッションを削除
            localStorage.removeItem('bsky-session');
            return parsed;
          } catch (e) {
            console.error('Failed to migrate old session:', e);
          }
        }
        
        // フォールバックストレージもチェック
        const fallbackSession = FallbackSessionStorage.get();
        console.log('[SessionManager] Fallback storage check:', fallbackSession ? 'Found' : 'Not found');
        if (fallbackSession) {
          return fallbackSession;
        }
        
        console.log('[SessionManager] No session found anywhere');
        return null;
      }
      
      // 有効期限をチェック
      if (Date.now() > parseInt(expiry, 10)) {
        console.warn('Session expired');
        this.clearSession();
        return null;
      }
      
      // 復号化
      const decrypted = await SessionCrypto.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to get session:', error);
      // エラーの詳細をログ
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      
      // 暗号化エラーの場合はフォールバックを試す
      if (error instanceof Error && (error.message.includes('Failed to decrypt') || error.message.includes('Web Crypto API'))) {
        console.warn('Trying fallback storage due to crypto error');
        const fallbackSession = FallbackSessionStorage.get();
        if (fallbackSession) {
          return fallbackSession;
        }
        
        // 暗号化キーが変更された可能性があるため、セッションをクリア
        this.clearSession();
      }
      return null;
    }
  }

  /**
   * セッションをクリア
   */
  static clearSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.SESSION_EXPIRY_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.SESSION_EXPIRY_KEY);
    
    // フォールバックストレージもクリア
    FallbackSessionStorage.clear();
  }

  /**
   * セッションをサーバー側でも無効化してからクリア
   */
  static async logoutSession(session: SessionData): Promise<void> {
    try {
      // サーバー側でセッションを無効化
      const { BskyAgent } = await import('@atproto/api');
      const agent = new BskyAgent({ service: 'https://bsky.social' });
      
      // セッションを復元してからログアウト
      await agent.resumeSession(session);
      
      // サーバー側でセッションを削除（API v2では利用可能）
      // 現在のAPIでは明示的なログアウトエンドポイントがないため、
      // クライアント側でのクリアのみ行う
      
    } catch (error) {
      console.error('Failed to invalidate session on server:', error);
    } finally {
      // クライアント側のセッションをクリア
      this.clearSession();
    }
  }

  /**
   * セッションの有効期限を延長
   */
  static async extendSession(): Promise<void> {
    const session = await this.getSession();
    if (session) {
      await this.saveSession(session);
    }
  }

  /**
   * 永続化設定を保存
   * @deprecated セッションは常に永続化されるようになりました
   */
  static setPersist(_persist: boolean): void {
    // この機能は廃止されました。セッションは常に永続化されます。
    console.warn('setPersist is deprecated. Sessions are now always persisted.');
  }
}