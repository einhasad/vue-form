<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useProvideForm, rules, type Validator } from '@einhasad-vue/vue-form'
import TextField from './widgets/TextField.vue'

const form = useProvideForm()
const data = ref({ name: '', description: '' })
const schemaText = ref('loading…')

type Rule =
  | { kind: 'required' }
  | { kind: 'minLen' | 'maxLen' | 'minNum' | 'maxNum'; n: number }
  | { kind: 'pattern'; re: string }

function buildValidator(r: Rule, label: string): Validator {
  if (r.kind === 'required') return rules.required(label)
  if (r.kind === 'minLen') return rules.minLen(r.n, label)
  if (r.kind === 'maxLen') return rules.maxLen(r.n, label)
  if (r.kind === 'minNum') return rules.minNum(r.n, label)
  if (r.kind === 'maxNum') return rules.maxNum(r.n, label)
  if (r.kind === 'pattern') return rules.pattern(new RegExp(r.re), label)
  throw new Error(`unknown kind: ${(r as { kind: string }).kind}`)
}

// Imagine this came from `GET /api/validation/schema/vehicle`.
const schema: Record<string, Rule[]> = {
  name: [{ kind: 'required' }, { kind: 'minLen', n: 3 }, { kind: 'maxLen', n: 60 }],
  description: [{ kind: 'maxLen', n: 200 }],
}

const labels: Record<string, string> = { name: 'Name', description: 'Description' }

let disposePatterns: (() => void)[] = []

function disposeSchema() {
  disposePatterns.forEach((dispose) => dispose())
  disposePatterns = []
}

function applySchema(source: Record<string, Rule[]>) {
  disposeSchema()
  for (const [key, list] of Object.entries(source)) {
    const validators = list.map((r) => buildValidator(r, labels[key] ?? key))
    if (key.includes('*')) disposePatterns.push(form.addFieldValidatorsByPattern(key, validators))
    else                   form.setFieldValidators(key, validators)
  }
}

onMounted(async () => {
  await new Promise((r) => setTimeout(r, 200))
  schemaText.value = JSON.stringify(schema, null, 2)
  applySchema(schema)
})

onUnmounted(disposeSchema)

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
        :label="labels.name"
      />
      <TextField
        v-model="data.description"
        attribute="description"
        :label="labels.description"
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
