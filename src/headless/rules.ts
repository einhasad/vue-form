import { getStrings, interpolate } from './strings'
import type { FieldError } from './types'

// Built-in rules are synchronous. The narrower return type helps
// callers access fields on the returned error without a cast.
type SyncValidator = (value: unknown) => FieldError | undefined

const isEmpty = (v: unknown): boolean =>
  v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)

export const required =
  (attr = '', override?: string): SyncValidator =>
  (v) =>
    isEmpty(v)
      ? { message: interpolate(override ?? getStrings().required, { attr }), key: 'required' }
      : undefined

export const minLen =
  (n: number, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    return typeof v === 'string' && v.length < n
      ? { message: interpolate(override ?? getStrings().minLen, { attr, min: n }), key: 'minLen' }
      : undefined
  }

export const maxLen =
  (n: number, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    return typeof v === 'string' && v.length > n
      ? { message: interpolate(override ?? getStrings().maxLen, { attr, max: n }), key: 'maxLen' }
      : undefined
  }

export const minNum =
  (n: number, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    const num = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(num) && num < n
      ? { message: interpolate(override ?? getStrings().minNum, { attr, min: n }), key: 'minNum' }
      : undefined
  }

export const maxNum =
  (n: number, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    const num = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(num) && num > n
      ? { message: interpolate(override ?? getStrings().maxNum, { attr, max: n }), key: 'maxNum' }
      : undefined
  }

export const pattern =
  (re: RegExp, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    return typeof v === 'string' && !re.test(v)
      ? { message: interpolate(override ?? getStrings().pattern, { attr }), key: 'pattern' }
      : undefined
  }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const email =
  (attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    return typeof v === 'string' && !EMAIL_RE.test(v)
      ? { message: interpolate(override ?? getStrings().email, { attr }), key: 'email' }
      : undefined
  }

export const url =
  (attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    if (typeof v !== 'string') return undefined
    try {
      // URL constructor accepts anything with a scheme — tighten by requiring http(s)
      // for the common form-field case.
      const u = new URL(v)
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return { message: interpolate(override ?? getStrings().url, { attr }), key: 'url' }
      }
      return undefined
    } catch {
      return { message: interpolate(override ?? getStrings().url, { attr }), key: 'url' }
    }
  }

export const integer =
  (attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    const num = typeof v === 'number' ? v : Number(v)
    if (!Number.isFinite(num)) return undefined
    return Number.isInteger(num)
      ? undefined
      : { message: interpolate(override ?? getStrings().integer, { attr }), key: 'integer' }
  }

export const numeric =
  (attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    if (typeof v === 'number') return Number.isFinite(v)
      ? undefined
      : { message: interpolate(override ?? getStrings().numeric, { attr }), key: 'numeric' }
    if (typeof v !== 'string') {
      return { message: interpolate(override ?? getStrings().numeric, { attr }), key: 'numeric' }
    }
    const num = Number(v)
    return Number.isFinite(num)
      ? undefined
      : { message: interpolate(override ?? getStrings().numeric, { attr }), key: 'numeric' }
  }

export const between =
  (min: number, max: number, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    const num = typeof v === 'number' ? v : Number(v)
    if (!Number.isFinite(num)) return undefined
    return num < min || num > max
      ? { message: interpolate(override ?? getStrings().between, { attr, min, max }), key: 'between' }
      : undefined
  }

export const lengthBetween =
  (min: number, max: number, attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    if (typeof v !== 'string') return undefined
    return v.length < min || v.length > max
      ? {
          message: interpolate(override ?? getStrings().lengthBetween, { attr, min, max }),
          key: 'lengthBetween',
        }
      : undefined
  }

export const oneOf =
  <T>(allowed: readonly T[], attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    return allowed.includes(v as T)
      ? undefined
      : {
          message: interpolate(override ?? getStrings().oneOf, {
            attr,
            values: allowed.join(', '),
          }),
          key: 'oneOf',
        }
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
    return v === target
      ? undefined
      : { message: interpolate(override ?? getStrings().sameAs, { attr }), key: 'sameAs' }
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
    return isEmpty(v)
      ? { message: interpolate(override ?? getStrings().required, { attr }), key: 'requiredIf' }
      : undefined
  }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const uuid =
  (attr = '', override?: string): SyncValidator =>
  (v) => {
    if (isEmpty(v)) return undefined
    if (typeof v !== 'string') return undefined
    return UUID_RE.test(v)
      ? undefined
      : { message: interpolate(override ?? getStrings().uuid, { attr }), key: 'uuid' }
  }

/**
 * Sibling-uniqueness validator for nested rows.
 * `siblings` may be a Vue ref ({ value: T[] }), a reactive array, or a plain
 * array — the helper unwraps `.value` if present.
 *
 * Compares `s[key]` of every sibling at index !== currentIndex against the
 * current value (strict equality) and emits a collision error.
 */
export const uniqueIn =
  <T extends Record<string, unknown>>(
    siblings: { value: T[] } | T[],
    currentIndex: number,
    key: keyof T,
    override?: string,
  ): SyncValidator =>
  (value) => {
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
