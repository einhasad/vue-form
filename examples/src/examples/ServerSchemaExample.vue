<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProvideForm, rules, type Validator } from '@einhasad-vue/vue-form'
import TextField from './widgets/TextField.vue'

const form = useProvideForm()
const data = ref({ name: '', description: '' })
const schemaText = ref('loading…')

type Rule =
  | { kind: 'required' }
  | { kind: 'minLen' | 'maxLen' | 'minNum' | 'maxNum'; n: number }
  | { kind: 'pattern'; re: string }

function buildValidator(r: Rule): Validator {
  if (r.kind === 'required') return rules.required()
  if (r.kind === 'minLen') return rules.minLen(r.n)
  if (r.kind === 'maxLen') return rules.maxLen(r.n)
  if (r.kind === 'minNum') return rules.minNum(r.n)
  if (r.kind === 'maxNum') return rules.maxNum(r.n)
  if (r.kind === 'pattern') return rules.pattern(new RegExp(r.re))
  throw new Error(`unknown kind: ${(r as { kind: string }).kind}`)
}

// Imagine this came from `GET /api/validation/schema/vehicle`.
const schema: Record<string, Rule[]> = {
  name: [{ kind: 'required' }, { kind: 'minLen', n: 3 }, { kind: 'maxLen', n: 60 }],
  description: [{ kind: 'maxLen', n: 200 }],
}

onMounted(async () => {
  await new Promise((r) => setTimeout(r, 200))
  schemaText.value = JSON.stringify(schema, null, 2)
  for (const [key, list] of Object.entries(schema)) {
    const validators = list.map(buildValidator)
    if (key.includes('*')) form.addFieldValidatorsByPattern(key, validators)
    else                   form.setFieldValidators(key, validators)
  }
})

function check() {
  form.clearErrors()
  form.validateAll()
}
</script>

<template>
  <div class="demo-split">
    <form
      class="demo-form"
      @submit.prevent="check"
    >
      <TextField
        v-model="data.name"
        attribute="name"
        label="Name"
      />
      <TextField
        v-model="data.description"
        attribute="description"
        label="Description"
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
    <pre class="demo-result">{{ schemaText }}</pre>
  </div>
</template>
