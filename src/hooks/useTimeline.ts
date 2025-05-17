import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { useQuery } from '@tanstack/react-query';
import { fetchTimeline } from '../services/timeline';
import type { Post } from '../types/post';
import type { SessionData } from '../types/session';
import { useInfiniteScroll } from './useInfiniteScroll';

export const useTimeline = (session: SessionData | null, isAuthenticated: boolean) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set());
  const [showSnackbar, setShowSnackbar] = useState(false);

  const lastLoadTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['timeline', session?.did],
    queryFn: () => (session ? fetchTimeline(session) : Promise.reject(new Error('No session'))),
    enabled: isAuthenticated && !!session,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (data && initialLoad) {
      setPosts(data.feed || []);
      setCursor(data.cursor || null);
      setInitialLoad(false);
    }
  }, [data, initialLoad]);

  // Check for new posts every minute
  const checkForNewPosts = useCallback(async () => {
    if (!session || !isAuthenticated || posts.length === 0) return;

    try {
      const response = await fetchTimeline(session);
      if (response.feed.length > 0) {
        const latestPostTime = new Date(posts[0].record.createdAt).getTime();
        const newPosts = response.feed.filter(
          (post) => new Date(post.record.createdAt).getTime() > latestPostTime
        );

        if (newPosts.length > 0) {
          setNewPostsCount(newPosts.length);
          setShowSnackbar(true);
        }
      }
    } catch (error) {
      console.error('Failed to check for new posts:', error);
    }
  }, [session, isAuthenticated, posts]);

  // Load new posts when user clicks the notification
  const loadNewPosts = useCallback(async () => {
    if (!session) return;

    try {
      const response = await fetchTimeline(session);
      if (response.feed.length > 0) {
        const latestPostTime = new Date(posts[0].record.createdAt).getTime();
        const newPosts = response.feed.filter(
          (post) => new Date(post.record.createdAt).getTime() > latestPostTime
        );

        if (newPosts.length > 0) {
          const newIds = new Set(newPosts.map((post) => post.uri));
          setNewPostIds(newIds);
          setPosts([...newPosts, ...posts]);
          setNewPostsCount(0);

          // Clear new post IDs after animation completes
          setTimeout(() => {
            setNewPostIds(new Set());
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Failed to load new posts:', error);
    }
  }, [session, posts]);

  // Set up interval to check for new posts
  useEffect(() => {
    if (isAuthenticated && session && posts.length > 0) {
      intervalIdRef.current = setInterval(checkForNewPosts, 60000); // Check every minute

      return () => {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
      };
    }
  }, [isAuthenticated, session, checkForNewPosts, posts.length]);

  const handleLoadMore = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;

    if (timeSinceLastLoad < 1000) {
      return;
    }

    if (cursor && !isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      lastLoadTimeRef.current = now;

      try {
        const moreData = await fetchTimeline(session!, cursor);
        if (moreData.feed.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prev) => [...prev, ...(moreData.feed || [])]);
          setCursor(moreData.cursor || null);
          retryCountRef.current = 0;
        }
      } catch (error) {
        console.error('Failed to load more posts:', error);
        retryCountRef.current += 1;

        if (retryCountRef.current >= 3) {
          setHasMore(false);
          setLoadError('投稿の読み込みに失敗しました');
        }
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [cursor, isLoadingMore, hasMore, session]);

  const handleCloseSnackbar = useCallback(() => {
    setShowSnackbar(false);
  }, []);
  
  // Refresh the timeline (used after posting)
  const refreshTimeline = useCallback(async () => {
    if (!session) return;
    
    try {
      const response = await fetchTimeline(session);
      setPosts(response.feed || []);
      setCursor(response.cursor || null);
    } catch (error) {
      console.error('Failed to refresh timeline:', error);
    }
  }, [session]);

  useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  return {
    posts,
    isLoading,
    error,
    isLoadingMore,
    hasMore,
    loadError,
    newPostsCount,
    loadNewPosts,
    newPostIds,
    showSnackbar,
    handleCloseSnackbar,
    refreshTimeline,
  };
};
