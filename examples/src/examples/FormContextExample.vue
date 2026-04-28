<script setup lang="ts">
import { ref } from 'vue'
import { useProvideForm, rules } from '@einhasad-vue/vue-form'
import TextField from './widgets/TextField.vue'

const form = useProvideForm()
const formErrors = form.formErrors

const data = ref({ name: '', email: '' })

function validate() {
  form.clearErrors()
  form.validateAll()
}

function injectFormError() {
  form.setFormErrors([
    { message: 'Server is currently unavailable. Try again later.' },
  ])
}

function injectFieldError() {
  form.setFieldErrors('email', [
    { message: 'This email is blacklisted', key: 'blacklist' },
  ])
}

function clearAll() {
  form.clearErrors()
}
</script>

<template>
  <form
    class="demo-form"
    @submit.prevent="validate"
  >
    <TextField
      v-model="data.name"
      attribute="name"
      label="Name"
      :validators="[rules.required('Name')]"
    />
    <TextField
      v-model="data.email"
      attribute="email"
      label="Email"
      :validators="[rules.required('Email'), rules.email('Email')]"
    />

    <div
      v-if="formErrors.length"
      class="demo-form__alert"
    >
      {{ formErrors.map((e) => e.message).join(' · ') }}
    </div>

    <div class="demo-form__actions">
      <button
        type="submit"
        class="ds-btn ds-btn--primary ds-btn--sm"
      >
        validateAll()
      </button>
      <button
        type="button"
        class="ds-btn ds-btn--outline ds-btn--sm"
        @click="injectFormError"
      >
        setFormErrors()
      </button>
      <button
        type="button"
        class="ds-btn ds-btn--outline ds-btn--sm"
        @click="injectFieldError"
      >
        setFieldErrors('email')
      </button>
      <button
        type="button"
        class="ds-btn ds-btn--ghost ds-btn--sm"
        @click="clearAll"
      >
        clearErrors()
      </button>
    </div>
  </form>
</template>
