<script setup lang="ts">
import { ref } from 'vue'
import { useProvideForm, rules } from '@einhasad-vue/vue-form'
// One scoped-slot wrapper, drop in any antd component you like.
import { FormField } from '@einhasad-vue/vue-form/ant-design'

const form = useProvideForm()
const data = ref({
  name: '',
  category: null as string | null,
  releaseDate: null as unknown,
  acceptsTerms: false,
})

const categoryOptions = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'truck', label: 'Truck' },
]

function check() {
  form.clearErrors()
  form.validateAll()
}
</script>

<template>
  <a-form
    layout="vertical"
    @submit.prevent="check"
  >
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
        @blur="field.onBlur"
      />
    </FormField>

    <FormField
      v-model="data.category"
      attribute="category"
      label="Category"
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
      v-model="data.releaseDate"
      attribute="releaseDate"
      label="Release date"
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
      v-model="data.acceptsTerms"
      attribute="acceptsTerms"
      :label="false"
      :validators="[(v: unknown) => (v ? undefined : { message: 'You must accept the terms', key: 'mustAccept' })]"
      v-slot="{ field }"
    >
      <a-checkbox
        v-model:checked="field.value"
        @blur="field.onBlur"
      >
        I accept the terms
      </a-checkbox>
    </FormField>

    <div class="demo-form__actions">
      <a-button
        type="primary"
        html-type="submit"
      >
        Validate
      </a-button>
    </div>
  </a-form>
</template>
