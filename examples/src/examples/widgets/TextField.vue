<script lang="ts">
let idCounter = 0

function nextId(): number {
  idCounter += 1
  return idCounter
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useField, type Validator } from '@einhasad-vue/vue-form'

const props = defineProps<{
  modelValue: string
  attribute: string
  label?: string
  ariaLabel?: string
  required?: boolean
  type?: string
  placeholder?: string
  validators?: Validator[]
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const inputId = `text-field-${nextId()}`
const errorId = `${inputId}-error`

const value = computed<string>({
  get: () => props.modelValue ?? '',
  set: (v) => emit('update:modelValue', v),
})

const f = useField({
  attribute: props.attribute,
  modelValue: value,
  validators: props.validators,
})

function onInput(event: Event) {
  value.value = (event.target as HTMLInputElement).value
}
</script>

<template>
  <div class="demo-field">
    <label
      v-if="label"
      class="demo-label"
      :for="inputId"
    >
      {{ label }}<span
        v-if="required"
        class="demo-label__required"
        aria-hidden="true"
      >*</span>
    </label>
    <input
      :id="inputId"
      :value="value"
      class="demo-input"
      :class="{ 'demo-input--error': f.isInvalid.value }"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :aria-label="label ? undefined : ariaLabel"
      :aria-required="required || undefined"
      :aria-invalid="f.isInvalid.value"
      :aria-describedby="f.firstError.value ? errorId : undefined"
      @input="onInput"
      @blur="f.onBlur"
    >
    <div
      v-if="f.firstError.value"
      :id="errorId"
      class="demo-error"
      role="alert"
    >
      {{ f.firstError.value.message }}
    </div>
  </div>
</template>
