import { useEffect, useRef } from 'preact/hooks';
import { PostComposer } from './PostComposer';
import { CachedAvatar } from './CachedAvatar';
import type { Post } from '../types/post';

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: Post;
  onPostSuccess?: () => void;
}

export const PostComposerModal = ({ isOpen, onClose, replyTo, onPostSuccess }: PostComposerModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // モーダルが開いているときは背景スクロールを防止
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalHeight = document.body.style.height;
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.height = originalHeight;
      };
    }
  }, [isOpen]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePostSuccess = () => {
    if (onPostSuccess) {
      onPostSuccess();
    }
    onClose();
  };

  return (
    <div className="thread-modal-backdrop">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      
      {/* Modal container with proper centering */}
      <div className="flex items-center justify-center min-h-screen md:p-4 md:pt-20">
        <div className="thread-modal-content glass-card relative w-full max-w-3xl flex flex-col overflow-hidden">
          {/* Minimal header */}
          <div className="thread-modal-header flex items-center justify-between px-4 py-2 border-b border-white/10">
            <h2 className="text-base font-medium text-white">
              {replyTo ? 'リプライを作成' : '新しい投稿'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="閉じる"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          {/* Scrollable content */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto overscroll-contain relative"
          >
            <div className="p-6">
              {/* リプライ先の投稿を表示 */}
              {replyTo && (
                <div className="mb-4 pb-4 border-b border-white/10">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <CachedAvatar
                        src={replyTo.author.avatar}
                        alt={replyTo.author.displayName || replyTo.author.handle}
                        handle={replyTo.author.handle}
                        size="sm"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">
                          {replyTo.author.displayName || replyTo.author.handle}
                        </span>
                        <span className="text-white/60 text-sm">@{replyTo.author.handle}</span>
                      </div>
                      <div className="text-white/80 text-sm line-clamp-3">
                        {replyTo.record.text}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PostComposer */}
              <PostComposer 
                onPostSuccess={handlePostSuccess}
                replyTo={replyTo}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};