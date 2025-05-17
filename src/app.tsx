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
import { TestEmbedsPage } from './pages/TestEmbeds';

// 認証
import { AuthProvider } from './context/AuthContext';
import { LanguagePreferencesProvider } from './context/LanguagePreferences';

// スタイル
import './modern.css';
import './glass.css';

// React Query クライアントの初期化
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
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
            <Route path="/login" component={ModernLoginPage} />
            <Route
              path="/test-embeds"
              component={() => (
                <ModernLayout>
                  <TestEmbedsPage />
                </ModernLayout>
              )}
            />
            <Route
              path="/"
              component={() => (
                <ModernLayout>
                  <ModernHomePage />
                </ModernLayout>
              )}
            />
            <Route
              path="/settings"
              component={() => (
                <ModernLayout>
                  <ModernSettingsPage />
                </ModernLayout>
              )}
            />
            <Route
              path="/profile/:handle"
              component={(props: { handle?: string }) => (
                <ModernLayout>
                  <ModernProfilePage handle={props.handle} />
                </ModernLayout>
              )}
            />
            <Route
              path="/:rest*"
              component={() => (
                <ModernLayout>
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
