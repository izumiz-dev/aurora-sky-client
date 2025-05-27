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
    console.log('[Crypto] Environment:', import.meta.env.PROD ? 'production' : 'development');
    console.log('[Crypto] Key configured:', !!keyString);
    
    // 本番環境でキーが設定されていない場合、デフォルトキーを使用（セキュリティ警告付き）
    if (!keyString) {
      if (import.meta.env.PROD) {
        console.error('[Crypto] WARNING: Session encryption key not configured for production!');
        console.error('[Crypto] Using fallback key. This is NOT secure for production use.');
        console.error('[Crypto] Please set VITE_SESSION_KEY in your deployment environment variables.');
      } else {
        console.warn('[Crypto] Using default development key.');
      }
    }
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyString || 'default-dev-key-for-development-only');
    
    // PBKDF2を使用してより安全なキー導出を行う
    const salt = encoder.encode('aurora-sky-session-salt'); // 固定ソルト（理想的には動的生成）
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      keyData,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
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
      console.log('[Crypto] Starting encryption...');
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
      console.log('[Crypto] Encryption successful');
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
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
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
}