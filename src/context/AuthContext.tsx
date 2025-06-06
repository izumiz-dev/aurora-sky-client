import { createContext } from 'preact';
import { useState, useEffect, useCallback, useContext } from 'preact/hooks';
import { BskyAgent } from '@atproto/api';
import type { SessionData } from '../types/session';
import { SessionManager } from '../lib/sessionManager';

type AuthContextType = {
  isAuthenticated: boolean;
  session: SessionData | null;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: preact.ComponentChildren }) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // セッションの復元（1回のみ実行）
  useEffect(() => {
    let mounted = true;
    const loadSession = async () => {
      // console.log('[AuthContext] Loading session...');
      const storedSession = await SessionManager.getSession();
      // console.log('[AuthContext] Stored session:', storedSession ? 'Found' : 'Not found');
      if (storedSession && mounted) {
        try {
          // アバターが無い場合は取得を試みる
          if (!storedSession.avatar && storedSession.did) {
            try {
              const agent = new BskyAgent({ service: 'https://bsky.social' });
              await agent.resumeSession(storedSession);
              const profile = await agent.getProfile({ actor: storedSession.did });

              const sessionWithAvatar = {
                ...storedSession,
                avatar: profile.data.avatar,
                active: storedSession.active ?? true,
              };

              setSession(sessionWithAvatar);
              await SessionManager.saveSession(sessionWithAvatar, true);
            } catch (error) {
              console.error('Failed to fetch profile:', error);
              setSession(storedSession);
            }
          } else {
            setSession(storedSession);
          }
        } catch (e) {
          console.error('Failed to load session', e);
          await SessionManager.clearSession();
        }
      }
      if (mounted) {
        setLoading(false);
      }
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, []); // 空の依存配列で1回のみ実行

  const login = useCallback(
    async (identifier: string, password: string, rememberMe: boolean = true) => {
      try {
        setLoading(true);
        setError(null);

        const agent = new BskyAgent({
          service: 'https://bsky.social',
        });

        const { success, data } = await agent.login({
          identifier,
          password,
        });

        if (success && data) {
          try {
            const profile = await agent.getProfile({ actor: data.did });
            const sessionWithAvatar = {
              ...data,
              avatar: profile.data.avatar,
              active: data.active ?? true,
            };

            setSession(sessionWithAvatar);
            await SessionManager.saveSession(sessionWithAvatar, rememberMe);
            // console.log('[AuthContext] Login successful, session saved');
          } catch (profileError) {
            // プロフィール取得に失敗してもログインは続行
            console.error('Profile fetch failed:', profileError);
            const sessionData = { ...data, active: data.active ?? true };
            setSession(sessionData);
            await SessionManager.saveSession(sessionData, rememberMe);
            // console.log('[AuthContext] Login successful (without avatar), session saved');
          }
        } else {
          throw new Error('ログインが成功しましたが、セッションデータが取得できませんでした');
        }
      } catch (err) {
        console.error('Login failed', err);
        setError('ログインに失敗しました。IDまたはパスワードを確認してください。');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    if (session) {
      await SessionManager.logoutSession(session);
    } else {
      await SessionManager.clearSession();
    }
    setSession(null);
  }, [session]);

  const value = {
    isAuthenticated: !!session,
    session,
    login,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
