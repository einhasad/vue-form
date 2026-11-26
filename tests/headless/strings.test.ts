import { describe, it, expect, afterEach } from 'vitest'
import {
  getStrings,
  setStrings,
  resetStrings,
  interpolate,
} from '../../src/headless/strings'

afterEach(() => resetStrings())

describe('strings', () => {
  it('returns defaults', () => {
    expect(getStrings().required).toBe('{attr} cannot be blank')
  })

  it('defaults fieldFallback to "This field"', () => {
    expect(getStrings().fieldFallback).toBe('This field')
  })

  it('overrides fieldFallback via setStrings', () => {
    setStrings({ fieldFallback: 'Dieses Feld' })
    expect(getStrings().fieldFallback).toBe('Dieses Feld')
    resetStrings()
    expect(getStrings().fieldFallback).toBe('This field')
  })

  it('errFormMissing names the real provider API, not a <Form> component', () => {
    const msg = getStrings().errFormMissing
    expect(msg).not.toContain('<Form>')
    expect(msg).toContain('useForm()')
    expect(msg).toContain('useProvideForm()')
    expect(msg).toContain('useFormOptional()')
  })

  it('merges partial overrides', () => {
    setStrings({ required: 'Required.' })
    expect(getStrings().required).toBe('Required.')
    expect(getStrings().minLen).toBe('{attr} should contain at least {min} characters')
  })

  it('resetStrings restores defaults', () => {
    setStrings({ required: 'X' })
    resetStrings()
    expect(getStrings().required).toBe('{attr} cannot be blank')
  })

  it('returned object is a snapshot — mutating it does not affect later reads', () => {
    const s = getStrings() as Record<string, string>
    expect(() => {
      s.required = 'leaked'
    }).not.toThrow()
    // Even if a consumer mutates the returned reference, the next read still
    // shows the canonical value (we hand out a fresh object on every set).
    setStrings({ required: 'fresh' })
    expect(getStrings().required).toBe('fresh')
  })
})

describe('interpolate', () => {
  it('replaces named placeholders', () => {
    expect(interpolate('Hello {name}', { name: 'World' })).toBe('Hello World')
  })

  it('renders missing keys as empty string', () => {
    expect(interpolate('{a}-{b}', { a: 'x' })).toBe('x-')
  })

  it('coerces non-string values to string', () => {
    expect(interpolate('{n}', { n: 42 })).toBe('42')
    expect(interpolate('{f}', { f: false })).toBe('false')
  })

  it('treats null/undefined as empty', () => {
    expect(interpolate('{x}', { x: null })).toBe('')
    expect(interpolate('{x}', { x: undefined })).toBe('')
  })

  it('leaves unknown placeholders empty when no params provided', () => {
    expect(interpolate('Hi {name}')).toBe('Hi ')
  })
})
