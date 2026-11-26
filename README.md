# @einhasad-vue/vue-form

[![npm version](https://img.shields.io/npm/v/@einhasad-vue/vue-form.svg?style=flat-square)](https://www.npmjs.com/package/@einhasad-vue/vue-form)
[![CI](https://img.shields.io/github/actions/workflow/status/einhasad/vue-form/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/einhasad/vue-form/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Vue 3](https://img.shields.io/badge/vue-3.3+-42b883.svg?style=flat-square)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-strict-3178c6.svg?style=flat-square)](https://www.typescriptlang.org/)

A fully headless Vue 3 form library: form state, field state, validation, and a wildcard-pattern API for array-field rules. The main entry ships **no components, no widgets, no styling.** An optional adapter at `@einhasad-vue/vue-form/ant-design` provides one `FormField` wrapper if you use Ant Design Vue.

🚀 **[Live demo →](https://einhasad.github.io/vue-form/)** — runs entirely in the browser with mocked APIs (MSW).

- **Headless core.** `Form` and `Field` are pure TypeScript classes. A thin Vue layer (`useProvideForm`, `useForm`, `useField`) binds them to reactivity. No DOM, no styles, no components.
- **UI-library independent.** Bring your own UI kit. The optional `./ant-design` subpath is a thin opt-in adapter; everything else stays vanilla.
- **Transport-agnostic.** The library never inspects rejection shapes. You translate failures into per-field or form-level errors.
- **Multiple errors per field.** Validation collects every failing rule, not stop-at-first.
- **Validators are plain functions.** Sync or async, return `FieldError | undefined`. No rule-object indirection.
- **Server-driven schemas.** Install rules at runtime, including wildcard patterns for array fields with `addFieldValidatorsByPattern('parts.*.sku', …)`.
- **All strings overridable.** One call to `setStrings(partial)` retargets every built-in error message.

## Install

```sh
npm install @einhasad-vue/vue-form
```

Peer dependency: `vue ^3.3`. Runtime and the type declarations of the main entry and `/headless` work on Vue 3.3+; the TypeScript declarations of the `/ant-design` adapter require Vue 3.5+ (see [Ant Design Vue adapter](#ant-design-vue-adapter)).

## Mental model

The library has **no `<Form>` component**. You create the form context yourself with `useProvideForm()`, then build the rest of the form however you want — `<a-form>`, plain `<form>`, multi-step wizard, anything.

`useProvideForm()` provides the context to **descendant** components, so the fields live in child components (your widgets), not in the component that calls `useProvideForm()`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useProvideForm, rules, type FieldError } from '@einhasad-vue/vue-form'
import TextInput from './widgets/TextInput.vue' // your widget, see below

const formCtx = useProvideForm()
const { formErrors, loading } = formCtx

const data = ref({ name: '', email: '' })

interface ApiFailure {
  response?: { status?: number; data?: { result?: { field: string; message: string }[] } }
}

async function send(payload: typeof data.value): Promise<unknown> {
  const r = await fetch('/api/users', { method: 'POST', body: JSON.stringify(payload) })
  if (!r.ok) throw { response: { status: r.status, data: await r.json() } } satisfies ApiFailure
  return r.json()
}

// You own the submit flow: validate, send, translate errors.
async function onSubmit() {
  // Server errors stay on a field until its value changes, so clear the last
  // submit's errors first or validateAll() keeps failing on them.
  formCtx.clearErrors()
  if (!formCtx.validateAll()) return
  if (!(await formCtx.validateAllAsync())) return
  loading.value = true
  try {
    await send(data.value)
  } catch (raw) {
    const r = raw as ApiFailure
    const result = r.response?.data?.result
    if (r.response?.status === 422 && Array.isArray(result)) {
      const unmatched: FieldError[] = []
      for (const e of result) {
        if (!formCtx.setFieldErrors(e.field, [{ message: e.message }])) {
          unmatched.push({ message: `${e.field}: ${e.message}` })
        }
      }
      formCtx.setFormErrors(unmatched)
    } else {
      formCtx.setFormErrors([{ message: 'Submit failed' }])
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <TextInput
      v-model="data.name"
      attribute="name"
      label="Name"
      :validators="[rules.required('Name'), rules.minLen(3, 'Name')]"
    />
    <TextInput
      v-model="data.email"
      attribute="email"
      label="Email"
      :validators="[rules.required('Email'), rules.email('Email')]"
    />

    <ul v-if="formErrors.length" role="alert">
      <li v-for="(e, i) in formErrors" :key="i">{{ e.message }}</li>
    </ul>

    <button type="submit" :disabled="loading">Save</button>
  </form>
</template>
```

A widget is anything that calls `useField`:

```vue
<!-- widgets/TextInput.vue (your code, not shipped) -->
<script setup lang="ts">
import { computed } from 'vue'
import { useField, type Validator } from '@einhasad-vue/vue-form'

const props = defineProps<{
  modelValue: string
  attribute: string
  label: string
  validators?: Validator[]
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const value = computed<string>({
  get: () => props.modelValue ?? '',
  set: (v) => emit('update:modelValue', v),
})
const f = useField({ attribute: props.attribute, modelValue: value, validators: props.validators })

// Ids must be unique on the page; on Vue >= 3.5 you can use useId() instead.
const id = `field-${props.attribute.replace(/[^\w-]/g, '_')}`
const errorId = `${id}-error`
</script>

<template>
  <label :for="id">{{ label }}</label>
  <input
    :id="id"
    v-model="value"
    :aria-invalid="f.isInvalid.value"
    :aria-describedby="f.isInvalid.value ? errorId : undefined"
    @blur="f.onBlur"
  />
  <span v-if="f.firstError.value" :id="errorId" role="alert">{{ f.firstError.value.message }}</span>
</template>
```

## API

Everything below is imported from `@einhasad-vue/vue-form` unless a subpath is named.

### Composables

| Composable | Returns |
| --- | --- |
| `useProvideForm()` | A new `FormContext`, provided to descendant components. Call once at the form root. |
| `useForm()` | The `FormContext` from the nearest `useProvideForm` ancestor. Throws `errFormMissing` when there is none. |
| `useFormOptional()` | The nearest `FormContext`, or `undefined` when there is no `useProvideForm` ancestor or when called outside `setup()`. Never throws or warns — for widgets that also work outside a form. |
| `useField({ attribute, modelValue, validators? })` | `UseFieldReturn`: `{ errors, isInvalid, firstError, validate, validateAsync, onBlur }`. Registers with the nearest form on mount, unregisters on unmount. |

`useField` options (`UseFieldOptions`):

- `attribute: string` — the field's name in the form, dotted paths allowed (`parts.0.sku`). **Read once** when `useField` runs.
- `modelValue: Ref<unknown>` — the field's value; usually a writable `computed` over your `v-model` prop. Read on every validation.
- `validators?: Validator[]` — **read once** when `useField` runs. Replacing the array later has no effect; see [Changing rules at runtime](#changing-rules-at-runtime).

`UseFieldReturn`:

| Member | Type | Meaning |
| --- | --- | --- |
| `errors` | `Ref<FieldError[]>` | Current errors, server errors first. |
| `isInvalid` | `ComputedRef<boolean>` | `errors.length > 0`. |
| `firstError` | `ComputedRef<FieldError \| undefined>` | `errors[0]`. |
| `validate()` | `() => FieldError[]` | Sync pass with the current model value (see [Async validators](#async-validators)). |
| `validateAsync()` | `() => Promise<FieldError[]>` | Awaits every validator. |
| `onBlur()` | `() => FieldError[]` | Same as `validate()`; bind it to the control's `blur`. |

Once a field shows errors, it re-validates (sync) on every model change, so errors update as the user types.

`useField` does not require a form. Without a `useProvideForm` ancestor it registers nowhere, but `validate`, `validateAsync`, `onBlur`, `errors`, `isInvalid` and `firstError` behave exactly as inside a form — so the same widget works standalone (filters, toolbars, unit tests).

### `FormContext`

| Member | Purpose |
| --- | --- |
| `validateAll()` | Sync pass over every registered field. Returns `true` when no field has errors. |
| `validateAllAsync()` | Awaits every validator of every field. Resolves `true` when no field has errors. |
| `hasErrors()` | `true` when any registered field currently has errors (form-level errors are not counted). |
| `clearErrors()` | Clears every field's errors (including server errors) and the form-level errors. |
| `setFieldErrors(attribute, errors)` | Replaces the errors of the field registered under `attribute` (dotted paths like `parts.0.sku` work). Returns `true` if such a field is registered, `false` if not (the errors are dropped — send them to `setFormErrors`). |
| `setFormErrors(errors)` | Replaces the form-level errors. Render them however you want. |
| `setFieldValidators(attribute, validators)` | Replaces all validators of a registered field (inline ones and any added by a pattern). No-op for an attribute that is not registered. |
| `addFieldValidator(attribute, validator)` | Appends one validator to a registered field. No-op for an attribute that is not registered. |
| `addFieldValidatorsByPattern(pattern, validators)` | Adds validators to every field whose attribute matches a dotted wildcard (`parts.*.sku`), now **and** for fields registered later. Returns a disposer `() => void` that removes the pattern and the validators it added. |
| `getField(attribute)` | The registered `FieldHandle`, or `undefined`. |
| `fields` | `Ref<FieldHandle[]>` — reactive list of registered fields. |
| `formErrors` | `Ref<FieldError[]>` — form-level errors. |
| `loading` | `Ref<boolean>` — a flag for your submit flow. The library never sets it. |
| `register(handle)` / `unregister(handle)` | Called by `useField`. Use them only to register a custom `FieldHandle` implementation. |

Removing or replacing validators does not re-validate; current errors stay until the next validation.

**Server errors.** Errors set with `setFieldErrors` (or a handle's `setErrors` / `addError`) are kept through blur, `validateAll()` and `validateAllAsync()` while the field's value is unchanged, listed before validator errors. They disappear when the value changes, on `clearErrors()`, or when new errors are set; changing the value back does not restore them.

**Disabled and hidden fields.** Every mounted field is validated, whether its control is disabled or hidden with CSS. Unmount it with `v-if`, or clear its rules with `setFieldValidators(attribute, [])`.

### Async validators

A validator may return a `Promise`.

- The **sync pass** — `onBlur`, `validate()`, `validateAll()` — calls every validator, async ones included (so a network check starts on blur), but ignores their Promise results and swallows their rejections. Async errors never appear from the sync pass.
- **`validateAsync()` / `validateAllAsync()`** await every validator and apply the async errors. Call `validateAllAsync()` in your submit flow. If the value changes while they run, the stale result is discarded and validation runs again for the current value.
- A validator that rejects makes `validateAsync()` / `validateAllAsync()` reject. Catch network failures inside the validator and return an error or `undefined`.

### Validator factories (`rules`)

```ts
import { rules } from '@einhasad-vue/vue-form'
```

Every factory returns a `SyncValidator`, `(value: unknown) => FieldError | undefined`. The error has `message` (from [Strings](#strings--i18n)) and `key` (the rule name; `'unique'` for `uniqueIn`). `attr` is the field name put into the message as `{attr}`; without it the message uses `fieldFallback` ("This field"). `override` replaces the message template for that one rule.

**Empty values** are `''`, `null`, `undefined` and `[]`. Every rule except `required` and `requiredIf` passes on empty values — combine with `required` to make a field mandatory. A whitespace-only string is not empty for the other rules.

| Factory | Fails when |
| --- | --- |
| `required(attr?, override?)` | The value is empty or a whitespace-only string. `0` and `false` pass (for a "must be checked" checkbox write a custom validator). |
| `requiredIf(predicate, attr?, override?)` | `predicate()` is truthy and the value is empty or whitespace-only. The predicate runs on every validation; read other fields in it. Uses the `required` message, key `'requiredIf'`. |
| `minLen(n, attr?, override?)` | A string is shorter than `n`. Non-strings pass. |
| `maxLen(n, attr?, override?)` | A string is longer than `n`. Non-strings pass. |
| `lengthBetween(min, max, attr?, override?)` | A string's length is outside `min..max` (inclusive). Non-strings pass. |
| `minNum(n, attr?, override?)` | A number or numeric string is less than `n`. |
| `maxNum(n, attr?, override?)` | A number or numeric string is greater than `n`. |
| `between(min, max, attr?, override?)` | A number or numeric string is outside `min..max` (inclusive). |
| `integer(attr?, override?)` | A number or numeric string is not an integer. |
| `numeric(attr?, override?)` | The value is neither a finite number nor a decimal numeric string: `'abc'`, whitespace-only strings, hex / binary / octal literals (`'0x1f'`, `'0b1'`, `'0o7'`), `'Infinity'`, booleans and objects fail. |
| `pattern(re, attr?, override?)` | A string does not match `re`. Non-strings pass. `/g` and `/y` regexes are safe; your regex object is not mutated. |
| `email(attr?, override?)` | A string is not shaped like `local@domain.tld` (no whitespace). Non-strings pass. |
| `url(attr?, override?)` | A string is not an absolute `http:` or `https:` URL. Non-strings pass. |
| `uuid(attr?, override?)` | A string is not an RFC 9562 UUID (versions 1–8, case-insensitive) or the nil / max UUID. Non-strings pass. |
| `oneOf(allowed, attr?, override?)` | `allowed.includes(value)` is false. |
| `sameAs(other, attr?, override?)` | The value is not `===` to `other`. `other` may be a plain value or a ref-like `{ value }`, read at validation time. |
| `uniqueIn(siblings, currentIndex, key, override?)` | Another row of `siblings` (index ≠ `currentIndex`) has `row[key] === value`. `siblings` is an array or a ref-like `{ value: array }`. Message uses `{value}`, not `{attr}`. |

The numeric rules `minNum`, `maxNum`, `between` and `integer` pass on non-numeric input (letters, whitespace-only strings, hex / binary / octal literals) — add `numeric()` to reject it.

Roll your own:

```ts
import { useForm, type Validator } from '@einhasad-vue/vue-form'

const formCtx = useForm()

const vinUnique: Validator = async (v) => {
  if (!v) return undefined
  try {
    const taken: boolean = await fetch(`/api/vins/${String(v)}`).then((r) => r.json())
    return taken ? { message: 'VIN already registered', key: 'vinUnique' } : undefined
  } catch {
    return { message: 'Could not check the VIN', key: 'vinUnique' }
  }
}
formCtx.addFieldValidator('vin', vinUnique)
```

Types: `Validator` (sync or async), `SyncValidator`, `FieldError` (`{ message: string; key?: string; [extra: string]: unknown }`), `FieldHandle`.

### Changing rules at runtime

`attribute` and `validators` are read once when the field mounts. To change rules later:

- call `formCtx.setFieldValidators(attribute, validators)`, or
- re-mount the field with a new `key`, or
- write validators that read changing data lazily.

`uniqueIn` reads `siblings.value` on every validation, so give it a getter object when the rows array can be replaced. Vue unwraps refs in templates, so passing a `ref` or `computed` directly from the template hands `uniqueIn` a snapshot of the array:

```ts
import { ref } from 'vue'

type Part = { sku: string; qty: string }
const rows = ref<Part[]>([{ sku: '', qty: '1' }])

// Use `liveRows` in the template: :validators="[rules.uniqueIn(liveRows, i, 'sku')]"
const liveRows = {
  get value() {
    return rows.value
  },
}
```

### Strings / i18n

```ts
import { setStrings } from '@einhasad-vue/vue-form'

setStrings({
  required: '{attr} is required',
  minLen: '{attr} must be at least {min} characters',
  fieldFallback: 'This value',
})
```

| Function | Purpose |
| --- | --- |
| `setStrings(partial)` | Merges `partial` into the current strings. |
| `getStrings()` | The current strings (read-only). |
| `resetStrings()` | Back to the English defaults. |
| `interpolate(template, params)` | Replaces `{name}` placeholders; missing params become `''`. |

`Strings` is an exported interface; `setStrings` takes `Partial<Strings>`, so overrides are type-checked. Keys: one per rule (`required`, `minLen`, `maxLen`, `minNum`, `maxNum`, `pattern`, `email`, `url`, `integer`, `numeric`, `between`, `lengthBetween`, `oneOf`, `sameAs`, `uuid`, `unique`), `fieldFallback` (the `{attr}` used when a rule gets no attribute name) and `errFormMissing` (thrown by `useForm()`). Placeholders: `{attr}`, `{min}`, `{max}`, `{values}` (`oneOf`), `{value}` (`unique`).

**Deprecated keys**, unused by the library and removed in 1.0: `uniqueServer`, `selectPlaceholder`, `searchPlaceholder`, `currencySymbol`, `nestedAddButton`, `nestedDeleteButton`, `nestedCloneButton`.

**Strings are global module state.** `setStrings` changes the messages for every app instance in the page and, on a server, for every SSR request in the same process. Call it once at startup; switching locale per request on an SSR server is not supported. Rules read the strings when they produce an error, so a change affects the next validation, not errors already shown.

### Headless subpath

For pure-TS use (testing, server-side, non-Vue contexts):

```ts
import { Form, Field, rules } from '@einhasad-vue/vue-form/headless'

const form = new Form()
const email = new Field('email', [rules.required('Email'), rules.email('Email')], '')
form.register(email)

email.value = 'not-an-email'
form.validateAll() // false
email.errors // [{ message: 'Email must be a valid email', key: 'email' }]
```

No Vue import at runtime. Same `Form` / `Field` classes the Vue layer composes. The subpath also exports `rules`, the strings functions and the types.

`new Field(attribute, validators = [], initialValue = undefined)` implements `FieldHandle`:

| Member | Signature | Meaning |
| --- | --- | --- |
| `attribute` | `readonly string` | Field name. |
| `value` | `unknown` (get / set) | The value validators see. Assigning a different value (`Object.is`) drops errors set from outside. |
| `errors` | `FieldError[]` | Current errors, errors set from outside first. |
| `validate()` | `(): FieldError[]` | Sync pass; Promise results are ignored (see [Async validators](#async-validators)). |
| `validateAsync()` | `(): Promise<FieldError[]>` | Awaits every validator; re-runs if `value` changed meanwhile. |
| `setValidators(validators)` | `(Validator[]): void` | Replaces all validators. |
| `addValidator(validator)` | `(Validator): void` | Appends one. |
| `removeValidator(validator)` | `(Validator): void` | Removes every occurrence of that function. |
| `setErrors(errors)` | `(FieldError[]): void` | Replaces the errors; they stay through validation until `value` changes. |
| `addError(error)` | `(FieldError): void` | Appends one error with the same lifetime. |
| `clearErrors()` | `(): void` | Removes all errors. |

`FieldHandle` is the interface the form works with: the members above except `value` and the constructor, with `removeValidator?` optional. Implement it to register a custom field.

`new Form()` has no form-level errors and no values:

| Method | Signature |
| --- | --- |
| `register(handle)` / `unregister(handle)` | `(FieldHandle): void` — `register` also applies matching pattern validators. |
| `getField(attribute)` | `(string): FieldHandle \| undefined` |
| `getFields()` | `(): FieldHandle[]` — a copy of the registered list. |
| `validateAll()` / `validateAllAsync()` | `(): boolean` / `(): Promise<boolean>` — `true` when no field has errors. |
| `hasErrors()` | `(): boolean` |
| `clearErrors()` | `(): void` |
| `setFieldValidators(attribute, validators)` | `(string, Validator[]): void` |
| `addFieldValidator(attribute, validator)` | `(string, Validator): void` |
| `addFieldValidatorsByPattern(pattern, validators)` | `(string, Validator[]): () => void` — returns the disposer. |

Set field errors with `form.getField(attribute)?.setErrors(errors)`.

### Ant Design Vue adapter

`@einhasad-vue/vue-form/ant-design` exports **one component, `FormField`**: a scoped-slot wrapper that calls `useField` and renders an `<a-form-item>` with label and error. You put any antd control in the slot. Nothing from antd is pulled in unless you import this subpath.

```sh
npm install ant-design-vue dayjs
```

`ant-design-vue` (`^3.2.0 || ^4.0.0`) and `dayjs` are optional peer dependencies, externalized from the build. **Types require Vue 3.5+:** the adapter runs on Vue 3.3+, but its `.d.ts` is generated against Vue 3.5 and fails to type-check on Vue 3.3 / 3.4 (TS2707, TS2694); on those versions use `skipLibCheck` or upgrade Vue. Register antd so the `a-*` tags resolve:

```ts
// main.ts
import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'

createApp(App).use(Antd).mount('#app')
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useProvideForm, rules } from '@einhasad-vue/vue-form'
import { FormField } from '@einhasad-vue/vue-form/ant-design'

const form = useProvideForm()
const data = ref({ email: '', category: null as string | null })
const categories = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
]
</script>

<template>
  <a-form layout="vertical" @submit.prevent="form.validateAll()">
    <FormField
      v-slot="{ field }"
      v-model="data.email"
      attribute="email"
      label="Email"
      required
      :validators="[rules.required('Email'), rules.email('Email')]"
    >
      <a-input
        :id="field.id"
        v-model:value="field.value"
        :status="field.status"
        :aria-invalid="field.invalid"
        :aria-describedby="field.errorId"
        @blur="field.onBlur"
      />
    </FormField>

    <FormField
      v-slot="{ field }"
      v-model="data.category"
      attribute="category"
      label="Category"
      :validators="[rules.required('Category')]"
    >
      <a-select
        :id="field.id"
        v-model:value="field.value"
        :options="categories"
        :status="field.status"
        @blur="field.onBlur"
      />
    </FormField>

    <a-button type="primary" html-type="submit">Save</a-button>
  </a-form>
</template>
```

`FormField` props:

| Prop | Type | Meaning |
| --- | --- | --- |
| `modelValue` (`v-model`) | `unknown` | The field's value. |
| `attribute` | `string` | Field name in the form. Read once at mount. |
| `label` | `string \| false` | Label text. Omit it or pass `false` for no label — then give the control an `aria-label`. |
| `required` | `boolean` | Shows antd's required mark only. It adds no validator — pass `rules.required()` too. |
| `validators` | `Validator[]` | Read once at mount; see [Changing rules at runtime](#changing-rules-at-runtime). |

Events: `update:modelValue`, `blur` (with the current value). Exposed via template ref: `validate()`, `validateAsync()`. There is no `disabled` prop: a disabled control inside `FormField` is still validated — unmount the field with `v-if` or clear its rules with `setFieldValidators(attribute, [])`.

The default slot receives `{ field }` (type `FormFieldSlotProps`; `field` is a `FormFieldBinding`):

| `field.` | Type | Bind it to |
| --- | --- | --- |
| `value` | `unknown` (writable) | `v-model:value` / `v-model:checked` |
| `onBlur` | `() => void` | `@blur` |
| `status` | `'' \| 'error'` | `:status` |
| `invalid` | `boolean` | `:aria-invalid` |
| `id` | `string` | `:id` — links the label to the control |
| `errorId` | `string \| undefined` | `:aria-describedby` — id of the shown error, `undefined` while valid |
| `firstError` | `FieldError \| undefined` | — |
| `errors` | `FieldError[]` | — |

Accessibility notes:

- Bind `:id`, `:aria-invalid` and `:aria-describedby` on `a-input`, `a-textarea`, `a-input-number`, `a-checkbox` and `a-switch`.
- `a-select` and the date / time pickers accept only `:id`: ant-design-vue puts `aria-*` attributes on a wrapper element or drops them.
- The error is announced by antd's `role="alert"` help container; `FormField` adds no live region of its own.
- Ids come from Vue's `useId()` on Vue >= 3.5 (SSR-safe). On Vue 3.3 / 3.4 a module-level counter is used, shared by every app and SSR request in the process, so server and client ids can differ — use Vue >= 3.5 with SSR.

## Server-driven validation schemas

A common pattern: the backend is the source of truth for validation rules. Fetch a schema on mount and install validators — including ones for array rows that don't exist yet.

```ts
import { onMounted, onUnmounted } from 'vue'
import { useProvideForm, rules, type Validator } from '@einhasad-vue/vue-form'

type Rule = { kind: 'required' } | { kind: 'minLen' | 'maxLen' | 'minNum'; n: number }
type Schema = Record<string, Rule[]>

// {
//   "name":        [{ "kind": "required" }, { "kind": "minLen", "n": 3 }],
//   "parts.*.sku": [{ "kind": "required" }, { "kind": "maxLen", "n": 40 }],
//   "parts.*.qty": [{ "kind": "required" }, { "kind": "minNum", "n": 1 }]
// }

const labels: Record<string, string> = { name: 'Name', 'parts.*.sku': 'SKU', 'parts.*.qty': 'Quantity' }

function buildValidator(rule: Rule, label: string): Validator {
  switch (rule.kind) {
    case 'required':
      return rules.required(label)
    case 'minLen':
      return rules.minLen(rule.n, label)
    case 'maxLen':
      return rules.maxLen(rule.n, label)
    case 'minNum':
      return rules.minNum(rule.n, label)
  }
}

const formCtx = useProvideForm()
let disposers: (() => void)[] = []

function applySchema(schema: Schema) {
  for (const dispose of disposers) dispose()
  disposers = []
  for (const [key, ruleList] of Object.entries(schema)) {
    const validators = ruleList.map((r) => buildValidator(r, labels[key] ?? key))
    if (key.includes('*')) disposers.push(formCtx.addFieldValidatorsByPattern(key, validators))
    else formCtx.setFieldValidators(key, validators)
  }
}

onMounted(async () => {
  applySchema(await fetch('/api/validation/schema/vehicle').then((r) => r.json()))
})
onUnmounted(() => {
  for (const dispose of disposers) dispose()
})
```

`addFieldValidatorsByPattern` is **additive** (layers on top of inline `:validators`) and **forward-applying** — when the user adds a row and a field registers with attribute `parts.7.sku`, the matching pattern's validators are applied automatically. Calling it twice with the same pattern adds the validators twice, so keep the disposer and call it before re-applying a reloaded schema. `setFieldValidators` replaces everything on that field, including validators a pattern added — call it before adding patterns that match the same field.

`*` matches one dotted segment: `parts.*.sku` matches `parts.0.sku` but not `parts.0.attrs.sku`.

## Array fields

There is no `<NestedForm>`. Render `v-for` with a dotted attribute path and you have it (`TextInput` is the widget from [Mental model](#mental-model), `liveRows` the getter object from [Changing rules at runtime](#changing-rules-at-runtime)):

```vue
<button type="button" @click="rows.push({ sku: '', qty: '1' })">Add row</button>
<table>
  <thead><tr><th>SKU</th><th>Qty</th><th>Actions</th></tr></thead>
  <tbody>
    <tr v-for="(row, i) in rows" :key="i">
      <td>
        <TextInput
          v-model="row.sku"
          :attribute="`parts.${i}.sku`"
          :label="`SKU, row ${i + 1}`"
          :validators="[rules.uniqueIn(liveRows, i, 'sku')]"
        />
      </td>
      <td>
        <TextInput v-model="row.qty" :attribute="`parts.${i}.qty`" :label="`Qty, row ${i + 1}`" />
      </td>
      <td><button type="button" @click="rows.splice(i, 1)">Delete row {{ i + 1 }}</button></td>
    </tr>
  </tbody>
</table>
```

Rows are keyed by index on purpose: `attribute` and the `uniqueIn` index are read once at mount, so the component at index `i` must stay the field `parts.${i}.*`.

Pair with `addFieldValidatorsByPattern('parts.*.sku', …)` and the schema-driven rules apply to every row, present and future. Server 422 errors with dotted field paths (`parts.0.sku`) attach to the right row via `setFieldErrors`.

## Examples

The **[live demo](https://einhasad.github.io/vue-form/)** is a single page built from `examples/`, using only the public API as you would import it. Each section shows the running example next to its source:

- **Getting started** — basic form, full API reference.
- **Validation** — every validator factory, async validators, i18n / strings.
- **Form orchestration** — `FormContext` API, server errors (422), array fields, server-driven schemas.
- **Adapters & patterns** — custom widget, field without a form, headless subpath, Ant Design adapter.
- **Real-world** — an "add vehicle" form twice: with in-process mock services, and with real `fetch()` calls intercepted by [MSW v2](https://mswjs.io/) (schema from `GET /api/validation/schema/vehicle`, 422 envelopes mapped to per-field errors, including nested `parts.0.sku`). Both render an event log of the lifecycle (`request` / `response` / `field-error` / `validator` / …).

Run it locally:

```sh
npm install
npm run dev --workspace=examples   # http://localhost:5173
```

## Development

```sh
npm install
npm run dev --workspace=examples   # demo at http://localhost:5173
npm run lint                       # ESLint: src, tests, examples/src
npm run typecheck                  # vue-tsc: library and tests
npm run typecheck:examples         # vue-tsc: demo
npm test                           # vitest: headless classes, rules (incl. fuzz), Vue bridge, antd adapter
npm run test:coverage              # tests with 100% coverage thresholds
npm run build                      # ESM + CJS bundles and type declarations in dist/
```

CI runs `lint`, both typechecks, `test:coverage`, `build`, the demo build and `npm pack --dry-run` on Node 20 and 22.

## License

MIT.
