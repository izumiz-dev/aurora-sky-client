import { useEffect, useCallback } from 'preact/hooks';

interface UseInfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 300,
}: UseInfiniteScrollProps) => {
  const handleScroll = useCallback(() => {
    if (!hasMore || isLoading) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - threshold) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, isLoading, threshold]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 150);
    };

    window.addEventListener('scroll', debouncedHandleScroll);

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);
};
