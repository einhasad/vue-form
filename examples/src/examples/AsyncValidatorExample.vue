<script setup lang="ts">
import { ref } from 'vue'
import { useProvideForm, rules, type Validator } from '@einhasad/vue-form'
import TextField from './widgets/TextField.vue'

const form = useProvideForm()
const data = ref({ vin: '' })
const status = ref<'idle' | 'checking' | 'ok' | 'taken'>('idle')

// Async validators are plain functions returning Promise<FieldError | undefined>.
// Anything that needs a network round-trip lives here.
const vinUnique: Validator = async (v) => {
  if (!v) return undefined
  status.value = 'checking'
  await new Promise((r) => setTimeout(r, 600))
  const taken = String(v).toUpperCase().startsWith('TAKEN')
  status.value = taken ? 'taken' : 'ok'
  return taken ? { message: `${v} is already registered`, key: 'vinUnique' } : undefined
}

async function onSubmit() {
  form.clearErrors()
  if (!form.validateAll()) return
  if (!(await form.validateAllAsync())) return
  status.value = 'ok'
}
</script>

<template>
  <form
    class="demo-form"
    @submit.prevent="onSubmit"
  >
    <TextField
      v-model="data.vin"
      attribute="vin"
      label="VIN — type `TAKEN…` to trigger async failure"
      placeholder="e.g. 1HGCM82633A004352"
      :validators="[rules.required('VIN'), vinUnique]"
    />

    <div class="demo-form__actions">
      <button
        type="submit"
        class="ds-btn ds-btn--primary ds-btn--sm"
      >
        Validate (sync + async)
      </button>
      <span
        v-if="status === 'checking'"
        class="ds-muted ds-small"
      >
        checking server…
      </span>
      <span
        v-else-if="status === 'ok'"
        class="ds-small"
        style="color: var(--success)"
      >
        ✓ available
      </span>
      <span
        v-else-if="status === 'taken'"
        class="ds-small"
        style="color: var(--danger)"
      >
        ✗ taken
      </span>
    </div>
  </form>
</template>
