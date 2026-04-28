<script setup lang="ts">
import { ref } from 'vue'
// The headless subpath has zero Vue dependencies — same Form/Field classes
// the Vue layer composes, usable from tests, server code, anywhere.
import { Form, Field, rules } from '@einhasad-vue/vue-form/headless'

const log = ref('')

function run() {
  const form = new Form()

  const name = new Field('name', [rules.required('Name'), rules.minLen(3, 'Name')], '')
  const email = new Field('email', [rules.required('Email'), rules.email('Email')], 'not-an-email')

  form.register(name)
  form.register(email)

  const ok = form.validateAll()

  log.value = JSON.stringify(
    {
      ok,
      fields: form.getFields().map((f) => ({
        attribute: f.attribute,
        errors: f.errors.map((e) => e.message),
      })),
    },
    null,
    2,
  )
}
</script>

<template>
  <div class="demo-form">
    <p class="ds-muted ds-small" style="margin: 0">
      Click run — no Vue components, no DOM. Just classes and arrays.
    </p>
    <div class="demo-form__actions">
      <button
        type="button"
        class="ds-btn ds-btn--primary ds-btn--sm"
        @click="run"
      >
        Run validation
      </button>
    </div>
    <pre
      v-if="log"
      class="demo-result"
    >{{ log }}</pre>
  </div>
</template>
