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
