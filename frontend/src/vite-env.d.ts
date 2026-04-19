/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENCRYPTION_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
