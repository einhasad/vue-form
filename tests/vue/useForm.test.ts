import { describe, it, expect } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useProvideForm, useForm, type FormContext } from '../../src/vue/useForm'
import { useField } from '../../src/vue/useField'
import * as rules from '../../src/headless/rules'

function withForm(child: ReturnType<typeof defineComponent>): {
  ctx: FormContext
  wrapper: ReturnType<typeof mount>
} {
  let ctx!: FormContext
  const Parent = defineComponent({
    setup() {
      ctx = useProvideForm()
      return () => h(child)
    },
  })
  const wrapper = mount(Parent)
  return { ctx, wrapper }
}

describe('useForm', () => {
  it('throws when called outside <Form>', () => {
    const Inner = defineComponent({
      setup() {
        useForm()
        return () => null
      },
    })
    expect(() => mount(Inner)).toThrow(/useForm/)
  })

  it('useProvideForm returns a usable context', () => {
    const Probe = defineComponent({
      setup() {
        return () => null
      },
    })
    const { ctx } = withForm(Probe)
    expect(ctx.fields.value).toEqual([])
    expect(ctx.hasErrors()).toBe(false)
    expect(ctx.formErrors.value).toEqual([])
    expect(ctx.loading.value).toBe(false)
  })
})

describe('useField (mounted under a form)', () => {
  it('registers on mount and unregisters on unmount', () => {
    const Inner = defineComponent({
      setup() {
        const m = ref('')
        useField({ attribute: 'name', modelValue: m })
        return () => h('input')
      },
    })
    const { ctx, wrapper } = withForm(Inner)
    expect(ctx.getField('name')).toBeTruthy()
    expect(ctx.fields.value).toHaveLength(1)
    wrapper.unmount()
    expect(ctx.fields.value).toHaveLength(0)
  })

  it('validateAll triggers field validation and surfaces errors', () => {
    const Inner = defineComponent({
      setup() {
        const m = ref('')
        useField({
          attribute: 'name',
          modelValue: m,
          validators: [rules.required('Name')],
        })
        return () => h('input')
      },
    })
    const { ctx } = withForm(Inner)
    expect(ctx.validateAll()).toBe(false)
    expect(ctx.getField('name')!.errors[0].message).toBe('Name cannot be blank')
  })

  it('updating modelValue while errors are shown re-validates inline', async () => {
    const m = ref('')
    const Inner = defineComponent({
      setup() {
        useField({
          attribute: 'name',
          modelValue: m,
          validators: [rules.required('Name')],
        })
        return () => h('input')
      },
    })
    const { ctx } = withForm(Inner)
    ctx.validateAll()
    expect(ctx.getField('name')!.errors).toHaveLength(1)
    m.value = 'filled'
    await new Promise((r) => setTimeout(r, 0))
    expect(ctx.getField('name')!.errors).toEqual([])
  })

  it('setFieldValidators replaces validators on a registered field', () => {
    const Inner = defineComponent({
      setup() {
        const m = ref('x')
        useField({ attribute: 'a', modelValue: m })
        return () => null
      },
    })
    const { ctx } = withForm(Inner)
    ctx.setFieldValidators('a', [rules.required('A')])
    expect(ctx.validateAll()).toBe(true)
    ctx.setFieldValidators('a', [() => ({ message: 'always-fail' })])
    expect(ctx.validateAll()).toBe(false)
    expect(ctx.getField('a')!.errors).toEqual([{ message: 'always-fail' }])
  })

  it('addFieldValidator appends a validator to a registered field', () => {
    const Inner = defineComponent({
      setup() {
        const m = ref('xy')
        useField({
          attribute: 'a',
          modelValue: m,
          validators: [rules.minLen(3, 'A')],
        })
        return () => null
      },
    })
    const { ctx } = withForm(Inner)
    ctx.validateAll()
    expect(ctx.getField('a')!.errors).toHaveLength(1)
    ctx.addFieldValidator('a', () => ({ message: 'extra' }))
    ctx.validateAll()
    expect(ctx.getField('a')!.errors).toHaveLength(2)
  })

  it('validateAllAsync awaits Promise-returning validators', async () => {
    const Inner = defineComponent({
      setup() {
        const m = ref('taken')
        useField({
          attribute: 'a',
          modelValue: m,
          validators: [
            async (v) => (v === 'taken' ? { message: 'busy' } : undefined),
          ],
        })
        return () => null
      },
    })
    const { ctx } = withForm(Inner)
    expect(await ctx.validateAllAsync()).toBe(false)
    expect(ctx.getField('a')!.errors).toEqual([{ message: 'busy' }])
  })

  it('setFieldErrors attaches errors to a specific field (consumer-driven)', () => {
    const Inner = defineComponent({
      setup() {
        const m = ref('')
        useField({ attribute: 'a', modelValue: m })
        return () => null
      },
    })
    const { ctx } = withForm(Inner)
    ctx.setFieldErrors('a', [{ message: 'server says no' }])
    expect(ctx.getField('a')!.errors).toEqual([{ message: 'server says no' }])
    expect(ctx.hasErrors()).toBe(true)
  })

  it('useField return value: validate / validateAsync / onBlur / firstError / isInvalid', async () => {
    let api!: ReturnType<typeof useField>
    const Inner = defineComponent({
      setup() {
        const m = ref('')
        api = useField({
          attribute: 'a',
          modelValue: m,
          validators: [
            rules.required('A'),
            async (v) => (v === '' ? { message: 'async-bad', key: 'async' } : undefined),
          ],
        })
        return () => null
      },
    })
    withForm(Inner)
    expect(api.isInvalid.value).toBe(false)
    expect(api.firstError.value).toBeUndefined()
    const sync = api.validate()
    expect(sync[0].message).toBe('A cannot be blank')
    expect(api.isInvalid.value).toBe(true)
    expect(api.firstError.value?.message).toBe('A cannot be blank')
    api.onBlur()
    expect(api.errors.value[0].message).toBe('A cannot be blank')
    const async_ = await api.validateAsync()
    expect(async_.map((e) => e.key)).toEqual(['required', 'async'])
  })

  it('handle.addError / handle.setErrors update local Vue errors reactively', () => {
    let api!: ReturnType<typeof useField>
    const Inner = defineComponent({
      setup() {
        const m = ref('')
        api = useField({ attribute: 'a', modelValue: m })
        return () => null
      },
    })
    const { ctx } = withForm(Inner)
    const handle = ctx.getField('a')!
    handle.addError({ message: 'one' })
    expect(api.errors.value).toEqual([{ message: 'one' }])
    handle.setErrors([{ message: 'two' }])
    expect(api.errors.value).toEqual([{ message: 'two' }])
    handle.clearErrors()
    expect(api.errors.value).toEqual([])
  })

  it('addFieldValidatorsByPattern propagates through the context', () => {
    const Inner = defineComponent({
      setup() {
        const m = ref('')
        useField({ attribute: 'parts.0.sku', modelValue: m })
        return () => null
      },
    })
    const { ctx } = withForm(Inner)
    ctx.addFieldValidatorsByPattern('parts.*.sku', [() => ({ message: 'pat' })])
    expect(ctx.validateAll()).toBe(false)
    expect(ctx.getField('parts.0.sku')!.errors).toEqual([{ message: 'pat' }])
  })

  it('setFormErrors writes form-level errors', () => {
    const Probe = defineComponent({ setup() { return () => null } })
    const { ctx } = withForm(Probe)
    ctx.setFormErrors([{ message: 'top' }])
    expect(ctx.formErrors.value).toEqual([{ message: 'top' }])
  })

  it('clearErrors empties fields and form-level errors', () => {
    const Inner = defineComponent({
      setup() {
        const m = ref('')
        useField({
          attribute: 'a',
          modelValue: m,
          validators: [rules.required()],
        })
        return () => null
      },
    })
    const { ctx } = withForm(Inner)
    ctx.validateAll()
    ctx.formErrors.value = [{ message: 'top-level' }]
    expect(ctx.hasErrors()).toBe(true)
    ctx.clearErrors()
    expect(ctx.hasErrors()).toBe(false)
    expect(ctx.formErrors.value).toEqual([])
  })
})
