# @einhasad/vue-form

A fully headless Vue 3 form library: form state, field state, validation, and a wildcard-pattern API for array-field rules. The main entry ships **no components, no widgets, no styling.** Optional adapter at `@einhasad/vue-form/ant-design` if you're on Ant Design Vue and want the boilerplate already written.

- **Headless core.** `Form` and `Field` are pure TypeScript classes. A thin Vue layer (`useProvideForm`, `useForm`, `useField`) binds them to reactivity. No DOM, no styles, no components.
- **UI-library independent.** Bring your own UI kit. The optional `./ant-design` subpath is a thin opt-in adapter; everything else stays vanilla.
- **Transport-agnostic.** Throws what your API throws; the library never inspects rejection shapes. You translate failures into per-field or form-level errors.
- **Multiple errors per field.** Validation collects every failing rule, not stop-at-first.
- **Validators are plain functions.** Sync or async, return `FieldError | undefined`. No rule-object indirection.
- **Server-driven schemas.** External callers can install rules at runtime, including wildcard patterns for array fields with `addFieldValidatorsByPattern("parts.*.sku", …)`.
- **All strings overridable.** One call to `setStrings(partial)` retargets every built-in error message.

## Install

```sh
npm install @einhasad/vue-form
```

Peer-deps: `vue ^3.3`.

## Mental model

The library has **no `<Form>` component**. You create the form context yourself with `useProvideForm()`, then build the rest of the form however you want — `<a-form>`, plain `<form>`, multi-step wizard, anything.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useProvideForm, rules } from '@einhasad/vue-form'
import TextInput from './widgets/TextInput.vue'  // your widget

// 1. Provide the form context to descendants. useField calls in child
//    components find this via inject.
const formCtx = useProvideForm()
const { formErrors, loading } = formCtx

const data = ref({ name: '', email: '' })

async function send(payload: typeof data.value) {
  const r = await fetch('/api/users', { method: 'POST', body: JSON.stringify(payload) })
  if (!r.ok) throw { response: { status: r.status, data: await r.json() } }
  return r.json()
}

// 2. You own the submit flow. Validate, send, translate errors.
async function onSubmit() {
  formCtx.clearErrors()
  if (!formCtx.validateAll()) return
  if (!(await formCtx.validateAllAsync())) return
  loading.value = true
  try {
    const result = await send(data.value)
    // ... handle success
  } catch (raw) {
    const r = raw as { response?: { status?: number; data?: { result?: { field: string; message: string }[] } } }
    if (r?.response?.status === 422 && Array.isArray(r.response.data?.result)) {
      for (const e of r.response.data.result) {
        formCtx.setFieldErrors(e.field, [{ message: e.message }])
      }
    } else {
      formCtx.setFormErrors([{ message: 'Submit failed' }])
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <TextInput
      v-model="data.name"
      attribute="name"
      :validators="[rules.required('Name'), rules.minLen(3, 'Name')]"
    />
    <TextInput
      v-model="data.email"
      attribute="email"
      :validators="[rules.required('Email'), rules.email('Email')]"
    />

    <ul v-if="formErrors.length">
      <li v-for="(e, i) in formErrors" :key="i">{{ e.message }}</li>
    </ul>

    <button type="submit" :disabled="loading">Save</button>
  </form>
</template>
```

A widget is anything that calls `useField`:

```vue
<!-- TextInput.vue (your code, not shipped) -->
<script setup lang="ts">
import { computed } from 'vue'
import { useField, type Validator } from '@einhasad/vue-form'

const props = defineProps<{
  modelValue: string
  attribute: string
  validators?: Validator[]
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const value = computed<string>({
  get: () => props.modelValue ?? '',
  set: (v) => emit('update:modelValue', v),
})
const f = useField({ attribute: props.attribute, modelValue: value, validators: props.validators })
</script>

<template>
  <input v-model="value" @blur="f.onBlur" />
  <span v-if="f.firstError.value">{{ f.firstError.value.message }}</span>
</template>
```

## API

### Composables

| Composable | Returns |
| --- | --- |
| `useProvideForm()` | A `FormContext`. Call once at the form root — `useField` finds it via `inject`. |
| `useForm()` | The `FormContext` from the nearest `useProvideForm` ancestor. Throws if missing. |
| `useField({ attribute, modelValue, validators? })` | `{ errors, isInvalid, firstError, validate, validateAsync, onBlur }`. Registers on mount, unregisters on unmount. |

### `FormContext`

| Member | Purpose |
| --- | --- |
| `validateAll()` / `validateAllAsync()` | Run sync / async validators across every registered field. Return `true` when no errors. |
| `clearErrors()` | Clears every field's errors and the form-level errors list. |
| `setFieldErrors(attribute, errors)` | Attach error messages to a specific attribute (incl. dotted paths like `parts.0.sku`). |
| `setFormErrors(errors)` | Top-level form errors. Render them however you want. |
| `setFieldValidators(attribute, validators)` | Replace a registered field's validators. |
| `addFieldValidator(attribute, validator)` | Append one validator. |
| `addFieldValidatorsByPattern(pattern, validators)` | Layer validators onto every field whose attribute matches a dotted wildcard (e.g. `parts.*.sku`). Applies to fields registered now AND any registered later. |
| `getField(attribute)` | The raw `FieldHandle`. |
| `formErrors: Ref<FieldError[]>` | Reactive form-level errors. |
| `loading: Ref<boolean>` | Form-level loading flag. The library does not toggle this — your submit flow does. |
| `fields: Ref<FieldHandle[]>` | Reactive list of registered fields. |

### Validator factories (`rules`)

```ts
import { rules } from '@einhasad/vue-form'
```

`rules.required(attr?, override?)`, `rules.minLen(n, …)`, `rules.maxLen`, `rules.minNum`, `rules.maxNum`, `rules.pattern(re, …)`, `rules.email`, `rules.uniqueIn(siblings, currentIndex, key, override?)`.

All validators are plain functions:

```ts
type Validator = (value: unknown) => FieldError | undefined | Promise<FieldError | undefined>
```

Roll your own:

```ts
const vinUnique: Validator = async (v) => {
  if (!v) return undefined
  const taken = await fetch(`/api/vins/${v}`).then((r) => r.json())
  return taken ? { message: 'VIN already registered', key: 'vinUnique' } : undefined
}
formCtx.addFieldValidator('vin', vinUnique)
```

### Strings / i18n

```ts
import { setStrings } from '@einhasad/vue-form'
setStrings({
  required: '{attr} is required',
  minLen: '{attr} must be at least {min} characters',
})
```

`Strings = typeof en` — overrides are type-checked against the canonical shape.

### Headless subpath

For pure-TS use (testing, server-side, non-Vue contexts):

```ts
import { Form, Field, rules, setStrings } from '@einhasad/vue-form/headless'
```

No Vue, no DOM. Same `Form` / `Field` classes the Vue layer composes.

### Ant Design Vue adapter

Opt-in widget pack that wraps `<a-input>`, `<a-select>`, `<a-date-picker>`, etc. Each widget calls `useField` internally and renders an `<a-form-item>` for label + error layout — same component contract as a hand-rolled widget. **Not included unless you import from this subpath**, so the core lib stays free of antd code.

```sh
npm install ant-design-vue dayjs   # peer-deps for the adapter
```

```ts
// main.ts — register Antd globally so the adapter's templates resolve a-* tags.
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import { createApp } from 'vue'

createApp(App).use(Antd).mount('#app')
```

```ts
// Form.vue — import widgets from the subpath.
import {
  TextInput, NumberInput, TextareaInput, SelectInput,
  CheckboxInput, CheckboxGroup, RadioGroup, SwitchInput,
  CurrencyInput, PhoneInput,
  DatePicker, DateRangePicker, TimePicker,
  SearchSelect,
} from '@einhasad/vue-form/ant-design'
```

Each widget exposes the same prop surface: `v-model`, `attribute`, `label?`, `required?`, `disabled?`, `validators?`, plus widget-specific props (`items`, `searchCallback`, `step`, etc.). Use them inside `useProvideForm()` exactly like any other `useField`-based widget.

The adapter bundles to ~3 kB gzipped. `ant-design-vue` and `dayjs` are externalized — they're declared as **optional peer dependencies**, so the core install doesn't drag them in.

## Server-driven validation schemas

A common pattern: the backend is the source of truth for validation rules. Fetch a schema on mount and install validators — including ones for array items that don't exist yet.

```ts
onMounted(async () => {
  const schema = await fetch('/api/validation/schema/vehicle').then((r) => r.json())
  // {
  //   "name":          [{ "kind": "required" }, { "kind": "minLen", "n": 3 }],
  //   "parts.*.sku":   [{ "kind": "required" }, { "kind": "maxLen", "n": 40 }],
  //   "parts.*.qty":   [{ "kind": "required" }, { "kind": "minNum", "n": 1 }],
  // }
  for (const [key, ruleList] of Object.entries(schema)) {
    const validators = ruleList.map(buildValidator)  // your rule-kind → Validator mapper
    if (key.includes('*')) formCtx.addFieldValidatorsByPattern(key, validators)
    else                   formCtx.setFieldValidators(key, validators)
  }
})
```

`addFieldValidatorsByPattern` is **additive** (layers on top of inline `:validators`) and **forward-applying** — when the user clicks "Add row" and a new field registers with attribute `parts.7.sku`, the matching pattern's validators are applied automatically.

`*` matches one dotted segment: `parts.*.sku` matches `parts.0.sku` but not `parts.0.attrs.sku`.

## Array fields

There is no `<NestedForm>`. Render `v-for` with a dotted attribute path and you have it:

```vue
<button type="button" @click="rows.push({ sku: '', qty: 1 })">Add row</button>
<table>
  <thead><tr><th>SKU</th><th>Qty</th><th /></tr></thead>
  <tbody>
    <tr v-for="(row, i) in rows" :key="i">
      <td>
        <TextInput
          v-model="row.sku"
          :attribute="`parts.${i}.sku`"
          :validators="[rules.uniqueIn(rows, i, 'sku')]"
        />
      </td>
      <td><NumberInput v-model="row.qty" :attribute="`parts.${i}.qty`" /></td>
      <td><button type="button" @click="rows.splice(i, 1)">Delete</button></td>
    </tr>
  </tbody>
</table>
```

Pair with `addFieldValidatorsByPattern("parts.*.sku", …)` and the schema-driven rules apply to every row, present and future. Server 422 errors with dotted field paths (`parts.0.sku`) attach to the right row out of the box via `setFieldErrors`.

## Examples

`examples/` is a runnable workspace with two demos that both consume `@einhasad/vue-form/ant-design`:

- **Ant Design (in-process mock)** — synthetic `services.ts`, no network.
- **Ant Design (MSW server-driven)** — real `fetch()` calls intercepted by [MSW v2](https://mswjs.io/), schema fetched from `GET /api/validation/schema/vehicle`, 422 envelopes decoded into per-field errors (incl. nested `parts.0.sku`).

The MSW demo is the closest to a production wire-up. Both views render an event log below the form so you can see the lifecycle (`request` / `response` / `field-error` / `validator` / …) as you interact.

```sh
npm install
npm run dev --workspace=examples   # http://localhost:5173
```

Both demo views show the full submit-orchestration pattern:
- `useProvideForm()` at the form root
- Validate sync → validate async → `send()` → translate 422 envelopes via `setFieldErrors` (incl. nested paths)
- Server-driven schema fetched on mount, with wildcard patterns for array rules

## Development

```sh
npm install
npm run dev --workspace=examples   # boots the demo at http://localhost:5173
npm test                           # 63 tests covering headless classes, rules, Vue bridge
npm run typecheck                  # vue-tsc, root + examples
npm run build                      # ESM + CJS bundles to dist/, with .d.ts via vite-plugin-dts
```

## License

MIT.
