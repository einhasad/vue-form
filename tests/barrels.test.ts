import { describe, it, expect, expectTypeOf } from 'vitest'
import * as main from '../src/index'
import * as headless from '../src/headless/index'
import * as antd from '../src/ant-design/index'
import type {
  FieldError,
  FieldHandle,
  FormContext,
  Strings,
  SyncValidator,
  UseFieldOptions,
  UseFieldReturn,
  Validator,
} from '../src/index'
import type {
  FieldError as HeadlessFieldError,
  FieldHandle as HeadlessFieldHandle,
  Strings as HeadlessStrings,
  SyncValidator as HeadlessSyncValidator,
  Validator as HeadlessValidator,
} from '../src/headless/index'
import type { FormFieldBinding, FormFieldSlotProps } from '../src/ant-design/index'

describe('public barrels', () => {
  it('main barrel exports exactly the documented runtime values', () => {
    expect(Object.keys(main).sort()).toEqual([
      'getStrings',
      'interpolate',
      'resetStrings',
      'rules',
      'setStrings',
      'useField',
      'useForm',
      'useFormOptional',
      'useProvideForm',
    ])
  })

  it('main barrel re-exports composables, strings helpers, and rules', () => {
    expect(typeof main.useForm).toBe('function')
    expect(typeof main.useFormOptional).toBe('function')
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

  it('headless barrel exports exactly the documented runtime values', () => {
    expect(Object.keys(headless).sort()).toEqual([
      'Field',
      'Form',
      'getStrings',
      'interpolate',
      'resetStrings',
      'rules',
      'setStrings',
    ])
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

  it('main and headless barrels share the same rules namespace', () => {
    expect(Object.keys(main.rules).sort()).toEqual(Object.keys(headless.rules).sort())
  })

  it('ant-design barrel exports exactly FormField at runtime', () => {
    expect(Object.keys(antd)).toEqual(['FormField'])
    expect(antd.FormField).toBeTruthy()
  })

  it('main barrel exports the public types', () => {
    expectTypeOf(main.rules.required()).toEqualTypeOf<SyncValidator>()
    expectTypeOf<SyncValidator>().toMatchTypeOf<Validator>()
    expectTypeOf(main.useField).returns.toEqualTypeOf<UseFieldReturn>()
    expectTypeOf(main.useField).parameter(0).toEqualTypeOf<UseFieldOptions>()
    expectTypeOf(main.useProvideForm).returns.toEqualTypeOf<FormContext>()
    expectTypeOf(main.getStrings).returns.toEqualTypeOf<Readonly<Strings>>()
    expectTypeOf<FormContext['getField']>().returns.toEqualTypeOf<FieldHandle | undefined>()
    expectTypeOf<FieldError>().toHaveProperty('message')
  })

  it('headless barrel exports the same public types as the main barrel', () => {
    expectTypeOf<HeadlessSyncValidator>().toEqualTypeOf<SyncValidator>()
    expectTypeOf<HeadlessValidator>().toEqualTypeOf<Validator>()
    expectTypeOf<HeadlessFieldHandle>().toEqualTypeOf<FieldHandle>()
    expectTypeOf<HeadlessFieldError>().toEqualTypeOf<FieldError>()
    expectTypeOf<HeadlessStrings>().toEqualTypeOf<Strings>()
    expectTypeOf(new headless.Field('a')).toMatchTypeOf<HeadlessFieldHandle>()
  })

  it('ant-design barrel exports the FormField slot types', () => {
    expectTypeOf<FormFieldSlotProps['field']>().toEqualTypeOf<FormFieldBinding>()
    expectTypeOf<FormFieldBinding['id']>().toEqualTypeOf<string>()
    expectTypeOf<FormFieldBinding['errorId']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<FormFieldBinding['errors']>().toEqualTypeOf<FieldError[]>()
  })
})
