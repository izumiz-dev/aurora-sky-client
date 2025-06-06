import { Router, Route } from 'preact-router';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// モダンレイアウト
import { ModernLayout } from './layouts/ModernLayout';

// モダンページ
import { ModernHomePage } from './pages/ModernHome';
import { ModernLoginPage } from './pages/ModernLogin';
import { ModernSettingsPage } from './pages/ModernSettings';
import { ModernProfilePage } from './pages/ModernProfile';
import { NotFoundPage } from './pages/NotFound';
import { AuroraLoaderShowcase } from './components/AuroraLoaderShowcase';

// 認証
import { AuthProvider } from './context/AuthContext';
import { LanguagePreferencesProvider } from './context/LanguagePreferences';

// スタイル - glass.cssを最後に読み込んで優先度を上げる
import './modern.css';
import './styles/mobile.css'; // mobile.cssをglass.cssの前に移動
import './glass.css';
import './styles/transitions.css';
import './styles/aurora-loader.css';

// React Query クライアントの初期化
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false, // 再接続時の自動更新を無効
      refetchInterval: false, // バックグラウンドでの定期更新を無効
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguagePreferencesProvider>
          <Router>
            <Route
              path="/login"
              component={(props: { path?: string }) => (
                <ModernLayout path={props.path}>
                  <ModernLoginPage />
                </ModernLayout>
              )}
            />
            <Route
              path="/"
              component={(props: { path?: string }) => (
                <ModernLayout path={props.path}>
                  <ModernHomePage />
                </ModernLayout>
              )}
            />
            <Route
              path="/settings"
              component={(props: { path?: string }) => (
                <ModernLayout path={props.path}>
                  <ModernSettingsPage />
                </ModernLayout>
              )}
            />
            <Route
              path="/profile/:handle"
              component={(props: { handle?: string; path?: string }) => (
                <ModernLayout path={props.path}>
                  <ModernProfilePage handle={props.handle} />
                </ModernLayout>
              )}
            />
            <Route path="/showcase" component={AuroraLoaderShowcase} />
            <Route
              path="/:rest*"
              component={(props: { path?: string }) => (
                <ModernLayout path={props.path}>
                  <NotFoundPage />
                </ModernLayout>
              )}
            />
          </Router>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'glass',
              style: {
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(var(--glass-blur))',
                WebkitBackdropFilter: 'blur(var(--glass-blur))',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--glass-shadow)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </LanguagePreferencesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
