/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_DEV_MOCK: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_DEFAULT_TIMEZONE: string;
  readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
