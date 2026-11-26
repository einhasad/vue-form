import type { FieldError } from '../headless/types'

export interface FormFieldBinding {
  value: unknown
  onBlur: () => void
  invalid: boolean
  firstError: FieldError | undefined
  errors: FieldError[]
  status: '' | 'error'
  id: string
  errorId: string | undefined
}

export interface FormFieldSlotProps {
  field: FormFieldBinding
}
