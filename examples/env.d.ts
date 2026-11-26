/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare const __LIB_NAME__: string
declare const __LIB_VERSION__: string
declare const __LIB_RELEASE_DATE__: string
