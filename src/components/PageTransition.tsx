import { FunctionalComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

interface PageTransitionProps {
  children: preact.ComponentChildren;
  pathname?: string;
}

export const PageTransition: FunctionalComponent<PageTransitionProps> = ({ children, pathname }) => {
  const [isVisible, setIsVisible] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // パスが変更された場合
    if (pathname !== prevPathname.current) {
      setIsVisible(false);
      
      // フェードアウト完了後にコンテンツを更新
      const timeout = setTimeout(() => {
        prevPathname.current = pathname;
        setIsVisible(true);
      }, 150);

      return () => clearTimeout(timeout);
    } else {
      // 初回レンダリング時
      setIsVisible(true);
    }
  }, [pathname]);

  return (
    <div
      className={`transition-opacity duration-150 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
};