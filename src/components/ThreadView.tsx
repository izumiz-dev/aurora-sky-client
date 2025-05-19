import { useEffect, useRef } from 'preact/hooks';
import type { Post } from '../types/post';
import { FullThreadView } from './thread/FullThreadView';

interface ThreadViewProps {
  parentPost: Post;
  onClose?: () => void;
}

export const ThreadView = ({ parentPost, onClose }: ThreadViewProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Prevent background scrolling when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
    };
  }, []);
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
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
            <h2 className="text-base font-medium text-white">ポスト</h2>
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
            <div className="p-6 pb-20">
              <FullThreadView post={parentPost} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};