export interface FieldError {
  message: string
  // Open shape — extensible via TS interface merging by consumers.
  // The library's built-in validators may set: key?: string
  key?: string
  [extra: string]: unknown
}

export type Validator =
  (value: unknown) => FieldError | undefined | Promise<FieldError | undefined>

export interface FieldHandle {
  attribute: string
  errors: FieldError[]
  validate(): FieldError[]
  validateAsync(): Promise<FieldError[]>
  setValidators(validators: Validator[]): void
  addValidator(validator: Validator): void
  setErrors(errors: FieldError[]): void
  addError(error: FieldError): void
  clearErrors(): void
}
