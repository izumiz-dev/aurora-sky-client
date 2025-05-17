import { BskyAgent, RichText } from '@atproto/api';
import { parseApiError } from './api-error-handler';
import { SessionManager } from './sessionManager';

export const agent = new BskyAgent({
  service: 'https://bsky.social',
});

export const getAgent = async () => {
  const session = await SessionManager.getSession();
  if (session) {
    const sessionWithDefaults = {
      ...session,
      active: session.active ?? true,
    };
    await agent.resumeSession(sessionWithDefaults);
  }
  return agent;
};

// APIコールをエラーハンドリング付きでラップ
const wrapApiCall = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    const parsedError = parseApiError(error);
    // エラーに追加情報を含めて再スロー
    const enrichedError = Object.assign(new Error(parsedError.message), {
      ...parsedError,
      originalError: error
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

export const createPost = async (text: string, langs?: string[]) => {
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

  // ファイルサイズの確認（1MB以下）
  if (file.size > 1000000) {
    throw new Error('画像ファイルは1MB以下にしてください');
  }

  // ファイルタイプの確認
  if (!file.type.startsWith('image/')) {
    throw new Error('画像ファイルを選択してください');
  }

  // ArrayBufferに変換
  const arrayBuffer = await file.arrayBuffer();
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
  langs?: string[]
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
  return agent.app.bsky.actor.putPreferences({ preferences: preferences as any });
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
