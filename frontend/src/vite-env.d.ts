/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DASHSCOPE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
