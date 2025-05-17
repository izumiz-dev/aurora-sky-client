import { createContext } from 'preact';
import { useState, useEffect, useCallback, useContext } from 'preact/hooks';
import { BskyAgent } from '@atproto/api';
import type { SessionData } from '../types/session';

type AuthContextType = {
  isAuthenticated: boolean;
  session: SessionData | null;
  login: (identifier: string, password: string) => Promise<void>;
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
      const storedSession = localStorage.getItem('bsky-session');
      if (storedSession && mounted) {
        try {
          const parsedSession = JSON.parse(storedSession);
          // console.log('Restored session:', parsedSession);

          // アバターが無い場合は取得を試みる
          if (!parsedSession.avatar && parsedSession.did) {
            try {
              const agent = new BskyAgent({ service: 'https://bsky.social' });
              await agent.resumeSession(parsedSession);
              const profile = await agent.getProfile({ actor: parsedSession.did });

              const sessionWithAvatar = {
                ...parsedSession,
                avatar: profile.data.avatar,
              };

              setSession(sessionWithAvatar);
              localStorage.setItem('bsky-session', JSON.stringify(sessionWithAvatar));
            } catch (error) {
              console.error('Failed to fetch profile:', error);
              setSession(parsedSession);
            }
          } else {
            setSession(parsedSession);
          }
        } catch (e) {
          console.error('Failed to parse stored session', e);
          localStorage.removeItem('bsky-session');
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

  const login = useCallback(async (identifier: string, password: string) => {
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
        // プロフィール情報を取得
        try {
          const profile = await agent.getProfile({ actor: data.did });
          const sessionWithAvatar = {
            ...data,
            avatar: profile.data.avatar,
          };

          setSession(sessionWithAvatar);
          localStorage.setItem('bsky-session', JSON.stringify(sessionWithAvatar));
        } catch (profileError) {
          // プロフィール取得に失敗してもログインは続行
          console.error('Profile fetch failed:', profileError);
          setSession(data);
          localStorage.setItem('bsky-session', JSON.stringify(data));
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
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem('bsky-session');
  }, []);

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
