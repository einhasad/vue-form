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

describe('url', () => {
  it('accepts http(s) URLs', () => {
    expect(rules.url()('https://example.com')).toBeUndefined()
    expect(rules.url()('http://example.com/foo?bar=1')).toBeUndefined()
  })
  it('rejects malformed URLs and non-http(s) schemes', () => {
    expect(rules.url('Site')('not a url')?.message).toBe('Site must be a valid URL')
    expect(rules.url()('ftp://example.com')?.key).toBe('url')
    expect(rules.url()('javascript:alert(1)')?.key).toBe('url')
  })
  it('skips empty and non-string values', () => {
    expect(rules.url()('')).toBeUndefined()
    expect(rules.url()(123)).toBeUndefined()
    expect(rules.url()(null)).toBeUndefined()
  })
})

describe('integer', () => {
  it('accepts whole numbers (number or stringified)', () => {
    expect(rules.integer()(0)).toBeUndefined()
    expect(rules.integer()(-7)).toBeUndefined()
    expect(rules.integer()('42')).toBeUndefined()
  })
  it('rejects fractional values', () => {
    expect(rules.integer('Qty')(1.5)?.message).toBe('Qty must be an integer')
    expect(rules.integer()('1.5')?.key).toBe('integer')
  })
  it('skips empty and non-coercible values', () => {
    expect(rules.integer()('')).toBeUndefined()
    expect(rules.integer()('abc')).toBeUndefined()
    expect(rules.integer()({})).toBeUndefined()
  })
})

describe('numeric', () => {
  it('accepts numbers and stringified numbers', () => {
    expect(rules.numeric()(0)).toBeUndefined()
    expect(rules.numeric()(1.5)).toBeUndefined()
    expect(rules.numeric()('42')).toBeUndefined()
    expect(rules.numeric()('-3.14')).toBeUndefined()
  })
  it('rejects non-numeric strings, NaN, and arbitrary objects', () => {
    expect(rules.numeric('Amount')('abc')?.message).toBe('Amount must be a number')
    expect(rules.numeric()(NaN)?.key).toBe('numeric')
    expect(rules.numeric()({})?.key).toBe('numeric')
    expect(rules.numeric()(true)?.key).toBe('numeric')
  })
  it('skips empty', () => {
    expect(rules.numeric()('')).toBeUndefined()
    expect(rules.numeric()(null)).toBeUndefined()
  })
})

describe('between', () => {
  it('flags values outside [min,max]', () => {
    const v = rules.between(1, 10, 'Score')
    expect(v(0)?.message).toBe('Score must be between 1 and 10')
    expect(v(11)?.key).toBe('between')
  })
  it('passes for inclusive bounds', () => {
    const v = rules.between(1, 10)
    expect(v(1)).toBeUndefined()
    expect(v(10)).toBeUndefined()
    expect(v(5)).toBeUndefined()
  })
  it('coerces stringified numbers', () => {
    expect(rules.between(1, 10)('5')).toBeUndefined()
    expect(rules.between(1, 10)('11')?.key).toBe('between')
  })
  it('skips empty and NaN-coercing values', () => {
    expect(rules.between(1, 10)('')).toBeUndefined()
    expect(rules.between(1, 10)('abc')).toBeUndefined()
  })
})

describe('lengthBetween', () => {
  it('flags strings outside [min,max] length', () => {
    const v = rules.lengthBetween(2, 4, 'Tag')
    expect(v('a')?.message).toBe('Tag should contain between 2 and 4 characters')
    expect(v('abcde')?.key).toBe('lengthBetween')
  })
  it('passes for inclusive bounds', () => {
    const v = rules.lengthBetween(2, 4)
    expect(v('ab')).toBeUndefined()
    expect(v('abcd')).toBeUndefined()
  })
  it('skips empty and non-string values', () => {
    expect(rules.lengthBetween(2, 4)('')).toBeUndefined()
    expect(rules.lengthBetween(2, 4)(123)).toBeUndefined()
  })
})

describe('oneOf', () => {
  it('flags values outside the allowed set', () => {
    const v = rules.oneOf(['draft', 'sent', 'archived'], 'Status')
    expect(v('deleted')?.message).toBe('Status must be one of: draft, sent, archived')
    expect(v('draft')).toBeUndefined()
  })
  it('uses strict equality (no coercion)', () => {
    const v = rules.oneOf([1, 2, 3])
    expect(v('1')?.key).toBe('oneOf')
    expect(v(1)).toBeUndefined()
  })
  it('skips empty', () => {
    expect(rules.oneOf(['a', 'b'])('')).toBeUndefined()
    expect(rules.oneOf(['a', 'b'])(null)).toBeUndefined()
  })
})

describe('sameAs', () => {
  it('compares against a plain value', () => {
    const v = rules.sameAs('secret', 'Confirm')
    expect(v('secret')).toBeUndefined()
    expect(v('other')?.message).toBe('Confirm does not match')
  })
  it('unwraps a Vue-ref-like target', () => {
    const password = ref('hunter2')
    const v = rules.sameAs(password, 'Confirm')
    expect(v('hunter2')).toBeUndefined()
    password.value = 'changed'
    expect(v('hunter2')?.key).toBe('sameAs')
  })
  it('skips empty', () => {
    expect(rules.sameAs('x')('')).toBeUndefined()
    expect(rules.sameAs(ref('x'))('')).toBeUndefined()
  })
})

describe('requiredIf', () => {
  it('only enforces required when predicate is truthy', () => {
    let active = false
    const v = rules.requiredIf(() => active, 'VAT')
    expect(v('')).toBeUndefined()
    active = true
    expect(v('')?.message).toBe('VAT cannot be blank')
    expect(v('value')).toBeUndefined()
  })
  it('attaches key=requiredIf', () => {
    expect(rules.requiredIf(() => true)('')?.key).toBe('requiredIf')
  })
})

describe('uuid', () => {
  it('accepts canonical UUIDs (v1-v8)', () => {
    expect(rules.uuid()('550e8400-e29b-41d4-a716-446655440000')).toBeUndefined()
    expect(rules.uuid()('1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed')).toBeUndefined()
  })
  it('rejects malformed UUIDs', () => {
    expect(rules.uuid('Id')('not-a-uuid')?.message).toBe('Id must be a valid UUID')
    expect(rules.uuid()('550e8400-e29b-41d4-a716-44665544000')?.key).toBe('uuid')
  })
  it('skips empty and non-string values', () => {
    expect(rules.uuid()('')).toBeUndefined()
    expect(rules.uuid()(123)).toBeUndefined()
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
