import type { FieldError, FieldHandle, Validator } from './types'

export class Field implements FieldHandle {
  readonly attribute: string
  value: unknown
  errors: FieldError[] = []
  private validators: Validator[]

  constructor(
    attribute: string,
    validators: Validator[] = [],
    initialValue: unknown = undefined,
  ) {
    this.attribute = attribute
    this.validators = [...validators]
    this.value = initialValue
  }

  /** Sync pass. Skips any validator whose immediate return is a Promise. */
  validate(): FieldError[] {
    const out: FieldError[] = []
    for (const v of this.validators) {
      const r = v(this.value)
      if (r instanceof Promise) continue
      if (r) out.push(r)
    }
    this.errors = out
    return out
  }

  /** Awaits every validator. Use on submit. */
  async validateAsync(): Promise<FieldError[]> {
    const out: FieldError[] = []
    for (const v of this.validators) {
      const r = await Promise.resolve(v(this.value))
      if (r) out.push(r)
    }
    this.errors = out
    return out
  }

  setValidators(vs: Validator[]): void {
    this.validators = [...vs]
  }

  addValidator(v: Validator): void {
    this.validators.push(v)
  }

  setErrors(es: FieldError[]): void {
    this.errors = [...es]
  }

  addError(e: FieldError): void {
    this.errors.push(e)
  }

  clearErrors(): void {
    this.errors = []
  }
}
