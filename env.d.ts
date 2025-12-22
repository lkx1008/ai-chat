/// <reference types="vite/client" />

// 添加环境变量类型声明
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_KEY: string
  readonly VITE_API_MODEL: string
  readonly VITE_USE_REAL_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}