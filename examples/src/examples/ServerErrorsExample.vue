<script setup lang="ts">
import { ref } from 'vue'
import { useProvideForm, rules } from '@einhasad-vue/vue-form'
import TextField from './widgets/TextField.vue'

const form = useProvideForm()
const data = ref({ username: '', email: '' })
const submitting = ref(false)
const result = ref<string>('')

// Mock submit. Returns a 422-shaped envelope when username = "taken".
async function send(payload: typeof data.value) {
  await new Promise((r) => setTimeout(r, 400))
  if (payload.username.toLowerCase() === 'taken') {
    throw {
      response: {
        status: 422,
        data: {
          result: [
            { field: 'username', message: 'Username already in use' },
            { field: 'email', message: 'Email looks suspicious' },
          ],
        },
      },
    }
  }
  return { id: Math.floor(Math.random() * 1e6), ...payload }
}

async function onSubmit() {
  form.clearErrors()
  result.value = ''
  if (!form.validateAll()) return
  submitting.value = true
  try {
    const r = await send(data.value)
    result.value = `Created user #${r.id}`
  } catch (raw) {
    const r = raw as { response?: { status?: number; data?: { result?: { field: string; message: string }[] } } }
    if (r?.response?.status === 422 && Array.isArray(r.response.data?.result)) {
      for (const e of r.response.data.result) {
        form.setFieldErrors(e.field, [{ message: e.message }])
      }
    } else {
      form.setFormErrors([{ message: 'Submit failed' }])
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form
    class="demo-form"
    @submit.prevent="onSubmit"
  >
    <fieldset :disabled="submitting">
      <TextField
        v-model="data.username"
        attribute="username"
        label="Username — type `taken` to trigger a 422"
        :validators="[rules.required('Username')]"
      />
      <TextField
        v-model="data.email"
        attribute="email"
        label="Email"
        :validators="[rules.required('Email'), rules.email('Email')]"
      />
    </fieldset>

    <div class="demo-form__actions">
      <button
        type="submit"
        class="ds-btn ds-btn--primary ds-btn--sm"
        :disabled="submitting"
      >
        {{ submitting ? 'Submitting…' : 'Submit' }}
      </button>
    </div>

    <div
      v-if="result"
      class="demo-form__alert demo-form__alert--success"
    >
      {{ result }}
    </div>
  </form>
</template>
