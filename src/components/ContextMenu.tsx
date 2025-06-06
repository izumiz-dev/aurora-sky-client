import { useEffect, useRef } from 'preact/hooks';
import { createElement } from 'preact';
import {
  ChatBubbleOvalLeftIcon,
  ArrowPathRoundedSquareIcon,
  HeartIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

interface Position {
  x: number;
  y: number;
}

interface ContextMenuProps {
  items: MenuItem[];
  position: Position;
  onClose: () => void;
  onItemClick?: (itemId: string) => void;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: preact.ComponentType<{ className?: string }> | string;
  className?: string;
  divider?: boolean;
}

export const ContextMenu = ({ items, position, onClose, onItemClick }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  // メニューの位置を調整（画面端に表示されないように）
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      if (rect.right > viewportWidth) {
        adjustedX = position.x - rect.width;
      }
      if (rect.bottom > viewportHeight) {
        adjustedY = position.y - rect.height;
      }

      menuRef.current.style.left = `${adjustedX}px`;
      menuRef.current.style.top = `${adjustedY}px`;
    }
  }, [position]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] glass-context-menu min-w-[200px] py-2 px-1 rounded-lg"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm glass-context-menu-item ${
            item.className || ''
          }`}
          onClick={() => {
            onItemClick?.(item.id);
            onClose();
          }}
        >
          {typeof item.icon === 'string' ? (
            <span className="w-4 h-4">{item.icon}</span>
          ) : (
            createElement(item.icon, { className: 'w-4 h-4' })
          )}
          <span className="flex-1 text-left">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// ポスト用のコンテキストメニューアイテム
export const postMenuItems: MenuItem[] = [
  {
    id: 'reply',
    label: 'リプライ',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: ChatBubbleOvalLeftIcon as any,
    className: 'hover:text-engagement-reply',
  },
  {
    id: 'repost',
    label: 'リポスト',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: ArrowPathRoundedSquareIcon as any,
    className: 'hover:text-engagement-repost',
  },
  {
    id: 'like',
    label: 'いいね',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: HeartIcon as any,
    className: 'hover:text-engagement-like',
  },
  {
    id: 'copy-link',
    label: 'ポストへのリンクをコピー',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: LinkIcon as any,
    className: 'hover:text-accent-primary',
  },
];
