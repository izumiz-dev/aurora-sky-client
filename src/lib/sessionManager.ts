import { SessionCrypto } from './crypto';
import type { SessionData } from '../types/session';

/**
 * セキュアなセッション管理を行うクラス
 */
export class SessionManager {
  private static readonly SESSION_KEY = 'bsky-session-encrypted';
  private static readonly SESSION_EXPIRY_KEY = 'bsky-session-expiry';
  private static readonly SESSION_DURATION = 90 * 24 * 60 * 60 * 1000; // 90日間（リフレッシュトークンの有効期限）

  /**
   * セッションを暗号化して保存
   */
  static async saveSession(sessionData: SessionData): Promise<void> {
    try {
      // セッションデータを暗号化
      const encrypted = await SessionCrypto.encrypt(JSON.stringify(sessionData));
      
      // 有効期限を設定
      const expiry = Date.now() + this.SESSION_DURATION;
      
      // sessionStorageを使用（タブを閉じると自動的に削除される）
      sessionStorage.setItem(this.SESSION_KEY, encrypted);
      sessionStorage.setItem(this.SESSION_EXPIRY_KEY, expiry.toString());
      
      // 長期保存が必要な場合はlocalStorageも使用（暗号化済み）
      if (this.shouldPersist()) {
        localStorage.setItem(this.SESSION_KEY, encrypted);
        localStorage.setItem(this.SESSION_EXPIRY_KEY, expiry.toString());
      }
    } catch (error) {
      console.error('Failed to save session:', error);
      throw new Error('セッションの保存に失敗しました');
    }
  }

  /**
   * 暗号化されたセッションを取得・復号化
   */
  static async getSession(): Promise<SessionData | null> {
    try {
      // まずsessionStorageから取得を試みる
      let encrypted = sessionStorage.getItem(this.SESSION_KEY);
      let expiry = sessionStorage.getItem(this.SESSION_EXPIRY_KEY);
      
      // sessionStorageにない場合はlocalStorageから取得
      if (!encrypted && this.shouldPersist()) {
        encrypted = localStorage.getItem(this.SESSION_KEY);
        expiry = localStorage.getItem(this.SESSION_EXPIRY_KEY);
      }
      
      if (!encrypted || !expiry) {
        return null;
      }
      
      // 有効期限をチェック
      if (Date.now() > parseInt(expiry, 10)) {
        this.clearSession();
        return null;
      }
      
      // 復号化
      const decrypted = await SessionCrypto.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to get session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * セッションをクリア
   */
  static clearSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.SESSION_EXPIRY_KEY);
    
    if (this.shouldPersist()) {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.SESSION_EXPIRY_KEY);
    }
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
   * 永続化設定をチェック
   */
  private static shouldPersist(): boolean {
    // ユーザーの設定に基づいて永続化を決定
    return localStorage.getItem('persistSession') === 'true';
  }

  /**
   * 永続化設定を保存
   */
  static setPersist(persist: boolean): void {
    if (persist) {
      localStorage.setItem('persistSession', 'true');
    } else {
      localStorage.removeItem('persistSession');
    }
  }
}