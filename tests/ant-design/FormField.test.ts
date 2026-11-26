import { describe, it, expect } from 'vitest'
import { defineComponent, h, nextTick, ref, type Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { FormItem, Input } from 'ant-design-vue'
import { useProvideForm, type FormContext } from '../../src/vue/useForm'
import * as rules from '../../src/headless/rules'
import FormField from '../../src/ant-design/FormField.vue'
import type { FormFieldBinding } from '../../src/ant-design/types'

const stubs = {
  'a-form-item': {
    name: 'AFormItem',
    props: ['label', 'htmlFor', 'required', 'validateStatus'],
    template: `<div
      class="afi"
      :data-label="label ?? ''"
      :data-for="htmlFor ?? ''"
      :data-required="required ? '1' : '0'"
      :data-status="validateStatus"
    ><slot /><div class="help" role="alert"><slot name="help" /></div></div>`,
  },
}

function mountWithForm(setup: (ctx: { ctx: FormContext }) => unknown) {
  const ctxHolder: { ctx: FormContext } = { ctx: undefined as unknown as FormContext }
  const Parent = defineComponent({
    setup() {
      ctxHolder.ctx = useProvideForm()
      return setup(ctxHolder) as () => unknown
    },
  })
  const wrapper = mount(Parent, { global: { stubs } })
  return { wrapper, ctxHolder }
}

describe('ant-design FormField', () => {
  it('renders label/required/help via the a-form-item stub and exposes a reactive field via slot', async () => {
    const value: Ref<string> = ref('')
    const { wrapper, ctxHolder } = mountWithForm(() => () =>
      h(
        FormField,
        {
          modelValue: value.value,
          'onUpdate:modelValue': (v: unknown) => (value.value = v as string),
          attribute: 'email',
          label: 'Email',
          required: true,
          validators: [rules.required('Email'), rules.email('Email')],
        },
        {
          default: ({ field }: { field: { value: string; status: string; invalid: boolean } }) =>
            h('input', {
              class: 'in',
              value: field.value,
              'data-status': field.status,
              'data-invalid': field.invalid ? '1' : '0',
            }),
        },
      ),
    )

    const item = wrapper.find('.afi')
    expect(item.attributes('data-label')).toBe('Email')
    expect(item.attributes('data-required')).toBe('1')
    expect(item.attributes('data-status')).toBe('')
    expect(wrapper.find('.help').text()).toBe('')

    expect(ctxHolder.ctx.validateAll()).toBe(false)
    await wrapper.vm.$nextTick()
    expect(item.attributes('data-status')).toBe('error')
    expect(wrapper.find('.help').text()).toBe('Email cannot be blank')
    expect(wrapper.find('.in').attributes('data-invalid')).toBe('1')
  })

  it('label=false renders no label string and required omitted defaults to false', () => {
    const { wrapper } = mountWithForm(() => () =>
      h(FormField, { modelValue: '', attribute: 'a', label: false }),
    )
    const item = wrapper.find('.afi')
    expect(item.attributes('data-label')).toBe('')
    expect(item.attributes('data-required')).toBe('0')
  })

  it('emits update:modelValue when slot writes through field.value, and emits blur on field.onBlur', async () => {
    const updates: unknown[] = []
    const blurs: unknown[] = []
    let slotField!: { value: unknown; onBlur: () => void }

    const { wrapper } = mountWithForm(() => () =>
      h(
        FormField,
        {
          modelValue: 'hi',
          attribute: 'a',
          'onUpdate:modelValue': (v: unknown) => updates.push(v),
          onBlur: (v: unknown) => blurs.push(v),
        },
        {
          default: ({ field }: { field: { value: unknown; onBlur: () => void } }) => {
            slotField = field
            return h('input')
          },
        },
      ),
    )

    expect(slotField.value).toBe('hi')
    slotField.value = 'changed'
    await wrapper.vm.$nextTick()
    expect(updates).toEqual(['changed'])

    slotField.onBlur()
    expect(blurs).toEqual(['hi'])
  })

  it('exposes validate / validateAsync via defineExpose', async () => {
    const { wrapper } = mountWithForm(() => () =>
      h(FormField, {
        ref: 'ff',
        modelValue: '',
        attribute: 'a',
        validators: [rules.required('A')],
      }),
    )
    const ref_ = wrapper.findComponent(FormField)
    const errs = (ref_.vm as unknown as { validate: () => unknown[] }).validate()
    expect(errs).toHaveLength(1)
    const errsAsync = await (ref_.vm as unknown as {
      validateAsync: () => Promise<unknown[]>
    }).validateAsync()
    expect(errsAsync).toHaveLength(1)
  })

  it('links the label to the slotted control through field.id', () => {
    let slotField!: FormFieldBinding
    const { wrapper } = mountWithForm(() => () =>
      h(FormField, { modelValue: '', attribute: 'email', label: 'Email' }, {
        default: ({ field }: { field: FormFieldBinding }) => {
          slotField = field
          return h('input', { class: 'in', id: field.id })
        },
      }),
    )
    expect(slotField.id).toMatch(/^vf-email-[A-Za-z0-9_-]+$/)
    expect(wrapper.find('.afi').attributes('data-for')).toBe(slotField.id)
    expect(wrapper.find('.in').attributes('id')).toBe(slotField.id)
  })

  it('gives every instance a unique, attribute-safe id', () => {
    const ids: string[] = []
    const collect = ({ field }: { field: FormFieldBinding }) => {
      ids.push(field.id)
      return h('input')
    }
    mountWithForm(() => () => [
      h(FormField, { modelValue: '', attribute: 'parts[0].name' }, { default: collect }),
      h(FormField, { modelValue: '', attribute: 'parts[0].name' }, { default: collect }),
    ])
    expect(ids).toHaveLength(2)
    expect(ids[0]).not.toBe(ids[1])
    for (const id of ids) expect(id).toMatch(/^vf-parts_0__name-[A-Za-z0-9_-]+$/)
  })

  it('exposes errorId only while an error is shown, and the help element carries that id', async () => {
    const value = ref('')
    let slotField!: FormFieldBinding
    const { wrapper, ctxHolder } = mountWithForm(() => () =>
      h(
        FormField,
        {
          modelValue: value.value,
          'onUpdate:modelValue': (v: unknown) => (value.value = v as string),
          attribute: 'email',
          validators: [rules.required('Email')],
        },
        {
          default: ({ field }: { field: FormFieldBinding }) => {
            slotField = field
            return h('input', {
              class: 'in',
              id: field.id,
              'aria-invalid': field.invalid,
              'aria-describedby': field.errorId,
            })
          },
        },
      ),
    )
    expect(slotField.errorId).toBeUndefined()
    expect(wrapper.find('.in').attributes('aria-describedby')).toBeUndefined()
    expect(wrapper.find('.in').attributes('aria-invalid')).toBe('false')

    ctxHolder.ctx.validateAll()
    await nextTick()
    expect(slotField.errorId).toBe(`${slotField.id}-error`)
    const input = wrapper.find('.in')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(slotField.errorId)
    const message = wrapper.find(`[id="${slotField.errorId}"]`)
    expect(message.text()).toBe('Email cannot be blank')

    value.value = 'a@b.co'
    await nextTick()
    await nextTick()
    expect(slotField.errorId).toBeUndefined()
    expect(wrapper.find('.help').text()).toBe('')
  })

  it('with real ant-design-vue, the label for= hits the input and the error id sits inside role=alert', async () => {
    window.matchMedia ??= (query: string) =>
      ({
        matches: false,
        media: query,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList
    let slotField!: FormFieldBinding
    const Parent = defineComponent({
      setup() {
        const ctx = useProvideForm()
        const value = ref('')
        return { ctx, value }
      },
      render() {
        return h(
          FormField,
          {
            modelValue: this.value,
            'onUpdate:modelValue': (v: unknown) => (this.value = v as string),
            attribute: 'email',
            label: 'Email',
            validators: [rules.required('Email')],
          },
          {
            default: ({ field }: { field: FormFieldBinding }) => {
              slotField = field
              return h(Input, {
                value: field.value as string,
                id: field.id,
                'aria-invalid': field.invalid,
                'aria-describedby': field.errorId,
              })
            },
          },
        )
      },
    })
    const wrapper = mount(Parent, {
      global: { components: { AFormItem: FormItem } },
      attachTo: document.body,
    })

    const label = wrapper.find('label')
    expect(label.text()).toBe('Email')
    expect(label.attributes('for')).toBe(slotField.id)
    expect(wrapper.find('input').attributes('id')).toBe(slotField.id)

    wrapper.vm.ctx.validateAll()
    await nextTick()
    await nextTick()
    const message = document.getElementById(slotField.errorId!)
    expect(message?.textContent).toBe('Email cannot be blank')
    expect(message?.closest('[role="alert"]')).not.toBeNull()
    expect(wrapper.find('input').attributes('aria-describedby')).toBe(slotField.errorId)
    wrapper.unmount()
  })
})
