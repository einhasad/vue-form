import { computed, onMounted, onUnmounted, ref, watch, type ComputedRef, type Ref } from 'vue'
import { Field } from '../headless/Field'
import type { FieldError, FieldHandle, Validator } from '../headless/types'
import { useFormOptional } from './useForm'

export interface UseFieldOptions {
  attribute: string
  modelValue: Ref<unknown>
  validators?: Validator[]
}

export interface UseFieldReturn {
  errors: Ref<FieldError[]>
  isInvalid: ComputedRef<boolean>
  firstError: ComputedRef<FieldError | undefined>
  validate: () => FieldError[]
  validateAsync: () => Promise<FieldError[]>
  onBlur: () => FieldError[]
}

export function useField(opts: UseFieldOptions): UseFieldReturn {
  const formCtx = useFormOptional()
  const errors = ref<FieldError[]>([])

  const field = new Field(
    opts.attribute,
    opts.validators ?? [],
    opts.modelValue.value,
  )

  const sync = () => {
    errors.value = [...field.errors]
  }

  // The watcher below runs after the current tick, so code that changes the
  // model and validates in the same tick would see the old value without this.
  const pullModel = () => {
    field.value = opts.modelValue.value
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
    pullModel()
    field.validate()
    sync()
    return errors.value
  }

  const validateAsync = async (): Promise<FieldError[]> => {
    pullModel()
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
      validate()
      return field.errors
    },
    validateAsync: async () => {
      await validateAsync()
      return field.errors
    },
    setValidators: (vs) => field.setValidators(vs),
    addValidator: (v) => field.addValidator(v),
    removeValidator: (v) => field.removeValidator(v),
    setErrors: (es) => {
      pullModel()
      field.setErrors(es)
      sync()
    },
    addError: (e) => {
      pullModel()
      field.addError(e)
      sync()
    },
    clearErrors: () => {
      field.clearErrors()
      sync()
    },
  }

  // Without a form the field still validates locally; it just isn't registered.
  if (formCtx) {
    onMounted(() => formCtx.register(handle))
    onUnmounted(() => formCtx.unregister(handle))
  }

  return {
    errors,
    isInvalid: computed(() => errors.value.length > 0),
    firstError: computed<FieldError | undefined>(() => errors.value[0]),
    validate,
    validateAsync,
    onBlur: () => validate(),
  }
}
