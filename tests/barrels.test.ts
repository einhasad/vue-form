import { describe, it, expect } from 'vitest'
import * as main from '../src/index'
import * as headless from '../src/headless/index'
import * as antd from '../src/ant-design/index'

describe('public barrels', () => {
  it('main barrel re-exports composables, strings helpers, and rules', () => {
    expect(typeof main.useForm).toBe('function')
    expect(typeof main.useProvideForm).toBe('function')
    expect(typeof main.useField).toBe('function')
    expect(typeof main.setStrings).toBe('function')
    expect(typeof main.getStrings).toBe('function')
    expect(typeof main.resetStrings).toBe('function')
    expect(typeof main.interpolate).toBe('function')
    expect(typeof main.rules).toBe('object')
    expect(typeof main.rules.required).toBe('function')
    expect(typeof main.rules.email).toBe('function')
  })

  it('headless barrel re-exports the headless classes, rules, and strings helpers', () => {
    expect(typeof headless.Form).toBe('function')
    expect(typeof headless.Field).toBe('function')
    expect(typeof headless.rules).toBe('object')
    expect(typeof headless.rules.minLen).toBe('function')
    expect(typeof headless.setStrings).toBe('function')
    expect(typeof headless.getStrings).toBe('function')
    expect(typeof headless.resetStrings).toBe('function')
    expect(typeof headless.interpolate).toBe('function')
  })

  it('ant-design barrel re-exports FormField', () => {
    expect(antd.FormField).toBeTruthy()
  })
})
