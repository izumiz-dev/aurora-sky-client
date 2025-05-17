/**
 * アバター画像キャッシュ管理
 * Blueskyのアバター画像を効率的にキャッシュし、オフライン対応とパフォーマンス向上を実現
 */

interface CachedAvatar {
  url: string;
  blob: Blob;
  timestamp: number;
  handle?: string;
}

const DB_NAME = 'AuroraSkyAvatars';
const DB_STORE_NAME = 'avatars';
const DB_VERSION = 1;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間
const MAX_CACHE_SIZE = 50; // 最大50個のアバターをキャッシュ
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

class AvatarCacheManager {
  private memoryCache: Map<string, string> = new Map();
  private db: IDBDatabase | null = null;
  // private pendingRequests: Map<string, Promise<string>> = new Map();

  constructor() {
    this.initDB();
  }

  /**
   * IndexedDBの初期化
   */
  private async initDB(): Promise<void> {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.cleanupOldCache();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
          const store = db.createObjectStore(DB_STORE_NAME, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('handle', 'handle', { unique: false });
        }
      };
    } catch (error) {
      console.error('IndexedDB initialization failed:', error);
    }
  }

  /**
   * アバター画像のURLパターンを分析
   */
  private isBlueskyAvatarUrl(url: string): boolean {
    if (!url) return false;
    
    // Blueskyのアバター画像URL パターン
    const patterns = [
      /^https:\/\/cdn\.bsky\.app/,
      /^https:\/\/bsky\.social\/xrpc\/com\.atproto/,
      /^https:\/\/.*\.bsky\.network/,
    ];
    
    return patterns.some(pattern => pattern.test(url));
  }

  /**
   * 画像をfetchしてBlobとして取得
   */
  private async fetchImageAsBlob(url: string, retryCount = 0): Promise<Blob> {
    try {
      // First try fetch API
      const response = await fetch(url, {
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error: any) {
      // Check if this is a CSP violation
      if (error.name === 'SecurityError' || error.message?.includes('CSP') || error.message?.includes('blocked')) {
        console.error(`CSP violation for URL: ${url}, trying alternative method`, error);
        
        // Alternative method: use img element and canvas
        try {
          return await this.fetchImageViaCanvas(url);
        } catch (canvasError) {
          console.error(`Canvas method also failed for URL: ${url}`, canvasError);
          throw new Error('CSP_VIOLATION');
        }
      }
      
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return this.fetchImageAsBlob(url, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * 画像をimg要素とCanvasを使って取得（CSP回避のため）
   */
  private async fetchImageViaCanvas(url: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          }, 'image/jpeg', 0.9);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  /**
   * メモリキャッシュから取得
   */
  private getFromMemory(url: string): string | null {
    return this.memoryCache.get(url) || null;
  }

  /**
   * IndexedDBから取得
   */
  private async getFromDB(url: string): Promise<CachedAvatar | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DB_STORE_NAME], 'readonly');
      const store = transaction.objectStore(DB_STORE_NAME);
      const request = store.get(url);

      request.onsuccess = () => {
        const result = request.result as CachedAvatar | undefined;
        if (result && Date.now() - result.timestamp < CACHE_DURATION) {
          resolve(result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * キャッシュに保存
   */
  private async saveToCache(url: string, blob: Blob, handle?: string): Promise<void> {
    // メモリキャッシュに保存
    const objectUrl = URL.createObjectURL(blob);
    this.memoryCache.set(url, objectUrl);

    // IndexedDBに保存
    if (this.db) {
      try {
        const transaction = this.db.transaction([DB_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(DB_STORE_NAME);
        
        const cachedAvatar: CachedAvatar = {
          url,
          blob,
          timestamp: Date.now(),
          handle,
        };

        store.put(cachedAvatar);
      } catch (error) {
        console.error('Failed to save to IndexedDB:', error);
      }
    }
  }

  /**
   * 古いキャッシュを削除
   */
  private async cleanupOldCache(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([DB_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(DB_STORE_NAME);
      const index = store.index('timestamp');
      
      const allKeys = await new Promise<string[]>((resolve, reject) => {
        const request = index.getAllKeys();
        request.onsuccess = () => resolve(request.result as string[]);
        request.onerror = () => reject(request.error);
      });

      // 古い順にソートして、制限を超えたら削除
      if (allKeys.length > MAX_CACHE_SIZE) {
        const keysToDelete = allKeys.slice(0, allKeys.length - MAX_CACHE_SIZE);
        
        for (const key of keysToDelete) {
          store.delete(key);
          // メモリキャッシュからも削除
          const memoryUrl = this.memoryCache.get(key);
          if (memoryUrl) {
            URL.revokeObjectURL(memoryUrl);
            this.memoryCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
    }
  }

  /**
   * アバター画像を取得（キャッシュ対応）
   */
  public async getAvatar(url: string, _handle?: string): Promise<string> {
    // プレースホルダーURLの場合はそのまま返す
    if (!url || url.includes('placeholder')) {
      return url;
    }

    // BlueskyのアバターURLでない場合はそのまま返す
    if (!this.isBlueskyAvatarUrl(url)) {
      return url;
    }

    // CSPの問題により、一時的にキャッシュを無効化
    // TODO: CSP設定を調整してキャッシュを再度有効化する
    return url;

    /*
    // すでに処理中の場合は待機
    const pending = this.pendingRequests.get(url);
    if (pending) {
      return pending;
    }

    // 新しいリクエストを開始
    const request = this.processAvatarRequest(url, handle);
    this.pendingRequests.set(url, request);

    try {
      const result = await request;
      return result;
    } finally {
      this.pendingRequests.delete(url);
    }
    */
  }

  /**
   * アバター取得の実処理
   */
  // @ts-expect-error - temporarily disabled method
  private async processAvatarRequest(url: string, _handle?: string): Promise<string> {
    // 1. メモリキャッシュを確認
    const memoryUrl = this.getFromMemory(url);
    if (memoryUrl) {
      return memoryUrl;
    }

    // 2. IndexedDBを確認
    try {
      const dbCache = await this.getFromDB(url);
      if (dbCache) {
        const objectUrl = URL.createObjectURL(dbCache.blob);
        this.memoryCache.set(url, objectUrl);
        return objectUrl;
      }
    } catch (error) {
      console.error('Failed to get from DB:', error);
    }

    // 3. ネットワークから取得
    try {
      const blob = await this.fetchImageAsBlob(url);
      await this.saveToCache(url, blob, _handle);
      return this.memoryCache.get(url) || url;
    } catch (error: any) {
      if (error.message === 'CSP_VIOLATION') {
        console.warn(`CSP violation for avatar ${url}, using original URL`);
        // For CSP violations, return the original URL directly
        return url;
      }
      console.error('Failed to fetch avatar:', error);
      // フォールバックとして元のURLを返す
      return url;
    }
  }

  /**
   * プリロード（タイムライン表示時の先読み）
   */
  public async preloadAvatars(urls: { url: string; handle?: string }[]): Promise<void> {
    const promises = urls.map(({ url, handle }) => 
      this.getAvatar(url, handle).catch(() => {/* エラーは無視 */})
    );
    
    await Promise.all(promises);
  }

  /**
   * メモリキャッシュのクリア
   */
  public clearMemoryCache(): void {
    for (const objectUrl of this.memoryCache.values()) {
      URL.revokeObjectURL(objectUrl);
    }
    this.memoryCache.clear();
  }

  /**
   * 全キャッシュのクリア
   */
  public async clearAllCache(): Promise<void> {
    this.clearMemoryCache();
    
    if (this.db) {
      const transaction = this.db.transaction([DB_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(DB_STORE_NAME);
      store.clear();
    }
  }
}

// シングルトンインスタンス
export const avatarCache = new AvatarCacheManager();