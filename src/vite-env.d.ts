/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_VERSION: string
  readonly VITE_ENV: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  // Agregar más variables de entorno según sea necesario
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
