import type { Post } from '../types/post';
import { formatTimeAgo } from '../utils/date';
import { RichContent } from './content/RichContent';

interface PostItemProps {
  post: Post;
  isNew?: boolean;
}

export const PostItem = ({ post, isNew = false }: PostItemProps) => {
  return (
    <div className={`glass-card p-6 ${isNew ? 'ambient-fade-in ambient-glow' : ''}`}>
      <div className="flex gap-3">
        <div className="avatar avatar-md flex-shrink-0">
          <img
            src={post.author.avatar || 'https://via.placeholder.com/48'}
            alt={post.author.displayName || post.author.handle}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className={`font-semibold text-white ${isNew ? 'shimmer-text' : ''}`}>
              {post.author.displayName || post.author.handle}
            </h3>
            <span className="text-sm text-white/60">@{post.author.handle}</span>
            <span className="text-sm text-white/60">
              · {formatTimeAgo(new Date(post.record.createdAt))}
            </span>
          </div>
          <div className="text-white">
            <RichContent text={post.record.text} embed={post.embed} facets={post.record.facets} />
          </div>
        </div>
      </div>
    </div>
  );
};
