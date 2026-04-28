import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

// `BASE_PATH` is set by the GH Pages deploy workflow to `/vue-form/`.
// In local dev (`npm run dev` from examples/), it defaults to `/`.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [vue()],
  resolve: {
    alias: {
      '@einhasad-vue/vue-form/headless': resolve(__dirname, '../src/headless/index.ts'),
      '@einhasad-vue/vue-form/ant-design': resolve(__dirname, '../src/ant-design/index.ts'),
      '@einhasad-vue/vue-form': resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
})
