import { SessionCrypto } from './crypto';

interface StoredCredential {
  identifier: string;
  password: string;
  storedAt: number;
  deviceId: string;
}

/**
 * 自動ログイン用のクレデンシャル管理クラス
 * セキュリティ対策：
 * - 暗号化して保存
 * - 7日間の有効期限
 * - デバイス識別
 */
export class CredentialStorage {
  private static readonly STORAGE_KEY = 'aurora-sky-auto-login';
  private static readonly EXPIRY_DAYS = 7; // 7日間の有効期限
  private static readonly DEVICE_ID_KEY = 'aurora-sky-device-id';

  /**
   * デバイスIDを取得または生成
   */
  private static getDeviceId(): string {
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (!deviceId) {
      // ブラウザのフィンガープリントを生成
      const userAgent = navigator.userAgent;
      const language = navigator.language;
      const platform = navigator.platform;
      const screenResolution = `${screen.width}x${screen.height}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // これらの情報を組み合わせてハッシュ値を生成
      const fingerprint = `${userAgent}-${language}-${platform}-${screenResolution}-${timezone}`;
      deviceId = btoa(fingerprint).substring(0, 32);

      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  /**
   * クレデンシャルを暗号化して保存
   */
  static async save(identifier: string, password: string): Promise<void> {
    try {
      const credential: StoredCredential = {
        identifier,
        password,
        storedAt: Date.now(),
        deviceId: this.getDeviceId(),
      };

      const encrypted = await SessionCrypto.encrypt(JSON.stringify(credential));
      localStorage.setItem(this.STORAGE_KEY, encrypted);

      console.log('[CredentialStorage] Credentials saved securely');
    } catch (error) {
      console.error('[CredentialStorage] Failed to save credentials:', error);
      throw new Error('クレデンシャルの保存に失敗しました');
    }
  }

  /**
   * 保存されたクレデンシャルを取得
   */
  static async get(): Promise<{ identifier: string; password: string } | null> {
    try {
      const encrypted = localStorage.getItem(this.STORAGE_KEY);
      if (!encrypted) {
        return null;
      }

      const decrypted = await SessionCrypto.decrypt(encrypted);
      const credential: StoredCredential = JSON.parse(decrypted);

      // デバイスIDの確認
      if (credential.deviceId !== this.getDeviceId()) {
        console.warn('[CredentialStorage] Device ID mismatch, clearing credentials');
        this.clear();
        return null;
      }

      // 有効期限の確認（7日間）
      const expiryTime = credential.storedAt + this.EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      if (Date.now() > expiryTime) {
        console.log('[CredentialStorage] Credentials expired, clearing');
        this.clear();
        return null;
      }

      // 最後の使用から24時間以上経過している場合は再認証を促す
      const lastUsedKey = 'aurora-sky-last-auto-login';
      const lastUsed = localStorage.getItem(lastUsedKey);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      if (lastUsed && parseInt(lastUsed) < oneDayAgo) {
        console.log('[CredentialStorage] Requiring re-authentication after 24 hours');
        // 24時間以上経過していても、7日以内なら認証情報は返す
        // UIで再認証を促すメッセージを表示する
      }

      localStorage.setItem(lastUsedKey, Date.now().toString());

      return {
        identifier: credential.identifier,
        password: credential.password,
      };
    } catch (error) {
      console.error('[CredentialStorage] Failed to retrieve credentials:', error);
      // 復号化に失敗した場合はクリア
      this.clear();
      return null;
    }
  }

  /**
   * 保存されたクレデンシャルをクリア
   */
  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('aurora-sky-last-auto-login');
    console.log('[CredentialStorage] Credentials cleared');
  }

  /**
   * クレデンシャルが保存されているかチェック
   */
  static exists(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * 最後の自動ログインから経過した時間を取得
   */
  static getTimeSinceLastAutoLogin(): number | null {
    const lastUsed = localStorage.getItem('aurora-sky-last-auto-login');
    if (!lastUsed) return null;

    return Date.now() - parseInt(lastUsed);
  }

  /**
   * 再認証が必要かチェック（24時間以上経過）
   */
  static needsReauthentication(): boolean {
    const timeSince = this.getTimeSinceLastAutoLogin();
    if (timeSince === null) return false;

    return timeSince > 24 * 60 * 60 * 1000;
  }
}
