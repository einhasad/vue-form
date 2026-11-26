import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const entries = {
  index: resolve(__dirname, 'src/index.ts'),
  headless: resolve(__dirname, 'src/headless/index.ts'),
  'ant-design': resolve(__dirname, 'src/ant-design/index.ts'),
}

// One self-contained declaration file per entry (dist/<entry>.d.ts) plus a
// .d.cts twin so `require` consumers under Node16/NodeNext get CJS types.
// No declaration maps: they would point at src/, which is not published.
export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['tests/**', 'examples/**'],
      rollupTypes: true,
      compilerOptions: { declarationMap: false },
      async afterBuild() {
        await Promise.all(
          Object.keys(entries).map((name) =>
            copyFile(resolve(__dirname, `dist/${name}.d.ts`), resolve(__dirname, `dist/${name}.d.cts`)),
          ),
        )
      },
    }),
  ],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    lib: {
      entry: entries,
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
