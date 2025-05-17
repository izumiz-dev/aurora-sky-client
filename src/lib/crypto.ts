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
    const keyString = import.meta.env.VITE_SESSION_KEY || 'default-dev-key-change-in-production';
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyString);
    
    // ハッシュ化してキーマテリアルを生成
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    
    return crypto.subtle.importKey(
      'raw',
      hashBuffer,
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
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
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
      throw new Error('Failed to decrypt data');
    }
  }
}