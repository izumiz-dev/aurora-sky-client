import { render } from 'preact';
import './index.css';
import './styles/mobile.css';
import './styles/header-fix.css';
import { App } from './app.tsx';
import { initSentry } from './lib/sentry.optional';
import { registerServiceWorker } from './lib/sw-register';

// Sentryの初期化（本番環境でDSNが設定されている場合のみ）
initSentry();

// HTTPSへのリダイレクト（本番環境のみ）
if (window.location.protocol === 'http:' && !import.meta.env.DEV) {
  window.location.href = window.location.href.replace('http:', 'https:');
}

// Service Workerの登録（本番環境のみ）
if (!import.meta.env.DEV) {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

render(<App />, document.getElementById('app')!);
