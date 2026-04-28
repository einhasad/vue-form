<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  useProvideForm,
  rules,
  type Validator,
} from '@einhasad-vue/vue-form'
import { FormField } from '@einhasad-vue/vue-form/ant-design'
import { vehicleApi, validationApi, partLookupApi, type ServerRule } from '../services-msw'
import { useEventLog } from '../composables/useEventLog'
import EventConsole from '../components/EventConsole.vue'

const { events, log, clear: clearLog } = useEventLog()

const formCtx = useProvideForm()
const formErrors = formCtx.formErrors
const loading = formCtx.loading
const submitted = ref<unknown>(null)
const lastResponse = ref<{ status: number; body: unknown } | null>(null)

interface Part {
  id: number | string | null
  sku: string
  qty: number
  note: string
}

const data = ref({
  vin: '',
  name: '',
  description: '',
  category: null as string | null,
  features: [] as string[],
  fuel: 'gasoline' as string,
  active: true,
  price: 0 as number | null,
  ownerPhone: '',
  releaseDate: null as unknown,
  pickupRange: null as unknown,
  showtime: null as unknown,
  primaryPartId: null as number | string | null,
  acceptsTerms: false,
  parts: [
    { id: null, sku: '', qty: 1, note: '' } as Part,
  ],
})

const categoryOptions = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv',   label: 'SUV' },
  { value: 'truck', label: 'Truck' },
]
const featureOptions = [
  { value: 'sunroof', label: 'Sunroof' },
  { value: 'leather', label: 'Leather seats' },
  { value: 'heated',  label: 'Heated seats' },
]
const fuelOptions = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel',   label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
]

const partSearchOptions = ref<{ value: number | string; label: string }[]>([])
const partSearching = ref(false)

async function onPartSearch(query: string) {
  if (!query) {
    partSearchOptions.value = []
    return
  }
  partSearching.value = true
  try {
    const items = await partLookupApi.search(query)
    partSearchOptions.value = items.map((it) => ({ value: it.id, label: it.name }))
  } finally {
    partSearching.value = false
  }
}

function buildValidator(r: ServerRule): Validator {
  if (r.kind === 'required') return rules.required()
  if (r.kind === 'minLen')   return rules.minLen(r.n)
  if (r.kind === 'maxLen')   return rules.maxLen(r.n)
  if (r.kind === 'minNum')   return rules.minNum(r.n)
  if (r.kind === 'maxNum')   return rules.maxNum(r.n)
  if (r.kind === 'pattern')  return rules.pattern(new RegExp(r.re))
  throw new Error(`unknown server rule kind: ${(r as { kind: string }).kind}`)
}

function isErrorEnvelope(b: unknown): b is { result: { field: string; message: string }[] } {
  return (
    !!b &&
    typeof b === 'object' &&
    Array.isArray((b as { result?: unknown }).result)
  )
}

async function onSubmit() {
  formCtx.clearErrors()
  submitted.value = null
  lastResponse.value = null
  if (!formCtx.validateAll()) {
    log('info', 'sync validation blocked submit')
    return
  }
  if (!(await formCtx.validateAllAsync())) {
    log('info', 'async validation blocked submit')
    return
  }
  loading.value = true
  try {
    const payload = { ...data.value, name: data.value.name.trim() }
    log('request', 'POST /api/vehicles', payload)
    const result = await vehicleApi.create(payload)
    submitted.value = result
    lastResponse.value = { status: 201, body: result }
    log('response', '201 Created', result)
  } catch (raw) {
    onFail(raw)
  } finally {
    loading.value = false
  }
}

function onFail(raw: unknown) {
  const r = raw as { response?: { status?: number; data?: unknown }; message?: string }
  const status = r?.response?.status
  const body = r?.response?.data
  lastResponse.value = { status: status ?? 0, body: body ?? r?.message ?? raw }

  if (status === 422 && isErrorEnvelope(body)) {
    log('response', `422 Unprocessable Entity (${body.result.length} field error(s))`, body)
    for (const e of body.result) {
      formCtx.setFieldErrors(e.field, [{ message: e.message }])
      log('field-error', `${e.field}: ${e.message}`)
    }
    return
  }

  log('fail', `submit failed (${status ?? 'network'})`, body ?? raw)
  formCtx.setFormErrors([
    { message: typeof raw === 'string' ? raw : (r?.message ?? `Submit failed (${status ?? 'network'})`) },
  ])
}

function resetErrors() {
  formCtx.clearErrors()
  submitted.value = null
  lastResponse.value = null
}

// --- Parts array helpers (manual NestedForm replacement) ---------------
function newPart(): Part {
  return { id: null, sku: '', qty: 1, note: '' }
}

function addPart() {
  data.value.parts = [...data.value.parts, newPart()]
}

function removePart(i: number) {
  data.value.parts = data.value.parts.filter((_, idx) => idx !== i)
}

function tempId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `temp-${crypto.randomUUID()}`
  }
  return `temp-${Math.random().toString(36).slice(2)}`
}

function clonePart(i: number) {
  const cloned = JSON.parse(JSON.stringify(data.value.parts[i])) as Part
  cloned.id = tempId()
  const next = [...data.value.parts]
  next.splice(i + 1, 0, cloned)
  data.value.parts = next
}

onMounted(async () => {
  log('request', 'GET /api/validation/schema/vehicle')
  const schema = await validationApi.getSchema('vehicle')
  log('response', `schema received (${Object.keys(schema).length} key(s))`, schema)
  for (const [key, ruleList] of Object.entries(schema)) {
    const validators = ruleList.map(buildValidator)
    if (key.includes('*')) {
      formCtx.addFieldValidatorsByPattern(key, validators)
    } else {
      formCtx.setFieldValidators(key, validators)
    }
  }
  log('info', 'schema-driven validators wired', Object.keys(schema))

  const vinUniqueOnServer: Validator = async (v) => {
    if (v == null || v === '') return undefined
    log('request', `GET /api/validation/vin-taken/${v}`)
    const taken = await validationApi.isVinTaken(String(v))
    log('response', `vin-taken → ${taken}`)
    return taken ? { message: `${v} is already registered`, key: 'vinUnique' } : undefined
  }
  formCtx.addFieldValidator('vin', vinUniqueOnServer)
})
</script>

<template>
  <div class="msw-banner">
    <strong>MSW-backed example</strong> — every request below is a real
    <code>fetch()</code> call, intercepted by a Service Worker. Open DevTools →
    Network to watch the traffic. Validation rules come from
    <code>GET /api/validation/schema/vehicle</code>; submit posts to
    <code>POST /api/vehicles</code> and decodes a 422 envelope into per-field
    errors — including <em>nested</em> fields like <code>parts.0.sku</code>.
  </div>

  <p class="hint">
    Triggers built into the mock backend:
    <code>name = reject</code> → 422 on <code>name</code>;
    <code>name = crash</code> → 500;
    <code>VIN</code> starting with <code>TAKEN</code> → async + submit-time errors;
    a row's <code>SKU = BUSY</code> → 422 on <code>parts.&lt;i&gt;.sku</code>.
  </p>

  <a-form layout="vertical" @submit.prevent="onSubmit">
    <fieldset :disabled="loading" class="fields">
      <FormField
        v-model="data.vin"
        attribute="vin"
        label="VIN"
        required
        :validators="[
          rules.required('VIN'),
          rules.pattern(/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN', 'VIN must be 17 chars, no I/O/Q'),
        ]"
        v-slot="{ field }"
      >
        <a-input
          v-model:value="field.value"
          :status="field.status"
          placeholder="17-character VIN (try `TAKEN…` to trigger async uniqueness)"
          @blur="field.onBlur"
        />
      </FormField>

      <FormField
        v-model="data.name"
        attribute="name"
        label="Name"
        required
        :validators="[rules.required('Name')]"
        v-slot="{ field }"
      >
        <a-input
          v-model:value="field.value"
          :status="field.status"
          placeholder="Try `reject` for a 422 response, `crash` for a 500"
          @blur="field.onBlur"
        />
      </FormField>

      <FormField
        v-model="data.description"
        attribute="description"
        label="Description"
        v-slot="{ field }"
      >
        <a-textarea
          v-model:value="field.value"
          :status="field.status"
          @blur="field.onBlur"
        />
      </FormField>

      <FormField
        v-model="data.category"
        attribute="category"
        label="Category"
        required
        :validators="[rules.required('Category')]"
        v-slot="{ field }"
      >
        <a-select
          v-model:value="field.value"
          :options="categoryOptions"
          :status="field.status"
          allow-clear
          @blur="field.onBlur"
        />
      </FormField>

      <FormField
        v-model="data.features"
        attribute="features"
        label="Features"
        v-slot="{ field }"
      >
        <a-checkbox-group v-model:value="field.value" :options="featureOptions" />
      </FormField>

      <FormField
        v-model="data.fuel"
        attribute="fuel"
        label="Fuel"
        v-slot="{ field }"
      >
        <a-radio-group v-model:value="field.value" :options="fuelOptions" />
      </FormField>

      <FormField
        v-model="data.active"
        attribute="active"
        label="Active in catalog"
        v-slot="{ field }"
      >
        <a-switch v-model:checked="field.value" />
      </FormField>

      <FormField
        v-model="data.price"
        attribute="price"
        label="MSRP"
        :validators="[rules.minNum(0, 'MSRP')]"
        v-slot="{ field }"
      >
        <a-input-number
          v-model:value="field.value"
          :status="field.status"
          :step="0.01"
          style="width: 100%"
          @blur="field.onBlur"
        />
      </FormField>

      <FormField
        v-model="data.ownerPhone"
        attribute="ownerPhone"
        label="Owner phone"
        v-slot="{ field }"
      >
        <a-input
          v-model:value="field.value"
          :status="field.status"
          @blur="field.onBlur"
        />
      </FormField>

      <FormField
        v-model="data.releaseDate"
        attribute="releaseDate"
        label="Release date"
        required
        :validators="[rules.required('Release date')]"
        v-slot="{ field }"
      >
        <a-date-picker
          v-model:value="field.value"
          :status="field.status"
          style="width: 100%"
          @blur="field.onBlur"
        />
      </FormField>

      <FormField
        v-model="data.pickupRange"
        attribute="pickupRange"
        label="Pickup window"
        v-slot="{ field }"
      >
        <a-range-picker
          v-model:value="field.value"
          :status="field.status"
          style="width: 100%"
          @blur="field.onBlur"
        />
      </FormField>

      <FormField
        v-model="data.showtime"
        attribute="showtime"
        label="Daily showtime"
        v-slot="{ field }"
      >
        <a-time-picker
          v-model:value="field.value"
          :status="field.status"
          style="width: 100%"
          @blur="field.onBlur"
        />
      </FormField>

      <FormField
        v-model="data.primaryPartId"
        attribute="primaryPart"
        label="Primary part"
        required
        :validators="[rules.required('Primary part')]"
        v-slot="{ field }"
      >
        <a-select
          v-model:value="field.value"
          :options="partSearchOptions"
          :loading="partSearching"
          :status="field.status"
          show-search
          allow-clear
          :filter-option="false"
          placeholder="Type to search…"
          @search="onPartSearch"
          @blur="field.onBlur"
        />
      </FormField>

      <FormField
        v-model="data.acceptsTerms"
        attribute="acceptsTerms"
        :label="false"
        :validators="[
          (v: unknown) => (v ? undefined : { message: 'You must accept the terms', key: 'mustAccept' }),
        ]"
        v-slot="{ field }"
      >
        <a-checkbox v-model:checked="field.value">I accept the terms</a-checkbox>
      </FormField>

      <h3 class="parts-heading">Parts (try SKU = <code>BUSY</code> to fire a nested-field server error)</h3>
      <div class="parts-toolbar">
        <span class="parts-toolbar__count">{{ data.parts.length }} part{{ data.parts.length === 1 ? '' : 's' }}</span>
        <a-button type="primary" size="small" @click="addPart">+ Add part</a-button>
      </div>
      <table class="parts-table">
        <thead>
          <tr>
            <th style="width: 160px">SKU</th>
            <th style="width: 100px">Qty</th>
            <th>Note</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in data.parts" :key="index">
            <td>
              <!-- required / minLen / maxLen come from "parts.*.sku" pattern. -->
              <FormField
                v-model="row.sku"
                :attribute="`parts.${index}.sku`"
                :label="false"
                :validators="[
                  rules.uniqueIn(data.parts, index, 'sku'),
                  async (v) => {
                    if (!v) return undefined
                    const taken = await validationApi.isSkuTaken(String(v))
                    return taken ? { message: 'SKU already used elsewhere', key: 'skuTaken' } : undefined
                  },
                ]"
                v-slot="{ field }"
              >
                <a-input
                  v-model:value="field.value"
                  :status="field.status"
                  @blur="field.onBlur"
                />
              </FormField>
            </td>
            <td>
              <FormField
                v-model="row.qty"
                :attribute="`parts.${index}.qty`"
                :label="false"
                v-slot="{ field }"
              >
                <a-input-number
                  v-model:value="field.value"
                  :status="field.status"
                  style="width: 100%"
                  @blur="field.onBlur"
                />
              </FormField>
            </td>
            <td>
              <FormField
                v-model="row.note"
                :attribute="`parts.${index}.note`"
                :label="false"
                v-slot="{ field }"
              >
                <a-input
                  v-model:value="field.value"
                  :status="field.status"
                  @blur="field.onBlur"
                />
              </FormField>
            </td>
            <td class="parts-actions">
              <a-button size="small" @click="clonePart(index)">Clone</a-button>
              <a-button size="small" danger @click="removePart(index)">Delete</a-button>
            </td>
          </tr>
        </tbody>
      </table>
    </fieldset>

    <a-alert
      v-if="formErrors.length"
      type="error"
      show-icon
      :message="formErrors.map((e) => e.message).join(', ')"
      style="margin-top: 1rem"
    />

    <div class="actions">
      <a-button type="primary" html-type="submit" :loading="loading">{{ loading ? 'Saving…' : 'Save vehicle' }}</a-button>
      <a-button @click="resetErrors">Reset errors</a-button>
    </div>
  </a-form>

  <pre v-if="submitted" class="result result--ok">[201] {{ submitted }}</pre>
  <pre v-else-if="lastResponse" class="result result--err">[{{ lastResponse.status }}] {{ lastResponse.body }}</pre>

  <EventConsole :events="events" @clear="clearLog" />
</template>

<style scoped>
.msw-banner {
  background: #f0f9ff;
  border: 1px solid #7dd3fc;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
}
.fields { border: none; padding: 0; }
.actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.parts-heading { margin: 1.5rem 0 0.5rem; font-size: 1rem; }
.parts-toolbar {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #fafafa; border: 1px solid #f0f0f0; border-bottom: 0;
  border-radius: 4px 4px 0 0;
}
.parts-toolbar__count { color: #555; font-size: 0.85rem; flex: 1; }
.parts-table {
  width: 100%; border-collapse: collapse;
  border: 1px solid #f0f0f0; border-radius: 0 0 4px 4px; overflow: hidden;
}
.parts-table th, .parts-table td {
  padding: 0.5rem; border-bottom: 1px solid #f0f0f0; vertical-align: top; text-align: left;
}
.parts-table th { background: #fafafa; font-size: 0.85rem; color: #555; font-weight: 500; }
.parts-table tr:last-child td { border-bottom: none; }
.parts-actions { white-space: nowrap; }
.parts-actions .ant-btn + .ant-btn { margin-left: 0.25rem; }
.result { padding: 0.75rem; border-radius: 4px; margin-top: 1rem; font-size: 0.85rem; overflow: auto; }
.result--ok { background: #f0fdf4; border: 1px solid #86efac; }
.result--err { background: #fef2f2; border: 1px solid #fca5a5; }
</style>
