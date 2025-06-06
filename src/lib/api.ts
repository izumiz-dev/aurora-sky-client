import { BskyAgent, RichText } from '@atproto/api';
import type { AtpSessionEvent, AtpSessionData } from '@atproto/api';
import { parseApiError } from './api-error-handler';
import { SessionManager } from './sessionManager';
import { removeJpegExif } from '../utils/imageMetadataRemover';
import { resizeImageToUnder1MB } from '../utils/imageResizer';
import type { SessionData } from '../types/session';

// セッションの変更を処理するハンドラー
const handleSessionChange = async (evt: AtpSessionEvent, sess?: AtpSessionData) => {
  if (evt === 'create' || evt === 'update') {
    if (sess) {
      // セッションが作成または更新された場合、保存する
      await SessionManager.saveSession({
        ...sess,
        active: sess.active ?? true,
      });
    }
  } else if (evt === 'expired') {
    // セッションが期限切れになった場合、クリアする
    await SessionManager.clearSession();
  }
};

export const agent = new BskyAgent({
  service: 'https://bsky.social',
  persistSession: handleSessionChange,
});

if (agent.xrpc) {
  const originalCall = agent.xrpc.call.bind(agent.xrpc);
  agent.xrpc.call = async function (
    nsid: string,
    params?: Record<string, unknown>,
    data?: unknown,
    opts?: { headers?: Record<string, string> }
  ) {
    const headers = opts?.headers || {};
    headers['User-Agent'] = 'AuroraSky/1.0.0';
    return originalCall(nsid, params, data, { ...opts, headers });
  };
}

// トークンリフレッシュのミューテックス
const refreshMutex = new Map<string, Promise<SessionData>>();

export const getAgent = async () => {
  let session = await SessionManager.getSession();
  if (session) {
    try {
      // トークンの有効期限をチェックして必要なら更新
      const needsRefresh = checkTokenNeedsRefresh(session.accessJwt);

      if (needsRefresh) {
        const did = session.did;

        // 既にリフレッシュ中の場合は待機
        if (refreshMutex.has(did)) {
          await refreshMutex.get(did);
          session = await SessionManager.getSession();
        } else {
          // トークンをリフレッシュ
          const refreshPromise = refreshToken(session);
          refreshMutex.set(did, refreshPromise);

          try {
            session = await refreshPromise;
          } finally {
            refreshMutex.delete(did);
          }
        }
      }

      const sessionWithDefaults = {
        ...session!,
        active: session!.active ?? true,
      };
      if (sessionWithDefaults.refreshJwt) {
        await agent.resumeSession(sessionWithDefaults);
      } else {
        // リフレッシュトークンがない場合はセッションをクリアしてログイン画面へ
        await SessionManager.clearSession();
        throw new Error('No refresh token available');
      }
    } catch (error) {
      console.error('Failed to resume session:', error);
      // セッションの復元に失敗した場合、クリアする
      await SessionManager.clearSession();
    }
  }
  return agent;
};

// JWTトークンの有効期限をチェック
function checkTokenNeedsRefresh(token: string): boolean {
  try {
    // JWTのペイロードをデコード（簡易版）
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;

    if (!exp) return true;

    // 有効期限の5分前にリフレッシュ
    const expiresAt = exp * 1000;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    const timeUntilExpiry = expiresAt - now;
    const needsRefresh = timeUntilExpiry < fiveMinutes;

    if (needsRefresh) {
      console.log(`[API] Token expires in ${Math.floor(timeUntilExpiry / 1000)}s, needs refresh`);
    }

    return needsRefresh;
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return true; // エラーの場合は安全のため更新
  }
}

// トークンリフレッシュのリトライ回数
const MAX_REFRESH_RETRIES = 3;
const REFRESH_RETRY_DELAY = 1000; // 1秒

// トークンをリフレッシュ（リトライ機能付き）
async function refreshToken(session: SessionData, retryCount = 0): Promise<SessionData> {
  try {
    console.log(
      `[API] Attempting token refresh (attempt ${retryCount + 1}/${MAX_REFRESH_RETRIES})`
    );
    const tempAgent = new BskyAgent({ service: 'https://bsky.social' });

    // refreshSessionを呼び出し
    await tempAgent.resumeSession(session);
    const response = await tempAgent.com.atproto.server.refreshSession();

    if (response.success) {
      const newSession: SessionData = {
        ...session,
        accessJwt: response.data.accessJwt,
        refreshJwt: response.data.refreshJwt,
      };

      // 新しいセッションを保存
      await SessionManager.saveSession(newSession);
      console.log('[API] Token refresh successful');
      return newSession;
    }

    throw new Error('Token refresh failed');
  } catch (error) {
    console.error('Failed to refresh token:', error);

    // ネットワークエラーの場合はリトライ
    if (isNetworkError(error) && retryCount < MAX_REFRESH_RETRIES - 1) {
      console.log(`[API] Network error, retrying in ${REFRESH_RETRY_DELAY}ms...`);
      await new Promise((resolve) => setTimeout(resolve, REFRESH_RETRY_DELAY * (retryCount + 1)));
      return refreshToken(session, retryCount + 1);
    }

    // リフレッシュトークンが無効な場合はセッションをクリア
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorStatus = (error as any)?.status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorMessage = (error as any)?.message;
    if (
      errorStatus === 400 ||
      errorStatus === 401 ||
      errorMessage?.includes('Invalid refresh token') ||
      errorMessage?.includes('Token expired')
    ) {
      console.error('[API] Invalid refresh token, clearing session');
      await SessionManager.clearSession();
      window.location.href = '/login';
    }

    throw error;
  }
}

// ネットワークエラーかどうかを判定
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection')
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorType = (error as any)?.type;
  return errorType === 'NetworkError' || errorType === 'FetchError';
}

// APIコールをエラーハンドリング付きでラップ
const wrapApiCall = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    const parsedError = parseApiError(error);

    // 401エラー（認証エラー）の場合はセッションをクリアしてログイン画面へ
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorStatus = (error as any)?.status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorMessage = (error as any)?.message;
    if (
      parsedError.statusCode === 401 ||
      errorStatus === 401 ||
      errorMessage?.toLowerCase().includes('unauthorized') ||
      errorMessage?.toLowerCase().includes('invalid token')
    ) {
      await SessionManager.clearSession();
      // ログインページへリダイレクト
      window.location.href = '/login';
      throw new Error('セッションの有効期限が切れました。再度ログインしてください。');
    }

    // エラーに追加情報を含めて再スロー
    const enrichedError = Object.assign(new Error(parsedError.message), {
      ...parsedError,
      originalError: error,
    });
    throw enrichedError;
  }
};

export const fetchTimeline = async (params: { limit?: number; cursor?: string } = {}) => {
  return wrapApiCall(async () => {
    const agent = await getAgent();
    return agent.getTimeline({
      limit: params.limit || 30,
      cursor: params.cursor,
    });
  });
};

export const createPost = async (
  text: string,
  langs?: string[],
  reply?: { root: { uri: string; cid: string }; parent: { uri: string; cid: string } }
) => {
  const agent = await getAgent();

  // RichTextを使って自動的にリンクとメンションを検出
  const richText = new RichText({
    text: text,
  });

  await richText.detectFacets(agent);

  return agent.post({
    text: richText.text,
    facets: richText.facets,
    langs,
    reply,
    createdAt: new Date().toISOString(),
  });
};

export const likePost = async (uri: string, cid: string) => {
  const agent = await getAgent();
  return agent.like(uri, cid);
};

export const repost = async (uri: string, cid: string) => {
  const agent = await getAgent();
  return agent.repost(uri, cid);
};

export const uploadImage = async (file: File) => {
  const agent = await getAgent();

  // ファイルタイプの確認
  if (!file.type.startsWith('image/')) {
    throw new Error('画像ファイルを選択してください');
  }

  // 1MBを超える場合はリサイズ
  let processedFile = file;
  if (file.size > 1000000) {
    try {
      processedFile = await resizeImageToUnder1MB(file);
    } catch (resizeError) {
      console.error('画像のリサイズに失敗しました:', resizeError);
      throw new Error('画像のリサイズに失敗しました');
    }
  }

  let processedBlob: Blob;
  try {
    processedBlob = await removeJpegExif(processedFile);
  } catch (error) {
    console.error('メタデータ削除に失敗しました。リサイズされたファイルを使用します:', error);
    processedBlob = processedFile;
  }

  // ArrayBufferに変換
  const arrayBuffer = await processedBlob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // 画像をアップロード
  const response = await agent.uploadBlob(uint8Array, {
    encoding: file.type,
  });

  return response.data.blob;
};

export const createPostWithImages = async (
  text: string,
  images: { alt: string; blob: unknown }[],
  langs?: string[],
  reply?: { root: { uri: string; cid: string }; parent: { uri: string; cid: string } }
) => {
  const agent = await getAgent();

  // RichTextを使って自動的にリンクとメンションを検出
  const richText = new RichText({
    text: text,
  });

  await richText.detectFacets(agent);

  const embed = {
    $type: 'app.bsky.embed.images',
    images: images.map(({ alt, blob }) => ({
      alt,
      image: blob,
    })),
  };

  return agent.post({
    text: richText.text,
    facets: richText.facets,
    embed,
    langs,
    reply,
    createdAt: new Date().toISOString(),
  });
};

export const getPreferences = async () => {
  const agent = await getAgent();
  return agent.getPreferences();
};

export const updatePreferences = async (preferences: unknown[]) => {
  const agent = await getAgent();
  // The BskyAgent doesn't have setPreferences, we need to use the app API directly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (agent as any).app.bsky.actor.putPreferences({ preferences });
};

export const getProfile = async (actor: string) => {
  const agent = await getAgent();
  return agent.getProfile({ actor });
};

export const getAuthorFeed = async (params: {
  actor: string;
  limit?: number;
  cursor?: string;
  filter?:
    | 'posts_with_replies'
    | 'posts_no_replies'
    | 'posts_with_media'
    | 'posts_and_author_threads';
}) => {
  const agent = await getAgent();
  return agent.getAuthorFeed({
    actor: params.actor,
    limit: params.limit || 30,
    cursor: params.cursor,
    filter: params.filter,
  });
};

export const getPostThread = async (params: {
  uri: string;
  depth?: number;
  parentHeight?: number;
}) => {
  return wrapApiCall(async () => {
    const agent = await getAgent();
    return agent.getPostThread({
      uri: params.uri,
      depth: params.depth || 6,
      parentHeight: params.parentHeight || 3,
    });
  });
};
