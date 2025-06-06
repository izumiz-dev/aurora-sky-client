/**
 * セッション情報の暗号化・復号化を行うユーティリティクラス
 */
export class SessionCrypto {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_SIZE = 256;
  private static readonly IV_SIZE = 12;
  // private static readonly TAG_SIZE = 16; // Currently unused

  /**
   * 暗号化キーを取得または生成
   */
  private static async getOrCreateKey(): Promise<CryptoKey> {
    // Web Crypto APIの可用性をチェック
    if (!crypto || !crypto.subtle) {
      throw new Error('Web Crypto API is not available. HTTPS is required for session encryption.');
    }

    const keyString = import.meta.env.VITE_SESSION_KEY;

    // デバッグ用：環境変数の状態を確認
    // console.log('[Crypto] Environment:', import.meta.env.PROD ? 'production' : 'development');
    // console.log('[Crypto] Key configured:', !!keyString);

    // 本番環境でキーが設定されていない場合、デフォルトキーを使用（セキュリティ警告付き）
    if (!keyString) {
      if (import.meta.env.PROD) {
        console.error('[Crypto] WARNING: Session encryption key not configured for production!');
        console.error('[Crypto] Using fallback key. This is NOT secure for production use.');
        console.error(
          '[Crypto] Please set VITE_SESSION_KEY in your deployment environment variables.'
        );
        console.error('[Crypto] Generate a secure key using: node scripts/generate-session-key.js');
        // 本番環境では警告を表示し続ける
        const warningElement = document.createElement('div');
        warningElement.style.cssText =
          'position:fixed;top:0;left:0;right:0;background:#ff0000;color:white;padding:10px;text-align:center;z-index:9999;';
        warningElement.textContent =
          '⚠️ セキュリティ警告: セッション暗号化キーが設定されていません';
        document.body.appendChild(warningElement);
      } else {
        console.warn('[Crypto] Using default development key.');
      }
    }

    const storedKeyHash = localStorage.getItem('aurora-sky-key-hash');
    const currentKeyHash = await this.hashKey(keyString || 'default-dev-key-for-development-only');

    if (storedKeyHash && storedKeyHash !== currentKeyHash) {
      console.warn(
        '[Crypto] Encryption key has changed. Existing sessions may become inaccessible.'
      );
      // 既存のセッションをクリアすることを検討
      if (import.meta.env.PROD) {
        console.error('[Crypto] Critical: Encryption key change detected in production!');
      }
    }

    localStorage.setItem('aurora-sky-key-hash', currentKeyHash);

    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyString || 'default-dev-key-for-development-only');

    // PBKDF2を使用してより安全なキー導出を行う
    const salt = encoder.encode('aurora-sky-session-salt'); // 固定ソルト（理想的には動的生成）
    const keyMaterial = await crypto.subtle.importKey('raw', keyData, 'PBKDF2', false, [
      'deriveBits',
      'deriveKey',
    ]);

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_SIZE },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * データを暗号化
   */
  static async encrypt(data: string): Promise<string> {
    try {
      // console.log('[Crypto] Starting encryption...');
      const key = await this.getOrCreateKey();
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(data);

      // 初期化ベクトル（IV）を生成
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_SIZE));

      // 暗号化
      const encryptedData = await crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv },
        key,
        encodedData
      );

      // IVと暗号化データを結合
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedData), iv.length);

      // Base64エンコードして返す
      const result = btoa(String.fromCharCode(...combined));
      // console.log('[Crypto] Encryption successful');
      return result;
    } catch (error) {
      console.error('[Crypto] Encryption failed:', error);
      if (error instanceof Error) {
        console.error('[Crypto] Error details:', error.message);
        console.error('[Crypto] Error stack:', error.stack);
        throw new Error(`Failed to encrypt data: ${error.message}`);
      }
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * データを復号化
   */
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.getOrCreateKey();

      // Base64デコード
      const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

      // IVと暗号化データを分離
      const iv = combined.slice(0, this.IV_SIZE);
      const ciphertext = combined.slice(this.IV_SIZE);

      // 復号化
      const decryptedData = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv },
        key,
        ciphertext
      );

      // 文字列に変換して返す
      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to decrypt data: ${error.message}`);
      }
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * キーのハッシュを生成（キー変更検出用）
   */
  private static async hashKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}
