<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import { useField, useFormOptional, rules, type FieldError } from '@einhasad-vue/vue-form'

// A widget that works inside a form AND on its own. useFormOptional() never
// throws; useField() without a form validates locally and skips registration.
const EmailInput = defineComponent({
  name: 'EmailInput',
  props: {
    modelValue: { type: String, required: true },
    attribute: { type: String, required: true },
    inputId: { type: String, required: true },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, expose }) {
    const value = computed<string>({
      get: () => props.modelValue,
      set: (v) => emit('update:modelValue', v),
    })
    const insideForm = useFormOptional() !== undefined
    const f = useField({
      attribute: props.attribute,
      modelValue: value,
      validators: [rules.required('Email'), rules.email('Email')],
    })
    expose({ validate: f.validate })

    const errorId = `${props.inputId}-error`
    return () =>
      h('div', { class: 'demo-field' }, [
        h('label', { class: 'demo-label', for: props.inputId }, 'Newsletter email'),
        h('input', {
          id: props.inputId,
          class: ['demo-input', { 'demo-input--error': f.isInvalid.value }],
          type: 'email',
          value: value.value,
          'aria-invalid': f.isInvalid.value,
          'aria-describedby': f.firstError.value ? errorId : undefined,
          onInput: (e: Event) => (value.value = (e.target as HTMLInputElement).value),
          onBlur: f.onBlur,
        }),
        f.firstError.value
          ? h('div', { id: errorId, class: 'demo-error', role: 'alert' }, f.firstError.value.message)
          : null,
        h('p', { class: 'ds-muted ds-small', style: 'margin: 4px 0 0' },
          insideForm ? 'Registered with the surrounding form.' : 'Standalone: no form provided, validates locally.'),
      ])
  },
})

const email = ref('')
const emailInput = ref<{ validate: () => FieldError[] } | null>(null)
const result = ref('')

function subscribe() {
  const errors = emailInput.value?.validate() ?? []
  result.value = errors.length ? '' : `Subscribed ${email.value}`
}
</script>

<template>
  <form
    class="demo-form"
    novalidate
    @submit.prevent="subscribe"
  >
    <EmailInput
      ref="emailInput"
      v-model="email"
      attribute="newsletterEmail"
      input-id="standalone-newsletter-email"
    />

    <div class="demo-form__actions">
      <button
        type="submit"
        class="ds-btn ds-btn--primary ds-btn--sm"
      >
        Subscribe
      </button>
    </div>
    <p
      class="ds-small"
      role="status"
      style="margin: 0"
    >
      {{ result }}
    </p>
  </form>
</template>
