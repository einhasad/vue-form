import { describe, it, expect, vi } from 'vitest'
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
  describe('sync pass with async validators', () => {
    it('still calls async validators but swallows their rejection', async () => {
      const unhandled = vi.fn()
      process.on('unhandledRejection', unhandled)
      try {
        let calls = 0
        const rejecting: Validator = () => {
          calls++
          return Promise.reject(new Error('network down'))
        }
        const f = new Field('name', [rejecting], 'x')
        expect(f.validate()).toEqual([])
        expect(calls).toBe(1)
        await new Promise((r) => setTimeout(r, 0))
        expect(unhandled).not.toHaveBeenCalled()
      } finally {
        process.off('unhandledRejection', unhandled)
      }
    })
  })

  describe('stale async results', () => {
    const deferred = () => {
      let resolve!: (e: { message: string } | undefined) => void
      const promise = new Promise<{ message: string } | undefined>((r) => (resolve = r))
      return { promise, resolve }
    }

    it('does not apply a result computed for a value that changed meanwhile', async () => {
      const pending = new Map<unknown, ReturnType<typeof deferred>>()
      const taken: Validator = (v) => {
        const d = deferred()
        pending.set(v, d)
        return d.promise
      }
      const f = new Field('login', [taken], 'TAKEN1')
      const result = f.validateAsync()
      f.value = 'GOOD1'
      pending.get('TAKEN1')!.resolve({ message: 'TAKEN1 taken' })
      await vi.waitFor(() => expect(pending.has('GOOD1')).toBe(true))
      pending.get('GOOD1')!.resolve(undefined)
      expect(await result).toEqual([])
      expect(f.errors).toEqual([])
    })

    it('an older run resolves with the newer run result for the same value', async () => {
      const calls: ReturnType<typeof deferred>[] = []
      const slow: Validator = () => {
        const d = deferred()
        calls.push(d)
        return d.promise
      }
      const f = new Field('login', [slow], 'a')
      const first = f.validateAsync()
      const second = f.validateAsync()
      calls[0].resolve({ message: 'old' })
      calls[1].resolve({ message: 'new' })
      expect(await first).toEqual([{ message: 'new' }])
      expect(await second).toEqual([{ message: 'new' }])
      expect(f.errors).toEqual([{ message: 'new' }])
      expect(calls).toHaveLength(2)
    })

    it('a rejecting async validator rejects validateAsync', async () => {
      const f = new Field('a', [() => Promise.reject(new Error('boom'))])
      await expect(f.validateAsync()).rejects.toThrow('boom')
    })
  })

  describe('errors set from outside', () => {
    const tooShort: Validator = (v) =>
      String(v).length < 3 ? { message: 'too short' } : undefined

    it('setErrors survive validate while the value is unchanged', () => {
      const f = new Field('email', [tooShort], 'a@b.c')
      f.setErrors([{ message: 'already registered' }])
      expect(f.validate()).toEqual([{ message: 'already registered' }])
      expect(f.errors).toEqual([{ message: 'already registered' }])
    })

    it('setErrors are listed before validator errors while the value is unchanged', () => {
      const f = new Field('email', [tooShort], 'ab')
      f.setErrors([{ message: 'server' }])
      expect(f.validate()).toEqual([{ message: 'server' }, { message: 'too short' }])
    })

    it('setErrors survive validateAsync while the value is unchanged', async () => {
      const f = new Field('email', [async () => undefined], 'a@b.c')
      f.setErrors([{ message: 'server' }])
      expect(await f.validateAsync()).toEqual([{ message: 'server' }])
    })

    it('addError survives validate while the value is unchanged', () => {
      const f = new Field('email', [], 'a@b.c')
      f.addError({ message: 'server' })
      expect(f.validate()).toEqual([{ message: 'server' }])
    })

    it('a value change drops them immediately and keeps validator errors', () => {
      const f = new Field('email', [tooShort], 'ab')
      f.validate()
      f.addError({ message: 'server' })
      f.value = 'abc'
      expect(f.errors).toEqual([{ message: 'too short' }])
      expect(f.validate()).toEqual([])
    })

    it('changing the value back does not restore them', () => {
      const f = new Field('email', [], 'old')
      f.setErrors([{ message: 'server' }])
      f.value = 'new'
      f.value = 'old'
      expect(f.validate()).toEqual([])
    })

    it('assigning the same value keeps them', () => {
      const f = new Field('email', [], 'same')
      f.setErrors([{ message: 'server' }])
      f.value = 'same'
      expect(f.errors).toEqual([{ message: 'server' }])
      expect(f.validate()).toEqual([{ message: 'server' }])
    })

    it('clearErrors drops them for later validations', () => {
      const f = new Field('email', [], 'x')
      f.setErrors([{ message: 'server' }])
      f.clearErrors()
      expect(f.validate()).toEqual([])
    })

    it('setErrors replaces earlier outside errors', () => {
      const f = new Field('email', [], 'x')
      f.setErrors([{ message: 'first' }])
      f.setErrors([{ message: 'second' }])
      expect(f.validate()).toEqual([{ message: 'second' }])
    })

    it('a stale async run does not resurrect dropped outside errors', async () => {
      const f = new Field('email', [async () => undefined], 'x')
      f.setErrors([{ message: 'server' }])
      const run = f.validateAsync()
      f.value = 'y'
      expect(await run).toEqual([])
    })
  })

  it('removeValidator removes every occurrence of that validator only', () => {
    const a: Validator = () => ({ message: 'a' })
    const b: Validator = () => ({ message: 'b' })
    const f = new Field('x', [a, b, a])
    f.removeValidator(a)
    expect(f.validate()).toEqual([{ message: 'b' }])
    f.removeValidator(() => undefined)
    expect(f.validate()).toEqual([{ message: 'b' }])
  })
})
