import { computed, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { Field } from '../headless/Field'
import type { FieldError, FieldHandle, Validator } from '../headless/types'
import { useForm } from './useForm'

export interface UseFieldOptions {
  attribute: string
  modelValue: Ref<unknown>
  validators?: Validator[]
}

export function useField(opts: UseFieldOptions) {
  const formCtx = useForm()
  const errors = ref<FieldError[]>([])

  const field = new Field(
    opts.attribute,
    opts.validators ?? [],
    opts.modelValue.value,
  )

  const sync = () => {
    errors.value = [...field.errors]
  }

  // Mirror the Vue model into the headless field. If errors are already shown,
  // re-validate inline so the user sees them clear/update as they type.
  watch(opts.modelValue, (v) => {
    field.value = v
    if (errors.value.length) {
      field.validate()
      sync()
    }
  })

  const validate = (): FieldError[] => {
    field.validate()
    sync()
    return errors.value
  }

  const validateAsync = async (): Promise<FieldError[]> => {
    await field.validateAsync()
    sync()
    return errors.value
  }

  // Adapter handle — the form holds this and uses it for validateAll, etc.
  // Wrapping mutations through sync() keeps the local Vue ref reactive.
  const handle: FieldHandle = {
    attribute: field.attribute,
    get errors() {
      return field.errors
    },
    validate: () => {
      field.validate()
      sync()
      return field.errors
    },
    validateAsync: async () => {
      await field.validateAsync()
      sync()
      return field.errors
    },
    setValidators: (vs) => field.setValidators(vs),
    addValidator: (v) => field.addValidator(v),
    setErrors: (es) => {
      field.setErrors(es)
      sync()
    },
    addError: (e) => {
      field.addError(e)
      sync()
    },
    clearErrors: () => {
      field.clearErrors()
      sync()
    },
  }

  onMounted(() => formCtx.register(handle))
  onUnmounted(() => formCtx.unregister(handle))

  return {
    errors,
    isInvalid: computed(() => errors.value.length > 0),
    firstError: computed<FieldError | undefined>(() => errors.value[0]),
    validate,
    validateAsync,
    onBlur: () => validate(),
  }
}
