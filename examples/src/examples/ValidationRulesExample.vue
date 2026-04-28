<script setup lang="ts">
import { ref } from 'vue'
import { useProvideForm, rules } from '@einhasad-vue/vue-form'
import TextField from './widgets/TextField.vue'

const form = useProvideForm()
const data = ref({
  name: '',
  bio: '',
  email: '',
  age: '',
  zip: '',
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
      label="Name (required, minLen 3, maxLen 20)"
      :validators="[rules.required('Name'), rules.minLen(3, 'Name'), rules.maxLen(20, 'Name')]"
    />
    <TextField
      v-model="data.email"
      attribute="email"
      label="Email (email)"
      :validators="[rules.email('Email')]"
    />
    <TextField
      v-model="data.age"
      attribute="age"
      label="Age (minNum 18, maxNum 120)"
      :validators="[rules.minNum(18, 'Age'), rules.maxNum(120, 'Age')]"
    />
    <TextField
      v-model="data.zip"
      attribute="zip"
      label="ZIP (pattern \\d{5})"
      :validators="[rules.pattern(/^\d{5}$/, 'ZIP', 'Must be 5 digits')]"
    />
    <TextField
      v-model="data.bio"
      attribute="bio"
      label="Bio (maxLen 100)"
      :validators="[rules.maxLen(100, 'Bio')]"
    />

    <div class="demo-form__actions">
      <button
        type="submit"
        class="ds-btn ds-btn--primary ds-btn--sm"
      >
        Validate all
      </button>
    </div>
  </form>
</template>
