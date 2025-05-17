import { formatTimeAgo } from '../../utils/date';

interface QuotedPostProps {
  record: {
    uri: string;
    cid: string;
    author?: {
      did: string;
      handle: string;
      displayName?: string;
      avatar?: string;
    };
    value?: {
      text?: string;
      createdAt?: string;
      [key: string]: any;
    };
    record?: {
      text?: string;
      createdAt?: string;
      [key: string]: any;
    };
  };
}

export const QuotedPost = ({ record }: QuotedPostProps) => {
  // Handle different record structures for API view responses
  const isViewRecord = record.$type === 'app.bsky.embed.record#viewRecord';
  const author = record.author;
  const postData = record.value || record.record || {};
  const text = postData.text || postData.$text || '';
  const createdAt = postData.createdAt || postData.created_at || record.indexedAt;

  if (!author && !text) {
    return (
      <div className="glass-card p-4 mt-3 text-white/70 ambient-fade-in">
        <p className="text-center italic">引用された投稿を読み込めませんでした</p>
      </div>
    );
  }

  return (
    <div 
      className="glass-card p-4 mt-3 cursor-pointer hover:bg-white/5 transition-all duration-300 ambient-fade-in hover-lift"
      onClick={() => window.open(`https://bsky.app/profile/${author?.handle}/post/${record.uri.split('/').pop()}`, '_blank')}
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
              <span className="text-xs text-white/60">
                @{author.handle}
              </span>
            </div>
            {createdAt && (
              <div className="text-xs text-white/50">
                {formatTimeAgo(new Date(createdAt))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {text && (
        <p className="text-sm text-white/90 whitespace-pre-wrap break-words">
          {text}
        </p>
      )}
    </div>
  );
};