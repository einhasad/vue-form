<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useField } from '../vue/useField'
import type { Validator } from '../headless/types'

const props = defineProps<{
  modelValue: unknown
  attribute: string
  label?: string | false
  required?: boolean
  validators?: Validator[]
}>()

const emit = defineEmits<{
  'update:modelValue': [unknown]
  blur: [unknown]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const f = useField({
  attribute: props.attribute,
  modelValue: value,
  validators: props.validators,
})

function onBlur() {
  emit('blur', value.value)
  f.onBlur()
}

const field = reactive({
  value,
  onBlur,
  invalid: f.isInvalid,
  firstError: f.firstError,
  errors: f.errors,
  status: computed<'' | 'error'>(() => (f.isInvalid.value ? 'error' : '')),
})

defineExpose({ validate: f.validate, validateAsync: f.validateAsync })
</script>

<template>
  <a-form-item
    :label="typeof label === 'string' ? label : undefined"
    :required="required"
    :validate-status="f.isInvalid.value ? 'error' : ''"
    :help="f.firstError.value?.message"
  >
    <slot :field="field" />
  </a-form-item>
</template>
