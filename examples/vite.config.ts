import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// `BASE_PATH` is set by the GH Pages deploy workflow to `/vue-form/`.
// In local dev (`npm run dev` from examples/), it defaults to `/`.
const base = process.env.BASE_PATH ?? '/'

interface LibMeta {
  name: string
  version: string
  description: string
  homepage: string | undefined
  releaseDate: string
}

const RELEASE_HEADING = /^## \[?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\]? +[-–—] +(\d{4}-\d{2}-\d{2})\s*$/gm

function findReleaseDate(changelog: string, version: string): string {
  for (const [, headingVersion, date] of changelog.matchAll(RELEASE_HEADING)) {
    if (headingVersion === version) return date
  }
  throw new Error(
    `[examples] CHANGELOG.md has no release heading for ${version} ` +
      `(expected "## [${version}] - YYYY-MM-DD" or "## ${version} — YYYY-MM-DD").`,
  )
}

function readLibMeta(): LibMeta {
  const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'))
  const changelog = readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf8')
  return {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    homepage: pkg.homepage,
    releaseDate: findReleaseDate(changelog, pkg.version),
  }
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function demoSiteUrl(homepage: string | undefined): string | undefined {
  if (!homepage) return undefined
  const url = new URL(homepage)
  return url.protocol === 'https:' && url.hostname !== 'github.com' ? url.href : undefined
}

function libMetaHtml(meta: LibMeta): Plugin {
  const siteUrl = demoSiteUrl(meta.homepage)
  const tags: HtmlTagDescriptor[] = siteUrl
    ? [{ tag: 'meta', attrs: { property: 'og:url', content: siteUrl }, injectTo: 'head' }]
    : []
  return {
    name: 'lib-meta-html',
    transformIndexHtml: (html) => ({
      html: html
        .replace(/%LIB_NAME%/g, escapeHtml(meta.name))
        .replace(/%LIB_DESCRIPTION%/g, escapeHtml(meta.description)),
      tags,
    }),
  }
}

const VENDOR_CHUNKS: [RegExp, string][] = [
  [/\/node_modules\/(vue|@vue)\//, 'vue'],
  [/\/node_modules\/ant-design-vue\//, 'antd'],
  [/\/node_modules\/(@ant-design|@ctrl|@emotion|@simonwep|dayjs|dom-align|dom-scroll-into-view|resize-observer-polyfill|scroll-into-view-if-needed|compute-scroll-into-view|vue-types|lodash-es|async-validator|throttle-debounce|stylis|shallow-equal|array-tree-filter|@babel\/runtime)\//, 'antd-deps'],
  [/\/node_modules\/(msw|@mswjs|@bundled-es-modules|@open-draft|outvariant|strict-event-emitter|headers-polyfill|graphql|cookie|path-to-regexp|statuses|tough-cookie|is-node-process|type-fest)\//, 'msw'],
]

function vendorChunk(id: string): string | undefined {
  if (!id.includes('/node_modules/') || id.includes('/node_modules/shiki/') || id.includes('/node_modules/@shikijs/')) {
    return undefined
  }
  return VENDOR_CHUNKS.find(([re]) => re.test(id))?.[1] ?? 'vendor'
}

export default defineConfig(() => {
  const meta = readLibMeta()
  return {
    base,
    plugins: [vue(), libMetaHtml(meta)],
    define: {
      __LIB_NAME__: JSON.stringify(meta.name),
      __LIB_VERSION__: JSON.stringify(meta.version),
      __LIB_RELEASE_DATE__: JSON.stringify(meta.releaseDate),
    },
    build: {
      rollupOptions: {
        output: { manualChunks: vendorChunk },
      },
    },
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
  }
})
