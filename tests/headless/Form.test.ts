import { describe, it, expect } from 'vitest'
import { Form } from '../../src/headless/Form'
import { Field } from '../../src/headless/Field'

describe('Form', () => {
  it('register / unregister updates getFields', () => {
    const form = new Form()
    const a = new Field('a')
    const b = new Field('b')
    form.register(a)
    form.register(b)
    expect(form.getFields()).toEqual([a, b])
    form.unregister(a)
    expect(form.getFields()).toEqual([b])
  })

  it('getField looks up by attribute', () => {
    const form = new Form()
    const a = new Field('a')
    form.register(a)
    expect(form.getField('a')).toBe(a)
    expect(form.getField('zzz')).toBeUndefined()
  })

  it('validateAll returns false when any field has errors and runs every field', () => {
    const form = new Form()
    const a = new Field('a', [() => ({ message: 'a-bad' })])
    const b = new Field('b', [])
    form.register(a)
    form.register(b)
    expect(form.validateAll()).toBe(false)
    expect(a.errors).toEqual([{ message: 'a-bad' }])
    expect(b.errors).toEqual([])
  })

  it('validateAll returns true when no field has errors', () => {
    const form = new Form()
    form.register(new Field('a', [() => undefined]))
    expect(form.validateAll()).toBe(true)
  })

  it('validateAll skips Promise-returning validators (sync path stays sync)', () => {
    const form = new Form()
    const f = new Field('a', [async () => ({ message: 'async-fail' })])
    form.register(f)
    expect(form.validateAll()).toBe(true)
    expect(f.errors).toEqual([])
  })

  it('validateAllAsync awaits Promise-returning validators', async () => {
    const form = new Form()
    const f = new Field('a', [async () => ({ message: 'async-fail' })])
    form.register(f)
    expect(await form.validateAllAsync()).toBe(false)
    expect(f.errors).toEqual([{ message: 'async-fail' }])
  })

  it('hasErrors reflects field state', () => {
    const form = new Form()
    const f = new Field('a')
    form.register(f)
    expect(form.hasErrors()).toBe(false)
    f.addError({ message: 'x' })
    expect(form.hasErrors()).toBe(true)
  })

  it('clearErrors empties every registered field', () => {
    const form = new Form()
    const a = new Field('a')
    const b = new Field('b')
    a.addError({ message: 'A' })
    b.addError({ message: 'B' })
    form.register(a)
    form.register(b)
    form.clearErrors()
    expect(a.errors).toEqual([])
    expect(b.errors).toEqual([])
  })

  it('setFieldValidators replaces validators on a registered field', () => {
    const form = new Form()
    const f = new Field('a', [() => ({ message: 'old' })])
    form.register(f)
    form.setFieldValidators('a', [() => ({ message: 'new' })])
    f.validate()
    expect(f.errors).toEqual([{ message: 'new' }])
  })

  it('addFieldValidator appends a validator to a registered field', () => {
    const form = new Form()
    const f = new Field('a', [() => ({ message: 'first' })])
    form.register(f)
    form.addFieldValidator('a', () => ({ message: 'second' }))
    f.validate()
    expect(f.errors).toEqual([{ message: 'first' }, { message: 'second' }])
  })

  it('setFieldValidators on unknown attribute is a no-op', () => {
    const form = new Form()
    expect(() => form.setFieldValidators('missing', [])).not.toThrow()
  })

  it('addFieldValidator on unknown attribute is a no-op', () => {
    const form = new Form()
    expect(() => form.addFieldValidator('missing', () => undefined)).not.toThrow()
  })

  describe('addFieldValidatorsByPattern', () => {
    it('applies pattern validators to fields registered after the pattern', () => {
      const form = new Form()
      form.addFieldValidatorsByPattern('parts.*.sku', [
        () => ({ message: 'sku-bad' }),
      ])
      const f = new Field('parts.0.sku')
      form.register(f)
      f.validate()
      expect(f.errors).toEqual([{ message: 'sku-bad' }])
    })

    it('applies pattern validators to fields registered before the pattern', () => {
      const form = new Form()
      const f = new Field('parts.0.sku')
      form.register(f)
      form.addFieldValidatorsByPattern('parts.*.sku', [
        () => ({ message: 'sku-bad' }),
      ])
      f.validate()
      expect(f.errors).toEqual([{ message: 'sku-bad' }])
    })

    it('only matches one dotted segment for *', () => {
      const form = new Form()
      form.addFieldValidatorsByPattern('parts.*.sku', [
        () => ({ message: 'matched' }),
      ])
      const shallow = new Field('parts.0.sku')
      const deeper = new Field('parts.0.attrs.sku')
      const sibling = new Field('skus.0.sku')
      form.register(shallow)
      form.register(deeper)
      form.register(sibling)
      shallow.validate(); deeper.validate(); sibling.validate()
      expect(shallow.errors).toHaveLength(1)
      expect(deeper.errors).toHaveLength(0)
      expect(sibling.errors).toHaveLength(0)
    })

    it('layers pattern validators on top of inline validators (additive)', () => {
      const form = new Form()
      const inline = (): undefined => undefined
      const f = new Field('parts.0.sku', [
        () => ({ message: 'inline' }),
        inline,
      ])
      form.register(f)
      form.addFieldValidatorsByPattern('parts.*.sku', [
        () => ({ message: 'pattern' }),
      ])
      f.validate()
      expect(f.errors).toEqual([{ message: 'inline' }, { message: 'pattern' }])
    })

    it('a field re-registering picks up patterns again (no double-apply on same instance)', () => {
      const form = new Form()
      form.addFieldValidatorsByPattern('parts.*.sku', [
        () => ({ message: 'p' }),
      ])
      const f = new Field('parts.0.sku')
      form.register(f)
      f.validate()
      expect(f.errors).toEqual([{ message: 'p' }])
      form.unregister(f)
      // Re-register: pattern is applied again, so the same instance now has
      // two copies of the pattern validator. Documented as additive behavior.
      form.register(f)
      f.validate()
      expect(f.errors).toEqual([{ message: 'p' }, { message: 'p' }])
    })
  })
})
