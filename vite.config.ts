import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['tests/**', 'examples/**'],
      rollupTypes: false,
    }),
  ],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        headless: resolve(__dirname, 'src/headless/index.ts'),
        'ant-design': resolve(__dirname, 'src/ant-design/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entry) => `${entry}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // ant-design-vue + dayjs are externalized so the adapter stays a thin
      // wrapper. Consumers of the ./ant-design subpath must install them.
      external: ['vue', 'ant-design-vue', 'dayjs'],
      output: {
        globals: { vue: 'Vue', 'ant-design-vue': 'AntDesignVue', dayjs: 'dayjs' },
      },
    },
  },
})
