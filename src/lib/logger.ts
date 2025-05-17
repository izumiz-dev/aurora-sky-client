/**
 * 環境別のログ管理を行うクラス
 */
export class Logger {
  private static readonly isDevelopment = import.meta.env.DEV;
  private static readonly logLevels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };
  
  private static currentLevel = this.isDevelopment 
    ? this.logLevels.DEBUG 
    : this.logLevels.ERROR;

  /**
   * デバッグログ
   */
  static debug(message: string, data?: unknown): void {
    if (this.currentLevel <= this.logLevels.DEBUG) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  /**
   * 情報ログ
   */
  static info(message: string, data?: unknown): void {
    if (this.currentLevel <= this.logLevels.INFO) {
      console.info(`[INFO] ${message}`, data);
    }
  }

  /**
   * 警告ログ
   */
  static warn(message: string, data?: unknown): void {
    if (this.currentLevel <= this.logLevels.WARN) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  /**
   * エラーログ
   */
  static error(message: string, error?: unknown): void {
    if (this.currentLevel <= this.logLevels.ERROR) {
      const timestamp = new Date().toISOString();
      const errorData = this.extractErrorData(error);
      
      if (this.isDevelopment) {
        // 開発環境では詳細なエラー情報を表示
        console.error(`[${timestamp}] ERROR: ${message}`, error);
        if (error instanceof Error) {
          console.error('Stack trace:', error.stack);
        }
      } else {
        // 本番環境では最小限の情報のみ
        console.error(`[ERROR] ${message}`);
        // エラー監視サービスへの送信
        this.sendToErrorTracking(message, error);
      }

      // レート制限エラーの統計を記録
      if (errorData.isRateLimit) {
        this.incrementRateLimitCounter();
      }
    }
  }

  /**
   * エラー情報の抽出
   */
  private static extractErrorData(error: unknown): {
    message?: string;
    statusCode?: number;
    isRateLimit?: boolean;
    retryAfter?: number;
    stack?: string;
  } {
    if (!error) return {};
    
    if (error instanceof Error) {
      const anyError = error as any;
      return {
        message: error.message,
        stack: error.stack,
        statusCode: anyError.statusCode,
        isRateLimit: anyError.isRateLimit,
        retryAfter: anyError.retryAfter,
      };
    }
    
    return {};
  }

  /**
   * セキュリティ関連のログ
   */
  static security(message: string, data?: unknown): void {
    // セキュリティログは常に記録
    const logMessage = `[SECURITY] ${message}`;
    
    if (this.isDevelopment) {
      console.warn(logMessage, data);
    } else {
      console.warn(logMessage);
      // セキュリティイベントの監視サービスへの送信
      this.sendToSecurityMonitoring(message, data);
    }
  }

  /**
   * パフォーマンス計測
   */
  static measure(name: string, fn: () => void): void {
    if (this.isDevelopment) {
      const start = performance.now();
      fn();
      const end = performance.now();
      console.debug(`[PERF] ${name}: ${(end - start).toFixed(2)}ms`);
    } else {
      fn();
    }
  }

  /**
   * 非同期パフォーマンス計測
   */
  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (this.isDevelopment) {
      const start = performance.now();
      try {
        const result = await fn();
        const end = performance.now();
        console.debug(`[PERF] ${name}: ${(end - start).toFixed(2)}ms`);
        return result;
      } catch (error) {
        const end = performance.now();
        console.error(`[PERF] ${name} failed after ${(end - start).toFixed(2)}ms`);
        throw error;
      }
    } else {
      return fn();
    }
  }

  /**
   * エラー監視サービスへの送信（Sentry等）
   */
  private static async sendToErrorTracking(message: string, error: unknown): Promise<void> {
    // Sentryが利用可能な場合
    if (import.meta.env.VITE_SENTRY_DSN) {
      try {
        const { captureError } = await import('./sentry.optional');
        if (error instanceof Error) {
          captureError(error, { message });
        } else {
          captureError(new Error(message), { originalError: error });
        }
      } catch {
        // Sentryの読み込みに失敗した場合は何もしない
      }
      return;
    }
    
    // Sentryが利用できない場合の代替実装
    if (!this.isDevelopment && import.meta.env.VITE_SECURITY_MONITORING_URL) {
      const errorData = {
        message,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : String(error),
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };
      
      // カスタムエラーレポートAPIへの送信
      fetch(import.meta.env.VITE_SECURITY_MONITORING_URL + '/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // エラー送信自体が失敗した場合は無視
      });
    }
  }

  /**
   * セキュリティ監視サービスへの送信
   */
  private static sendToSecurityMonitoring(message: string, data: unknown): void {
    // 実際の実装では、セキュリティ監視サービスに送信
    if (!this.isDevelopment && import.meta.env.VITE_SECURITY_MONITORING_URL) {
      const securityEvent = {
        message,
        data: data instanceof Error ? {
          name: data.name,
          message: data.message,
        } : data,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };
      
      // セキュリティイベントAPIへの送信
      fetch(import.meta.env.VITE_SECURITY_MONITORING_URL + '/security-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(securityEvent),
      }).catch(() => {
        // 送信失敗は無視
      });
    }
  }

  // レート制限エラーのカウンター
  private static rateLimitCount = 0;
  private static rateLimitResetTime = Date.now() + 3600000; // 1時間後

  /**
   * レート制限エラーのカウンターをインクリメント
   */
  private static incrementRateLimitCounter(): void {
    const now = Date.now();
    
    // リセット時間を過ぎたらカウンターをリセット
    if (now > this.rateLimitResetTime) {
      this.rateLimitCount = 0;
      this.rateLimitResetTime = now + 3600000;
    }
    
    this.rateLimitCount++;
    
    // 10回以上レート制限に達した場合は警告
    if (this.rateLimitCount >= 10) {
      this.warn(`Rate limit hit ${this.rateLimitCount} times in the last hour`);
    }
  }

  /**
   * エラーの統計情報を取得
   */
  static getErrorStats() {
    return {
      rateLimitCount: this.rateLimitCount,
      rateLimitResetTime: new Date(this.rateLimitResetTime).toISOString()
    };
  }

  /**
   * API呼び出しのログ
   */
  static api(method: string, endpoint: string, params?: any, response?: any, error?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      params,
      response: response ? { status: response.status, data: response.data } : undefined,
      error: error ? this.extractErrorData(error) : undefined
    };

    if (this.isDevelopment) {
      if (error) {
        console.error('[API Error]', logEntry);
      } else {
        console.log('[API Call]', logEntry);
      }
    }

    // レート制限エラーの場合は追加処理
    if (error?.isRateLimit) {
      this.incrementRateLimitCounter();
    }
  }
}