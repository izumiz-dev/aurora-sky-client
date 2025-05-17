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
