import type { FieldHandle, Validator } from './types'

interface PatternEntry {
  pattern: string
  regex: RegExp
  validators: Validator[]
}

// "parts.*.sku" → /^parts\.[^.]+\.sku$/
// "*" matches one dotted segment (no embedded dots).
function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .split('.')
    .map((seg) =>
      seg === '*' ? '[^.]+' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    )
    .join('\\.')
  return new RegExp(`^${escaped}$`)
}

export class Form {
  private fields: FieldHandle[] = []
  private patternValidators: PatternEntry[] = []

  register(h: FieldHandle): void {
    // New field inherits validators from any pattern that matches its attribute.
    for (const pv of this.patternValidators) {
      if (pv.regex.test(h.attribute)) {
        for (const v of pv.validators) h.addValidator(v)
      }
    }
    this.fields.push(h)
  }

  unregister(h: FieldHandle): void {
    const i = this.fields.indexOf(h)
    if (i >= 0) this.fields.splice(i, 1)
  }

  getField(attribute: string): FieldHandle | undefined {
    return this.fields.find((f) => f.attribute === attribute)
  }

  getFields(): FieldHandle[] {
    return this.fields.slice()
  }

  /** Sync validation pass — Promise-returning validators are skipped. */
  validateAll(): boolean {
    let ok = true
    for (const f of this.fields) {
      const errs = f.validate()
      if (errs.length) ok = false
    }
    return ok
  }

  /** Async validation pass — awaits every validator across every field. */
  async validateAllAsync(): Promise<boolean> {
    let ok = true
    await Promise.all(
      this.fields.map(async (f) => {
        const errs = await f.validateAsync()
        if (errs.length) ok = false
      }),
    )
    return ok
  }

  hasErrors(): boolean {
    return this.fields.some((f) => f.errors.length > 0)
  }

  clearErrors(): void {
    for (const f of this.fields) f.clearErrors()
  }

  setFieldValidators(attribute: string, validators: Validator[]): void {
    this.getField(attribute)?.setValidators(validators)
  }

  addFieldValidator(attribute: string, validator: Validator): void {
    this.getField(attribute)?.addValidator(validator)
  }

  /**
   * Adds validators to every field whose attribute matches a dotted wildcard
   * pattern (e.g. "parts.*.sku" matches "parts.0.sku", "parts.1.sku", …).
   * Applies to fields registered now AND any registered later — useful for
   * server-driven schemas that describe rules for array items, where the
   * concrete row indexes don't exist yet.
   */
  addFieldValidatorsByPattern(pattern: string, validators: Validator[]): void {
    const regex = patternToRegex(pattern)
    this.patternValidators.push({ pattern, regex, validators: [...validators] })
    for (const f of this.fields) {
      if (regex.test(f.attribute)) {
        for (const v of validators) f.addValidator(v)
      }
    }
  }
}
