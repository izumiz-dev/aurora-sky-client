import { render } from 'preact';
import './index.css';
import { App } from './app.tsx';
import { initSentry } from './lib/sentry.optional';

// Sentryの初期化（本番環境でDSNが設定されている場合のみ）
initSentry();

// HTTPSへのリダイレクト（本番環境のみ）
if (window.location.protocol === 'http:' && !import.meta.env.DEV) {
  window.location.href = window.location.href.replace('http:', 'https:');
}

render(<App />, document.getElementById('app')!);
