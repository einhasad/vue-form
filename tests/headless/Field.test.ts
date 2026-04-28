import { describe, it, expect } from 'vitest'
import { Field } from '../../src/headless/Field'
import type { Validator } from '../../src/headless/types'

describe('Field', () => {
  it('starts with empty errors and the given attribute', () => {
    const f = new Field('name')
    expect(f.attribute).toBe('name')
    expect(f.errors).toEqual([])
  })

  it('accepts an initial value via constructor', () => {
    const f = new Field('age', [], 42)
    expect(f.value).toBe(42)
  })

  it('validate runs every validator and collects all failures (no stop-at-first)', () => {
    const fail: Validator = () => ({ message: 'fail' })
    const f = new Field('name', [fail, fail, fail])
    f.value = ''
    f.validate()
    expect(f.errors).toHaveLength(3)
  })

  it('validate skips Promise-returning validators', () => {
    const sync: Validator = () => ({ message: 'sync' })
    const asyncFail: Validator = async () => ({ message: 'async' })
    const f = new Field('name', [sync, asyncFail])
    f.value = ''
    expect(f.validate()).toEqual([{ message: 'sync' }])
  })

  it('validateAsync awaits both sync and async validators', async () => {
    const sync: Validator = () => ({ message: 'sync' })
    const asyncFail: Validator = async () => ({ message: 'async' })
    const f = new Field('name', [sync, asyncFail])
    f.value = ''
    expect(await f.validateAsync()).toEqual([{ message: 'sync' }, { message: 'async' }])
  })

  it('validate replaces previous errors with the new run', () => {
    const fail: Validator = () => ({ message: 'fail' })
    const ok: Validator = () => undefined
    const f = new Field('name', [fail])
    f.validate()
    expect(f.errors).toHaveLength(1)
    f.setValidators([ok])
    f.validate()
    expect(f.errors).toEqual([])
  })

  it('setValidators / addValidator mutate the validator list', () => {
    const f = new Field('name')
    expect(f.validate()).toEqual([])
    f.setValidators([() => ({ message: 'a' })])
    expect(f.validate()).toEqual([{ message: 'a' }])
    f.addValidator(() => ({ message: 'b' }))
    expect(f.validate()).toEqual([{ message: 'a' }, { message: 'b' }])
  })

  it('setErrors / addError / clearErrors manipulate the errors list directly', () => {
    const f = new Field('name')
    f.setErrors([{ message: 'x' }])
    expect(f.errors).toEqual([{ message: 'x' }])
    f.addError({ message: 'y' })
    expect(f.errors).toEqual([{ message: 'x' }, { message: 'y' }])
    f.clearErrors()
    expect(f.errors).toEqual([])
  })

  it('value is read by validators at validate() time', () => {
    const seen: unknown[] = []
    const spy: Validator = (v) => {
      seen.push(v)
      return undefined
    }
    const f = new Field('a', [spy])
    f.value = 'one'
    f.validate()
    f.value = 'two'
    f.validate()
    expect(seen).toEqual(['one', 'two'])
  })
})
