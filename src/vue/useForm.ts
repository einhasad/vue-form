import { provide, inject, ref, type InjectionKey, type Ref } from 'vue'
import { Form } from '../headless/Form'
import { getStrings } from '../headless/strings'
import type { FieldError, FieldHandle, Validator } from '../headless/types'

// Module-private — never exported. Outside callers cannot bypass useForm/useProvideForm.
const FORM_KEY: InjectionKey<FormContext> = Symbol('vue-form')

export interface FormContext {
  register(h: FieldHandle): void
  unregister(h: FieldHandle): void
  getField(attribute: string): FieldHandle | undefined
  fields: Ref<FieldHandle[]>

  validateAll(): boolean
  validateAllAsync(): Promise<boolean>
  hasErrors(): boolean
  clearErrors(): void

  setFieldErrors(attribute: string, errors: FieldError[]): void
  setFieldValidators(attribute: string, validators: Validator[]): void
  addFieldValidator(attribute: string, validator: Validator): void
  addFieldValidatorsByPattern(pattern: string, validators: Validator[]): void

  setFormErrors(errors: FieldError[]): void

  formErrors: Ref<FieldError[]>
  loading: Ref<boolean>
}

export function useProvideForm(): FormContext {
  const form = new Form()
  const fields = ref<FieldHandle[]>([])
  const formErrors = ref<FieldError[]>([])
  const loading = ref(false)

  const ctx: FormContext = {
    register(h) {
      form.register(h)
      fields.value = form.getFields()
    },
    unregister(h) {
      form.unregister(h)
      fields.value = form.getFields()
    },
    getField: (attribute) => form.getField(attribute),
    fields,

    validateAll: () => form.validateAll(),
    validateAllAsync: () => form.validateAllAsync(),
    hasErrors: () => form.hasErrors(),
    clearErrors() {
      form.clearErrors()
      formErrors.value = []
    },

    setFieldErrors(attribute, errors) {
      form.getField(attribute)?.setErrors(errors)
    },
    setFieldValidators(attribute, validators) {
      form.setFieldValidators(attribute, validators)
    },
    addFieldValidator(attribute, validator) {
      form.addFieldValidator(attribute, validator)
    },
    addFieldValidatorsByPattern(pattern, validators) {
      form.addFieldValidatorsByPattern(pattern, validators)
    },

    setFormErrors(errors) {
      formErrors.value = errors
    },

    formErrors,
    loading,
  }

  provide(FORM_KEY, ctx)
  return ctx
}

export function useForm(): FormContext {
  const ctx = inject(FORM_KEY)
  if (!ctx) throw new Error(getStrings().errFormMissing)
  return ctx
}
