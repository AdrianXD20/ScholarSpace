/// <reference types="vite/client" />

declare module '*.png' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_MOCK_AUTH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
