import { formatTimeAgo } from '../../utils/date';

interface QuotedPostProps {
  record: {
    $type?: string;
    uri: string;
    cid: string;
    author?: {
      did: string;
      handle: string;
      displayName?: string;
      avatar?: string;
    };
    value?: {
      $type?: string;
      text?: string;
      createdAt?: string;
      [key: string]: unknown;
    };
    // AT Protocol view format
    record?: {
      text?: string;
      createdAt?: string;
      [key: string]: unknown;
    };
  };
}

export const QuotedPost = ({ record }: QuotedPostProps) => {
  // View format has nested structure
  const author = record.author;

  // Extract text and createdAt from either value or record
  const postData = record.value || record.record || {};
  const text = postData.text || '';
  const createdAt = postData.createdAt;

  if (!author && !text) {
    return (
      <div className="glass-card p-4 mt-3 text-white/70 ambient-fade-in">
        <p className="text-center italic">引用された投稿を読み込めませんでした</p>
      </div>
    );
  }

  // Extract post ID from URI for navigation
  const postId = record.uri.split('/').pop();

  return (
    <div
      className="glass-card p-4 mt-3 cursor-pointer hover:bg-white/5 transition-all duration-300 ambient-fade-in hover-lift"
      onClick={() =>
        window.open(`https://bsky.app/profile/${author?.handle}/post/${postId}`, '_blank')
      }
    >
      {author && (
        <div className="flex items-center gap-2 mb-2">
          {author.avatar && (
            <div className="w-8 h-8 rounded-full overflow-hidden glass-card">
              <img
                src={author.avatar}
                alt={author.displayName || author.handle}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="font-medium text-sm text-white truncate">
                {author.displayName || author.handle}
              </span>
              <span className="text-xs text-white/60">@{author.handle}</span>
            </div>
            {createdAt && (
              <div className="text-xs text-white/50">{formatTimeAgo(new Date(createdAt))}</div>
            )}
          </div>
        </div>
      )}

      {text && <p className="text-sm text-white/90 whitespace-pre-wrap break-words">{text}</p>}
    </div>
  );
};
