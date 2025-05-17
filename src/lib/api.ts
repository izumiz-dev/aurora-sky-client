import { BskyAgent } from '@atproto/api';

export const agent = new BskyAgent({
  service: 'https://bsky.social',
});

export const getAgent = async () => {
  const session = JSON.parse(localStorage.getItem('bsky-session') || 'null');
  if (session) {
    await agent.resumeSession(session);
  }
  return agent;
};

export const fetchTimeline = async (params: { limit?: number; cursor?: string } = {}) => {
  const agent = await getAgent();
  return agent.getTimeline({
    limit: params.limit || 30,
    cursor: params.cursor,
  });
};

export const createPost = async (text: string) => {
  const agent = await getAgent();
  return agent.post({
    text,
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

export const createPostWithImages = async (text: string, images: { alt: string; blob: any }[]) => {
  const agent = await getAgent();
  
  const embed = {
    $type: 'app.bsky.embed.images',
    images: images.map(({ alt, blob }) => ({
      alt,
      image: blob,
    })),
  };
  
  return agent.post({
    text,
    embed,
    createdAt: new Date().toISOString(),
  });
};
