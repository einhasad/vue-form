import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
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
