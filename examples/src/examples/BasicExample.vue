<script setup lang="ts">
import { ref } from 'vue'
import { useProvideForm, rules } from '@einhasad/vue-form'
import TextField from './widgets/TextField.vue'

const form = useProvideForm()
const data = ref({ name: '', email: '' })
const submitted = ref<unknown>(null)

async function onSubmit() {
  form.clearErrors()
  submitted.value = null
  if (!form.validateAll()) return
  submitted.value = { ...data.value }
}
</script>

<template>
  <form
    class="demo-form"
    @submit.prevent="onSubmit"
  >
    <TextField
      v-model="data.name"
      attribute="name"
      label="Name"
      required
      :validators="[rules.required('Name'), rules.minLen(2, 'Name')]"
    />
    <TextField
      v-model="data.email"
      attribute="email"
      label="Email"
      type="email"
      required
      :validators="[rules.required('Email'), rules.email('Email')]"
    />

    <div class="demo-form__actions">
      <button
        type="submit"
        class="ds-btn ds-btn--primary ds-btn--sm"
      >
        Submit
      </button>
    </div>

    <pre
      v-if="submitted"
      class="demo-result"
    >{{ submitted }}</pre>
  </form>
</template>
