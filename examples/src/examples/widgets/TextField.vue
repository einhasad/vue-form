<script setup lang="ts">
import { computed } from 'vue'
import { useField, type Validator } from '@einhasad/vue-form'

const props = defineProps<{
  modelValue: string
  attribute: string
  label?: string
  required?: boolean
  type?: string
  placeholder?: string
  validators?: Validator[]
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const value = computed<string>({
  get: () => props.modelValue ?? '',
  set: (v) => emit('update:modelValue', v),
})

const f = useField({
  attribute: props.attribute,
  modelValue: value,
  validators: props.validators,
})
</script>

<template>
  <div class="demo-field">
    <label
      v-if="label"
      class="demo-label"
    >
      {{ label }}<span
        v-if="required"
        class="demo-label__required"
      >*</span>
    </label>
    <input
      v-model="value"
      class="demo-input"
      :class="{ 'demo-input--error': f.isInvalid.value }"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      @blur="f.onBlur"
    >
    <div
      v-if="f.firstError.value"
      class="demo-error"
    >
      {{ f.firstError.value.message }}
    </div>
  </div>
</template>
