<script lang="ts">
import * as Vue from 'vue'

// Fallback for Vue < 3.5 only: shared by every app and SSR request in the
// process, so server and client ids can differ. Vue >= 3.5 uses useId().
let fallbackIdCounter = 0

// Reflect.get hides the lookup from bundlers: static member access to useId makes
// webpack fail on Vue 3.3/3.4, which do not export it.
function uniqueSuffix(): string {
  const vueUseId = Reflect.get(Vue, 'useId') as (() => string) | undefined
  return vueUseId ? vueUseId() : String(++fallbackIdCounter)
}

function createFieldId(attribute: string): string {
  return `vf-${attribute}-${uniqueSuffix()}`.replace(/[^A-Za-z0-9_-]/g, '_')
}
</script>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useField } from '../vue/useField'
import type { Validator } from '../headless/types'
import type { FormFieldBinding, FormFieldSlotProps } from './types'

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

defineSlots<{
  default?(props: FormFieldSlotProps): unknown
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

const id = createFieldId(props.attribute)
const errorId = computed(() => (f.isInvalid.value ? `${id}-error` : undefined))

function onBlur() {
  emit('blur', value.value)
  f.onBlur()
}

const field: FormFieldBinding = reactive({
  value,
  onBlur,
  invalid: f.isInvalid,
  firstError: f.firstError,
  errors: f.errors,
  status: computed<'' | 'error'>(() => (f.isInvalid.value ? 'error' : '')),
  id,
  errorId,
})

defineExpose({ validate: f.validate, validateAsync: f.validateAsync })
</script>

<template>
  <a-form-item
    :label="typeof label === 'string' ? label : undefined"
    :html-for="id"
    :required="required"
    :validate-status="f.isInvalid.value ? 'error' : ''"
  >
    <slot :field="field" />
    <template v-if="f.firstError.value" #help>
      <span :id="errorId">{{ f.firstError.value.message }}</span>
    </template>
  </a-form-item>
</template>
