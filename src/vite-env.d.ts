/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_IS_PREVIEW: string;
  readonly VITE_TRUE_NORTH_ENABLED?: string;
  readonly VITE_TRUE_NORTH_ALLOWLIST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
