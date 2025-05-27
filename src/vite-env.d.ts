/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SESSION_KEY: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SECURITY_MONITORING_URL?: string;
  readonly VITE_GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
