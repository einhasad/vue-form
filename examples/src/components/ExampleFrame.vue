<template>
  <div class="ds-example-frame">
    <div class="ds-example-frame__chrome">
      <span class="ds-example-frame__file">{{ file }}</span>
      <div class="ds-example-frame__tools">
        <button
          v-for="tab in tabs"
          :key="tab"
          type="button"
          class="ds-example-frame__tab"
          :class="{ 'is-active': active === tab }"
          @click="active = tab"
        >
          {{ tab }}
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
      v-if="active === 'template'"
      class="ds-example-frame__code"
    >
      <div
        v-if="templateHtml"
        v-html="templateHtml"
      />
      <pre v-else><code>{{ templateSource }}</code></pre>
    </div>

    <div
      v-if="active === 'script'"
      class="ds-example-frame__code"
    >
      <div
        v-if="scriptHtml"
        v-html="scriptHtml"
      />
      <pre v-else><code>{{ scriptSource }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { codeToHtml } from 'shiki'

const props = defineProps<{
  file: string
  source: string
}>()

type Tab = 'preview' | 'template' | 'script'
const tabs: Tab[] = ['preview', 'template', 'script']
const active = ref<Tab>('preview')

const templateSource = computed(() => extractBlock(props.source, 'template'))
const scriptSource = computed(() => extractBlock(props.source, 'script'))

const templateHtml = shallowRef('')
const scriptHtml = shallowRef('')

const theme = 'github-light'

watch(
  templateSource,
  async (code) => {
    templateHtml.value = code ? await codeToHtml(code, { lang: 'vue-html', theme }) : ''
  },
  { immediate: true },
)

watch(
  scriptSource,
  async (code) => {
    scriptHtml.value = code ? await codeToHtml(code, { lang: 'typescript', theme }) : ''
  },
  { immediate: true },
)

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
  padding: 8px 12px;
  border-bottom: 1px solid var(--line);
  background: var(--surface-sunk);
}
.ds-example-frame__stage--plain {
  padding: var(--space-5);
  background: var(--paper);
}
.ds-example-frame__tab {
  background: transparent;
  border: 0;
  font: inherit;
  color: var(--ink-3);
  padding: 2px 8px;
  cursor: pointer;
  border-radius: 4px;
  text-transform: capitalize;
}
.ds-example-frame__tab:hover { color: var(--ink-2); }
.ds-example-frame__tab.is-active {
  color: var(--ink-1);
  background: var(--line-2);
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
  color: rgba(0, 0, 0, 0.28);
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
