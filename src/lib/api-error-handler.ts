// APIエラーハンドリングユーティリティ

export interface ApiError {
  statusCode?: number;
  message: string;
  isRateLimit?: boolean;
  retryAfter?: number;
}

export class RateLimitError extends Error {
  public retryAfter: number;
  
  constructor(message: string, retryAfter: number = 60) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// APIエラーを解析してユーザーフレンドリーなメッセージに変換
export function parseApiError(error: unknown): ApiError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any; // 最小限のany使用
  // ATProtoのエラー形式をチェック
  if (err?.status === 429 || err?.statusCode === 429) {
    const retryAfter = err?.headers?.['retry-after'] || 
                      err?.headers?.['x-ratelimit-reset'] || 
                      60;
    return {
      statusCode: 429,
      message: 'レート制限に達しました。しばらく待ってから再度お試しください。',
      isRateLimit: true,
      retryAfter: typeof retryAfter === 'string' ? parseInt(retryAfter) : retryAfter
    };
  }

  // リクエストタイムアウト
  if (err?.code === 'ETIMEDOUT' || err?.name === 'TimeoutError') {
    return {
      message: '接続がタイムアウトしました。ネットワーク接続を確認してください。'
    };
  }

  // ネットワークエラー
  if (err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND') {
    return {
      message: 'サーバーに接続できません。しばらく待ってから再度お試しください。'
    };
  }

  // 認証エラー
  if (err?.status === 401 || err?.statusCode === 401) {
    return {
      statusCode: 401,
      message: '認証に失敗しました。ログインし直してください。'
    };
  }

  // トークン期限切れエラー
  if (err?.message?.includes('expired') || err?.message?.includes('token')) {
    return {
      statusCode: 401,
      message: 'セッションの有効期限が切れました。再度ログインしてください。'
    };
  }

  // サーバーエラー
  if (err?.status >= 500 || err?.statusCode >= 500) {
    return {
      statusCode: err.status || err.statusCode,
      message: 'サーバーでエラーが発生しました。しばらく待ってから再度お試しください。'
    };
  }

  // その他のエラー
  return {
    message: err?.message || 'エラーが発生しました。'
  };
}

// エラー表示用のReactコンポーネント用メッセージを生成
export function getErrorDisplay(error: ApiError): {
  title: string;
  description: string;
  action?: string;
} {
  if (error.isRateLimit) {
    const minutes = Math.ceil((error.retryAfter || 60) / 60);
    return {
      title: 'リクエスト制限中',
      description: `APIの利用制限に達しました。約${minutes}分後に再度お試しください。`,
      action: '少し休憩してから戻ってきてください 🍵'
    };
  }

  if (error.statusCode === 401) {
    return {
      title: '認証エラー',
      description: 'セッションの有効期限が切れました。',
      action: 'ログイン画面に戻る'
    };
  }

  if (error.statusCode && error.statusCode >= 500) {
    return {
      title: 'サーバーエラー',
      description: 'Blueskyのサーバーで問題が発生しています。',
      action: 'しばらく待ってから再度お試しください'
    };
  }

  return {
    title: 'エラーが発生しました',
    description: error.message
  };
}

// リトライのための指数バックオフ
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const apiError = parseApiError(error);
      
      // レート制限エラーの場合は指定された時間待つ
      if (apiError.isRateLimit) {
        const waitTime = (apiError.retryAfter || 60) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // その他のエラーは指数バックオフ
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}