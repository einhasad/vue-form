import { afterEach, describe, it, expect } from 'vitest'
import { ref } from 'vue'
import * as rules from '../../src/headless/rules'
import { resetStrings, setStrings } from '../../src/headless/strings'
import type { Validator } from '../../src/headless/types'

afterEach(() => resetStrings())

describe('required', () => {
  it('flags empty strings, null, undefined, empty arrays', () => {
    const v = rules.required('Name')
    expect(v('')?.message).toBe('Name cannot be blank')
    expect(v(null)?.message).toBe('Name cannot be blank')
    expect(v(undefined)?.message).toBe('Name cannot be blank')
    expect(v([])?.message).toBe('Name cannot be blank')
  })
  it('passes for non-empty values', () => {
    const v = rules.required()
    expect(v('x')).toBeUndefined()
    expect(v(0)).toBeUndefined()
    expect(v(false)).toBeUndefined()
    expect(v([1])).toBeUndefined()
  })
  it('attaches key=required', () => {
    expect(rules.required()('')?.key).toBe('required')
  })
  it('honors an override message', () => {
    expect(rules.required('', 'Field is required')('')?.message).toBe('Field is required')
  })
})

describe('minLen / maxLen', () => {
  it('minLen flags strings shorter than n and skips empty', () => {
    const v = rules.minLen(3, 'Name')
    expect(v('ab')?.message).toBe('Name should contain at least 3 characters')
    expect(v('abc')).toBeUndefined()
    expect(v('')).toBeUndefined()
    expect(v(null)).toBeUndefined()
  })
  it('minLen passes through non-string non-empty values', () => {
    const v = rules.minLen(3)
    expect(v(123)).toBeUndefined()
    expect(v(true)).toBeUndefined()
    expect(v([1])).toBeUndefined()
  })
  it('maxLen flags strings longer than n', () => {
    const v = rules.maxLen(3, 'Name')
    expect(v('abcd')?.message).toBe('Name should contain at most 3 characters')
    expect(v('abc')).toBeUndefined()
  })
  it('maxLen skips empty and non-string non-empty values', () => {
    const v = rules.maxLen(3)
    expect(v('')).toBeUndefined()
    expect(v(123)).toBeUndefined()
    expect(v([1])).toBeUndefined()
  })
})

describe('minNum / maxNum', () => {
  it('minNum flags numbers below n and skips empty', () => {
    const v = rules.minNum(5, 'Qty')
    expect(v(4)?.message).toBe('Qty must be no less than 5')
    expect(v(5)).toBeUndefined()
    expect(v(null)).toBeUndefined()
  })
  it('maxNum flags numbers above n', () => {
    const v = rules.maxNum(10, 'Qty')
    expect(v(11)?.message).toBe('Qty must be no greater than 10')
    expect(v(10)).toBeUndefined()
  })
  it('maxNum skips empty', () => {
    const v = rules.maxNum(10)
    expect(v('')).toBeUndefined()
    expect(v(null)).toBeUndefined()
    expect(v(undefined)).toBeUndefined()
    expect(v([])).toBeUndefined()
  })
  it('coerces stringified numbers', () => {
    const v = rules.minNum(5)
    expect(v('4')?.key).toBe('minNum')
    expect(v('5')).toBeUndefined()
  })
  it('skips non-numeric values that coerce to NaN', () => {
    expect(rules.minNum(5)('abc')).toBeUndefined()
    expect(rules.maxNum(5)('abc')).toBeUndefined()
    expect(rules.minNum(5)({})).toBeUndefined()
  })
})

describe('pattern', () => {
  it('flags strings that do not match', () => {
    const v = rules.pattern(/^[A-Z]+$/, 'Code')
    expect(v('abc')?.message).toBe('Code format is invalid')
    expect(v('ABC')).toBeUndefined()
  })
  it('skips empty', () => {
    expect(rules.pattern(/x/)('')).toBeUndefined()
  })
  it('passes through non-string non-empty values', () => {
    expect(rules.pattern(/x/)(123)).toBeUndefined()
    expect(rules.pattern(/x/)([1])).toBeUndefined()
  })
})

describe('email', () => {
  it('validates a basic email shape', () => {
    expect(rules.email()('a@b.co')).toBeUndefined()
    expect(rules.email()('not-an-email')?.key).toBe('email')
  })
  it('skips empty and non-string non-empty values', () => {
    expect(rules.email()('')).toBeUndefined()
    expect(rules.email()(123)).toBeUndefined()
  })
  it('renders {attr} placeholder', () => {
    expect(rules.email('Email')('not-an-email')?.message).toBe('Email must be a valid email')
  })
  it('honors override message', () => {
    expect(rules.email('', 'bad email')('x')?.message).toBe('bad email')
  })
})

describe('uniqueIn', () => {
  it('detects collisions in a plain array', () => {
    const arr = [{ sku: 'A' }, { sku: 'B' }, { sku: 'A' }]
    const v = rules.uniqueIn(arr, 2, 'sku')
    expect(v('A')?.key).toBe('unique')
    expect(v('B')?.key).toBe('unique')
    expect(v('C')).toBeUndefined()
  })
  it('ignores its own row at currentIndex', () => {
    const arr = [{ sku: 'A' }, { sku: 'B' }]
    const v = rules.uniqueIn(arr, 0, 'sku')
    expect(v('A')).toBeUndefined()
  })
  it('unwraps a Vue ref-like { value: T[] }', () => {
    const r = ref([{ sku: 'A' }, { sku: 'B' }])
    const v = rules.uniqueIn<{ sku: string }>(r as { value: { sku: string }[] }, 1, 'sku')
    expect(v('A')?.key).toBe('unique')
    expect(v('Z')).toBeUndefined()
  })
  it('renders {value} placeholder', () => {
    const arr = [{ sku: 'A' }, { sku: 'B' }]
    const v = rules.uniqueIn(arr, 1, 'sku')
    expect(v('A')?.message).toBe('A is already used')
  })
  it('returns undefined when siblings ref unwraps to a non-array', () => {
    const refLike = { value: null as unknown as { sku: string }[] }
    const v = rules.uniqueIn<{ sku: string }>(refLike, 0, 'sku')
    expect(v('A')).toBeUndefined()
  })
  it('ignores null/undefined siblings entries', () => {
    const arr = [null as unknown as { sku: string }, { sku: 'A' }]
    const v = rules.uniqueIn(arr, 0, 'sku')
    expect(v('A')?.key).toBe('unique')
  })
  it('honors an override message', () => {
    const v = rules.uniqueIn([{ sku: 'A' }, { sku: 'A' }], 1, 'sku', 'taken: {value}')
    expect(v('A')?.message).toBe('taken: A')
  })
})

describe('late setStrings updates', () => {
  it('takes effect on the next validation run', () => {
    const v = rules.required('Name')
    expect(v('')?.message).toBe('Name cannot be blank')
    setStrings({ required: 'Required: {attr}' })
    expect(v('')?.message).toBe('Required: Name')
  })
})

describe('async validator interop', () => {
  it('Promise-returning validators work the same way through validateAsync flow', async () => {
    const remoteCheck: Validator = async (v) =>
      v === 'taken' ? { message: 'already taken', key: 'unique' } : undefined
    expect(await Promise.resolve(remoteCheck('taken'))).toEqual({
      message: 'already taken',
      key: 'unique',
    })
    expect(await Promise.resolve(remoteCheck('free'))).toBeUndefined()
  })
})
