import { describe, it, expect } from 'vitest'
import { defineComponent, h, ref, type Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useProvideForm, type FormContext } from '../../src/vue/useForm'
import * as rules from '../../src/headless/rules'
import FormField from '../../src/ant-design/FormField.vue'

const stubs = {
  'a-form-item': {
    name: 'AFormItem',
    props: ['label', 'required', 'validateStatus', 'help'],
    template: `<div
      class="afi"
      :data-label="label ?? ''"
      :data-required="required ? '1' : '0'"
      :data-status="validateStatus"
      :data-help="help ?? ''"
    ><slot /></div>`,
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
    expect(item.attributes('data-help')).toBe('')

    expect(ctxHolder.ctx.validateAll()).toBe(false)
    await wrapper.vm.$nextTick()
    expect(item.attributes('data-status')).toBe('error')
    expect(item.attributes('data-help')).toBe('Email cannot be blank')
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
})
