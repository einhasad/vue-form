import { getStrings, interpolate } from './strings'
import type { FieldError, SyncValidator } from './types'

const isEmpty = (v: unknown): boolean =>
  v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)

const isBlank = (v: unknown): boolean =>
  isEmpty(v) || (typeof v === 'string' && v.trim() === '')

const NON_DECIMAL_PREFIX = /^\s*[+-]?0[box]/i

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && (v.trim() === '' || NON_DECIMAL_PREFIX.test(v))) return NaN
  return Number(v)
}

const fail = (
  key: string,
  template: string,
  attr: string,
  params: Record<string, unknown> = {},
): FieldError => ({
  message: interpolate(template, { ...params, attr: attr || getStrings().fieldFallback }),
  key,
})

export const required =
  (attr = '', override?: string): SyncValidator =>
  (v) =>
    isBlank(v) ? fail('required', override ?? getStrings().required, attr) : undefined

export const minLen =
  (n: number, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    return typeof v === 'string' && v.length < n
      ? fail('minLen', override ?? getStrings().minLen, attr, { min: n })
      : undefined
  }

export const maxLen =
  (n: number, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    return typeof v === 'string' && v.length > n
      ? fail('maxLen', override ?? getStrings().maxLen, attr, { max: n })
      : undefined
  }

export const minNum =
  (n: number, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    const num = toNumber(v)
    return Number.isFinite(num) && num < n
      ? fail('minNum', override ?? getStrings().minNum, attr, { min: n })
      : undefined
  }

export const maxNum =
  (n: number, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    const num = toNumber(v)
    return Number.isFinite(num) && num > n
      ? fail('maxNum', override ?? getStrings().maxNum, attr, { max: n })
      : undefined
  }

export const pattern = (re: RegExp, attr = '', override?: string): SyncValidator => {
  const matcher = new RegExp(re)
  return (v) => {
    if (isEmpty(v)) return undefined
    matcher.lastIndex = 0
    return typeof v === 'string' && !matcher.test(v)
      ? fail('pattern', override ?? getStrings().pattern, attr)
      : undefined
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const email =
  (attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    return typeof v === 'string' && !EMAIL_RE.test(v)
      ? fail('email', override ?? getStrings().email, attr)
      : undefined
  }

const isHttpUrl = (v: string): boolean => {
  try {
    const { protocol } = new URL(v)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export const url =
  (attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    if (typeof v !== 'string') return undefined
    return isHttpUrl(v) ? undefined : fail('url', override ?? getStrings().url, attr)
  }

export const integer =
  (attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    const num = toNumber(v)
    if (!Number.isFinite(num)) return undefined
    return Number.isInteger(num)
      ? undefined
      : fail('integer', override ?? getStrings().integer, attr)
  }

export const numeric =
  (attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    const isNumber = (typeof v === 'number' || typeof v === 'string') && Number.isFinite(toNumber(v))
    return isNumber ? undefined : fail('numeric', override ?? getStrings().numeric, attr)
  }

export const between =
  (min: number, max: number, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    const num = toNumber(v)
    if (!Number.isFinite(num)) return undefined
    return num < min || num > max
      ? fail('between', override ?? getStrings().between, attr, { min, max })
      : undefined
  }

export const lengthBetween =
  (min: number, max: number, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    if (typeof v !== 'string') return undefined
    return v.length < min || v.length > max
      ? fail('lengthBetween', override ?? getStrings().lengthBetween, attr, { min, max })
      : undefined
  }

export const oneOf =
  <T>(allowed: readonly T[], attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    return allowed.includes(v as T)
      ? undefined
      : fail('oneOf', override ?? getStrings().oneOf, attr, { values: allowed.join(', ') })
  }

/**
 * Cross-field equality. `other` may be a plain value or a Vue-ref-like
 * `{ value: unknown }` — same duck-typed pattern as `uniqueIn`.
 */
export const sameAs =
  (other: unknown, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    const target =
      other != null && typeof other === 'object' && 'value' in (other as Record<string, unknown>)
        ? (other as { value: unknown }).value
        : other
    return v === target ? undefined : fail('sameAs', override ?? getStrings().sameAs, attr)
  }

/**
 * Conditionally apply `required`. Predicate is called on every validation;
 * when it returns truthy, blank values fail. Use a closure to read other
 * field values without coupling to Vue.
 */
export const requiredIf =
  (predicate: () => unknown, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (!predicate()) return undefined
    return isBlank(v) ? fail('requiredIf', override ?? getStrings().required, attr) : undefined
  }

const UUID_RE =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|0{8}-0{4}-0{4}-0{4}-0{12}|f{8}-f{4}-f{4}-f{4}-f{12})$/i

export const uuid =
  (attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    if (typeof v !== 'string') return undefined
    return UUID_RE.test(v) ? undefined : fail('uuid', override ?? getStrings().uuid, attr)
  }

/**
 * Sibling-uniqueness validator for nested rows.
 * `siblings` may be a Vue ref ({ value: T[] }), a reactive array, or a plain
 * array — the helper unwraps `.value` if present.
 *
 * Compares `s[key]` of every sibling at index !== currentIndex against the
 * current value (strict equality) and emits a collision error. Empty values
 * are skipped like in every other rule.
 */
export const uniqueIn =
  <T extends Record<string, unknown>>(
    siblings: { value: T[] } | T[],
    currentIndex: number,
    key: keyof T,
    override?: string,
  ): SyncValidator =>
  (value) => {
    if (isEmpty(value)) return undefined
    const arr = Array.isArray(siblings) ? siblings : (siblings as { value: T[] }).value
    if (!Array.isArray(arr)) return undefined
    const collision = arr.some((s, i) => i !== currentIndex && s != null && s[key] === value)
    return collision
      ? {
          message: interpolate(override ?? getStrings().unique, { value: String(value) }),
          key: 'unique',
        }
      : undefined
  }
