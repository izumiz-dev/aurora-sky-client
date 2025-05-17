import type { Post } from './post';

export interface ThreadViewPost {
  post: Post;
  parent?: ThreadViewPost;
  replies?: ThreadViewPost[];
  notFound?: boolean;
  blocked?: boolean;
}

export interface GetPostThreadResponse {
  success: boolean;
  data: {
    thread: ThreadViewPost;
  };
}