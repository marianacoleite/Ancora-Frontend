/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base do Express (health checks). Ex.: `https://…railway.app` */
  readonly VITE_BACKEND_URL?: string
  /** E-mail de login (opcional, pré-preenchimento em dev) */
  readonly VITE_USUARIO?: string
  /** Senha (opcional, pré-preenchimento em dev; não usar segredos reais) */
  readonly VITE_SENHA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
