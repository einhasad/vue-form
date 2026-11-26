<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import {
  useProvideForm,
  rules,
  getStrings,
  setStrings,
  resetStrings,
  type Strings,
} from '@einhasad-vue/vue-form'
import TextField from './widgets/TextField.vue'

const form = useProvideForm()
const data = ref({ email: '', name: '' })
const german = ref(false)

const de: Partial<Strings> = {
  required: '{attr} darf nicht leer sein',
  minLen: '{attr} muss mindestens {min} Zeichen haben',
  email: '{attr} muss eine gültige E-Mail-Adresse sein',
}

let before: Strings | null = null

function switchToGerman() {
  before = { ...getStrings() }
  setStrings(de)
}

function restoreStrings() {
  if (!before) return
  resetStrings()
  setStrings(before)
  before = null
}

watch(german, (on) => {
  if (on) switchToGerman()
  else restoreStrings()
  if (form.hasErrors()) check()
})

function check() {
  form.clearErrors()
  form.validateAll()
}

onUnmounted(restoreStrings)
</script>

<template>
  <form
    class="demo-form"
    @submit.prevent="check"
  >
    <p
      class="ds-muted ds-small"
      style="margin: 0"
    >
      Strings are global per app: while German is on, every form on this page
      shows German messages. Turning it off restores the strings that were set before.
    </p>
    <label style="display: flex; align-items: center; gap: 8px">
      <input
        v-model="german"
        type="checkbox"
      >
      Show messages in German
    </label>
    <TextField
      v-model="data.name"
      attribute="name"
      label="Name (required, min 2)"
      :validators="[rules.required('Name'), rules.minLen(2, 'Name')]"
    />
    <TextField
      v-model="data.email"
      attribute="email"
      label="E-Mail"
      :validators="[rules.required('E-Mail'), rules.email('E-Mail')]"
    />

    <div class="demo-form__actions">
      <button
        type="submit"
        class="ds-btn ds-btn--primary ds-btn--sm"
      >
        Validate
      </button>
    </div>
  </form>
</template>
