<script setup lang="ts">
import type { LogEvent } from '../composables/useEventLog'

defineProps<{ events: LogEvent[] }>()
defineEmits<{ clear: [] }>()

function fmtTime(ts: number) {
  const d = new Date(ts)
  const pad = (n: number, w = 2) => String(n).padStart(w, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`
}

function fmtData(data: unknown): string {
  if (data === undefined) return ''
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}
</script>

<template>
  <section class="console">
    <header class="console__head">
      <strong>Event log</strong>
      <span class="console__count">{{ events.length }} {{ events.length === 1 ? 'event' : 'events' }}</span>
      <button type="button" class="console__clear" :disabled="!events.length" @click="$emit('clear')">Clear</button>
    </header>
    <ol v-if="events.length" class="console__list">
      <li v-for="e in events" :key="e.id" :class="`console__item console__item--${e.type}`">
        <span class="console__ts">{{ fmtTime(e.ts) }}</span>
        <span class="console__tag">{{ e.type }}</span>
        <span class="console__msg">{{ e.message }}</span>
        <pre v-if="e.data !== undefined" class="console__data">{{ fmtData(e.data) }}</pre>
      </li>
    </ol>
    <p v-else class="console__empty">No events yet — interact with the form above.</p>
  </section>
</template>

<style scoped>
.console {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 6px;
  padding: 0.75rem 0.9rem;
  margin-top: 1.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.78rem;
  max-height: 360px;
  overflow-y: auto;
}
.console__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  position: sticky;
  top: -0.75rem;
  background: #0f172a;
  padding-top: 0.25rem;
}
.console__count { color: #64748b; flex: 1; }
.console__clear {
  background: transparent;
  color: #94a3b8;
  border: 1px solid #334155;
  border-radius: 3px;
  padding: 0.15rem 0.55rem;
  font: inherit;
  cursor: pointer;
}
.console__clear:hover:not(:disabled) { color: #e2e8f0; border-color: #475569; }
.console__clear:disabled { opacity: 0.4; cursor: not-allowed; }
.console__list { list-style: none; margin: 0; padding: 0; }
.console__item {
  display: grid;
  grid-template-columns: 100px 100px 1fr;
  gap: 0.5rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid #1e293b;
}
.console__ts { color: #64748b; }
.console__tag { font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; font-size: 0.7rem; align-self: center; }
.console__item--info .console__tag        { color: #94a3b8; }
.console__item--submit .console__tag      { color: #60a5fa; }
.console__item--success .console__tag     { color: #4ade80; }
.console__item--fail .console__tag        { color: #f87171; }
.console__item--field-error .console__tag { color: #fb923c; }
.console__item--validator .console__tag   { color: #c084fc; }
.console__item--request .console__tag     { color: #38bdf8; }
.console__item--response .console__tag    { color: #a3e635; }
.console__msg { word-break: break-word; align-self: center; }
.console__data {
  grid-column: 2 / -1;
  margin: 0.3rem 0 0;
  padding: 0.5rem 0.6rem;
  background: #1e293b;
  border-radius: 3px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: #cbd5e1;
}
</style>
