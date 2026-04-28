<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useProvideForm, rules, setStrings, resetStrings } from '@einhasad-vue/vue-form'
import TextField from './widgets/TextField.vue'

const form = useProvideForm()
const data = ref({ email: '', name: '' })

onMounted(() => {
  // Override built-in messages — typed against the canonical Strings shape.
  setStrings({
    required: '{attr} darf nicht leer sein',
    minLen: '{attr} muss mindestens {min} Zeichen haben',
    email: '{attr} muss eine gültige E-Mail-Adresse sein',
  })
})

onUnmounted(() => {
  resetStrings()
})

function check() {
  form.clearErrors()
  form.validateAll()
}
</script>

<template>
  <form
    class="demo-form"
    @submit.prevent="check"
  >
    <TextField
      v-model="data.name"
      attribute="name"
      label="Name (Pflicht, min. 2)"
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
        Validieren
      </button>
    </div>
  </form>
</template>
