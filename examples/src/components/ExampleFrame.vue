<template>
  <div class="ds-example-frame">
    <div class="ds-example-frame__chrome">
      <span class="ds-example-frame__file">{{ file }}</span>
      <div
        class="ds-example-frame__tools"
        role="group"
        :aria-label="`${file} view`"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="ds-example-frame__tab"
          :class="{ 'is-active': active === tab.id }"
          :aria-pressed="active === tab.id"
          @click="active = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div
      v-show="active === 'preview'"
      class="ds-example-frame__stage ds-example-frame__stage--plain"
    >
      <slot />
    </div>

    <div
      v-if="activeCode"
      class="ds-example-frame__panel"
    >
      <button
        type="button"
        class="ds-example-frame__copy"
        :class="{ 'is-copied': copiedId === activeCode.id }"
        @click="copy(activeCode)"
      >
        {{ copiedId === activeCode.id ? 'Copied' : 'Copy' }}<span class="ds-example-frame__sr">{{ ` ${activeCode.label} code` }}</span>
      </button>
      <div class="ds-example-frame__code">
        <!-- eslint-disable vue/no-v-html -- shiki output of the demo's own source files, no user input -->
        <div
          v-if="highlighted[activeCode.id]"
          v-html="highlighted[activeCode.id]"
        />
        <!-- eslint-enable vue/no-v-html -->
        <pre v-else><code>{{ activeCode.code }}</code></pre>
      </div>
    </div>
    <span
      class="ds-example-frame__sr"
      role="status"
      aria-live="polite"
    >{{ copyStatus }}</span>
  </div>
</template>

<script lang="ts">
import type { HighlighterCore } from 'shiki/core'

let highlighterPromise: Promise<HighlighterCore> | null = null

async function createHighlighter(): Promise<HighlighterCore> {
  const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
  ])
  return createHighlighterCore({
    themes: [import('shiki/themes/github-light.mjs')],
    langs: [
      import('shiki/langs/vue.mjs'),
      import('shiki/langs/vue-html.mjs'),
      import('shiki/langs/typescript.mjs'),
    ],
    engine: createJavaScriptRegexEngine(),
  })
}

function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighter()
  return highlighterPromise
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

const props = defineProps<{
  file: string
  source: string
}>()

type CodeLang = 'vue' | 'vue-html' | 'typescript'

interface CodeTab {
  id: string
  label: string
  code: string
  lang: CodeLang
}

interface Tab {
  id: string
  label: string
}

const THEME = 'github-light'

const widgetSources = import.meta.glob<string>('../examples/widgets/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const active = ref('preview')

const codeTabs = computed<CodeTab[]>(() => {
  const result: CodeTab[] = [
    { id: 'template', label: 'template', code: extractBlock(props.source, 'template'), lang: 'vue-html' },
    { id: 'script', label: 'script', code: extractBlock(props.source, 'script'), lang: 'typescript' },
  ]
  for (const fileName of importedWidgets(props.source)) {
    const code = widgetSources[`../examples/widgets/${fileName}`]
    if (code) result.push({ id: fileName, label: fileName, code, lang: 'vue' })
  }
  return result
})

const tabs = computed<Tab[]>(() => [
  { id: 'preview', label: 'preview' },
  ...codeTabs.value.map(({ id, label }) => ({ id, label })),
])

const activeCode = computed(() => codeTabs.value.find((tab) => tab.id === active.value))

const highlighted = reactive<Record<string, string>>({})

watch(
  codeTabs,
  async (list) => {
    const highlighter = await getHighlighter()
    for (const tab of list) {
      highlighted[tab.id] = tab.code
        ? highlighter.codeToHtml(tab.code, { lang: tab.lang, theme: THEME })
        : ''
    }
  },
  { immediate: true },
)

const copiedId = ref<string | null>(null)
const copyStatus = ref('')
let copiedTimer: ReturnType<typeof setTimeout> | null = null

async function copy(tab: CodeTab) {
  try {
    await navigator.clipboard.writeText(tab.code)
    copiedId.value = tab.id
    copyStatus.value = `Copied ${tab.label} code to clipboard`
  } catch {
    copiedId.value = null
    copyStatus.value = `Could not copy ${tab.label} code`
  }
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copiedId.value = null
    copyStatus.value = ''
  }, 2000)
}

onBeforeUnmount(() => {
  if (copiedTimer) clearTimeout(copiedTimer)
})

function importedWidgets(source: string): string[] {
  const script = extractBlock(source, 'script')
  const importRe = /import\s+\w+\s+from\s+['"]\.\/widgets\/([\w-]+\.vue)['"]/g
  return [...new Set([...script.matchAll(importRe)].map((m) => m[1]))]
}

function extractBlock(source: string, tag: 'template' | 'script'): string {
  const openRe = new RegExp(`<${tag}\\b[^>]*>`, 'i')
  const openMatch = source.match(openRe)
  if (openMatch?.index === undefined) return ''
  const start = openMatch.index + openMatch[0].length

  const tokenRe = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi')
  tokenRe.lastIndex = start
  let depth = 1
  let m: RegExpExecArray | null
  while ((m = tokenRe.exec(source)) !== null) {
    if (m[0].startsWith('</')) {
      depth--
      if (depth === 0) {
        return source.slice(start, m.index).replace(/^\n+|\n+$/g, '')
      }
    } else {
      depth++
    }
  }
  return source.slice(start).replace(/^\n+|\n+$/g, '')
}
</script>

<style scoped>
.ds-example-frame {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface);
}
.ds-example-frame__chrome {
  flex-wrap: wrap;
  row-gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--line);
  background: var(--surface-sunk);
}
.ds-example-frame__file {
  overflow-wrap: anywhere;
}
.ds-example-frame__tools {
  flex-wrap: wrap;
  gap: 4px;
}
.ds-example-frame__stage--plain {
  padding: var(--space-5);
  background: var(--paper);
}
.ds-example-frame__tab {
  min-height: 24px;
  padding: 4px 10px;
  background: transparent;
  border: 0;
  font: inherit;
  color: var(--ink-3);
  cursor: pointer;
  border-radius: 4px;
  text-transform: capitalize;
}
.ds-example-frame__tab:hover { color: var(--ink-2); }
.ds-example-frame__tab.is-active {
  color: var(--ink);
  background: var(--line-2);
}
.ds-example-frame__panel {
  position: relative;
}
.ds-example-frame__copy {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  min-height: 24px;
  padding: 4px 9px;
  border: 1px solid var(--line-2);
  border-radius: var(--radius-xs);
  background: var(--surface);
  color: var(--ink-2);
  font-family: var(--font-sans);
  font-size: 11px;
  cursor: pointer;
}
.ds-example-frame__copy:hover { color: var(--ink); }
.ds-example-frame__copy.is-copied {
  color: var(--success);
  border-color: var(--success);
}
.ds-example-frame__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.ds-example-frame__code {
  overflow: auto;
  max-height: 480px;
  font-size: 12.5px;
  line-height: 1.65;
  background: var(--paper);
}
.ds-example-frame__code :deep(pre.shiki) {
  margin: 0;
  padding: 0;
  font-family: var(--font-mono);
  background: transparent !important;
  overflow: visible;
  counter-reset: step;
}
.ds-example-frame__code :deep(pre.shiki code) {
  font-family: var(--font-mono);
  display: block;
}
.ds-example-frame__code :deep(pre.shiki .line) {
  display: inline-block;
  width: 100%;
}
.ds-example-frame__code :deep(pre.shiki .line::before) {
  counter-increment: step;
  content: counter(step);
  display: inline-block;
  width: 3em;
  margin-right: 1.25em;
  padding-right: 0.75em;
  text-align: right;
  color: var(--ink-3);
  border-right: 1px solid var(--line);
  user-select: none;
}
.ds-example-frame__code > pre {
  margin: 0;
  padding: 16px;
  font-family: var(--font-mono);
  color: var(--ink-2);
  white-space: pre;
}
</style>
