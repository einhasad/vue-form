<script lang="ts">
let idCounter = 0

function nextId(): number {
  idCounter += 1
  return idCounter
}
</script>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import { useProvideForm, useField, type Validator } from '@einhasad-vue/vue-form'

// A widget is anything that calls `useField`. Below is a complete one in
// ~30 lines — a number slider with built-in label + error.
const PrioritySlider = defineComponent({
  name: 'PrioritySlider',
  props: {
    modelValue: { type: Number, required: true },
    attribute: { type: String, required: true },
    validators: { type: Array as () => Validator[], default: () => [] },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const value = computed<number>({
      get: () => props.modelValue,
      set: (v) => emit('update:modelValue', v),
    })
    const f = useField({ attribute: props.attribute, modelValue: value, validators: props.validators })
    const id = `priority-slider-${nextId()}`
    const errorId = `${id}-error`
    return () =>
      h('div', { class: 'demo-field' }, [
        h('label', { class: 'demo-label', for: id }, `Priority (${value.value})`),
        h('input', {
          id, type: 'range', min: 1, max: 5, step: 1,
          value: value.value,
          'aria-invalid': f.isInvalid.value,
          'aria-describedby': f.firstError.value ? errorId : undefined,
          onInput: (e: Event) => (value.value = Number((e.target as HTMLInputElement).value)),
          onBlur: f.onBlur,
        }),
        f.firstError.value
          ? h('div', { id: errorId, class: 'demo-error', role: 'alert' }, f.firstError.value.message)
          : null,
      ])
  },
})

const form = useProvideForm()
const data = ref({ priority: 1 })

function check() {
  form.clearErrors()
  form.validateAll()
}
</script>

<template>
  <form
    class="demo-form"
    @submit.prevent="check"
  >
    <p
      class="ds-muted ds-small"
      style="margin: 0"
    >
      Any component that calls <code>useField</code> is a form field.
      Pass <code>attribute</code> + a <code>modelValue</code> ref;
      the surrounding <code>useProvideForm()</code> context picks it up on mount.
    </p>

    <PrioritySlider
      v-model="data.priority"
      attribute="priority"
      :validators="[(v) => Number(v) >= 3 ? undefined : { message: 'Priority must be at least 3', key: 'minPriority' }]"
    />

    <div class="demo-form__actions">
      <button
        type="submit"
        class="ds-btn ds-btn--primary ds-btn--sm"
      >
        Validate
      </button>
    </div>
  </form>
</template>
