import { describe, it, expect, vi } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import FormField from '../../src/ant-design/FormField.vue'
import type { FormFieldBinding } from '../../src/ant-design/types'

vi.mock('vue', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue')>()),
  useId: undefined,
}))

describe('ant-design FormField on Vue < 3.5 (no useId)', () => {
  it('falls back to a per-process counter that still yields unique ids', () => {
    const ids: string[] = []
    const collect = ({ field }: { field: FormFieldBinding }) => {
      ids.push(field.id)
      return h('input')
    }
    for (let i = 0; i < 2; i++) {
      mount(() => h(FormField, { modelValue: '', attribute: 'name' }, { default: collect }), {
        global: { stubs: { 'a-form-item': { template: '<div><slot /></div>' } } },
      })
    }
    expect(ids).toHaveLength(2)
    expect(ids[0]).toMatch(/^vf-name-\d+$/)
    expect(ids[1]).toMatch(/^vf-name-\d+$/)
    expect(ids[0]).not.toBe(ids[1])
  })
})

describe('Vue 3.3/3.4 bundler compatibility', () => {
  const srcDir = join(__dirname, '../../src')
  const sources = (readdirSync(srcDir, { recursive: true }) as string[])
    .filter((f) => /\.(ts|vue)$/.test(f))
    .map((f) => ({ file: f, code: readFileSync(join(srcDir, f), 'utf8') }))

  it('no source statically references useId, which webpack rejects on Vue < 3.5', () => {
    const offenders = sources.filter(
      ({ code }) =>
        /\.\s*useId\b/.test(code) ||
        /import\s*\{[^}]*\buseId\b[^}]*\}\s*from\s*['"]vue['"]/.test(code),
    )
    expect(offenders.map((o) => o.file)).toEqual([])
  })
})
