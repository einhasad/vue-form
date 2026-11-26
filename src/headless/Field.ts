import type { FieldError, FieldHandle, Validator } from './types'

const ignoreRejection = (): undefined => undefined

export class Field implements FieldHandle {
  readonly attribute: string
  errors: FieldError[] = []
  private validators: Validator[]
  private current: unknown
  private external: FieldError[] = []
  private externalValue: unknown
  private latestAsync: Promise<FieldError[]> | undefined

  constructor(
    attribute: string,
    validators: Validator[] = [],
    initialValue: unknown = undefined,
  ) {
    this.attribute = attribute
    this.validators = [...validators]
    this.current = initialValue
  }

  get value(): unknown {
    return this.current
  }

  set value(v: unknown) {
    if (this.external.length && !Object.is(v, this.externalValue)) {
      const dropped = this.external
      this.external = []
      this.errors = this.errors.filter((e) => !dropped.includes(e))
    }
    this.current = v
  }

  /** Sync pass. Skips any validator whose immediate return is a Promise. */
  validate(): FieldError[] {
    const out: FieldError[] = []
    for (const v of this.validators) {
      const r = v(this.current)
      if (r instanceof Promise) {
        r.catch(ignoreRejection)
        continue
      }
      if (r) out.push(r)
    }
    this.errors = [...this.external, ...out]
    return this.errors
  }

  /** Awaits every validator. Use on submit. */
  validateAsync(): Promise<FieldError[]> {
    const value = this.current
    const run: Promise<FieldError[]> = this.collectAsync(value).then((out) => {
      const newer = this.latestAsync
      if (newer && newer !== run) return newer
      if (!Object.is(value, this.current)) return this.validateAsync()
      this.errors = [...this.external, ...out]
      return this.errors
    })
    this.latestAsync = run
    return run
  }

  private async collectAsync(value: unknown): Promise<FieldError[]> {
    const out: FieldError[] = []
    for (const v of this.validators) {
      const r = await v(value)
      if (r) out.push(r)
    }
    return out
  }

  setValidators(vs: Validator[]): void {
    this.validators = [...vs]
  }

  addValidator(v: Validator): void {
    this.validators.push(v)
  }

  removeValidator(v: Validator): void {
    this.validators = this.validators.filter((x) => x !== v)
  }

  setErrors(es: FieldError[]): void {
    this.errors = [...es]
    this.external = [...es]
    this.externalValue = this.current
  }

  addError(e: FieldError): void {
    this.errors.push(e)
    this.external.push(e)
    this.externalValue = this.current
  }

  clearErrors(): void {
    this.errors = []
    this.external = []
  }
}
