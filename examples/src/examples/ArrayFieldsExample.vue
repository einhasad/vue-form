<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProvideForm, rules } from '@einhasad/vue-form'
import TextField from './widgets/TextField.vue'

interface Part { sku: string; qty: string }

const form = useProvideForm()
const parts = ref<Part[]>([{ sku: '', qty: '1' }])

// Server-driven rules for *every* row, present and future.
onMounted(() => {
  form.addFieldValidatorsByPattern('parts.*.sku', [
    rules.required('SKU'),
    rules.maxLen(40, 'SKU'),
  ])
  form.addFieldValidatorsByPattern('parts.*.qty', [
    rules.required('Qty'),
    rules.minNum(1, 'Qty'),
  ])
})

function addRow() { parts.value.push({ sku: '', qty: '1' }) }
function removeRow(i: number) { parts.value.splice(i, 1) }

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
    <table class="demo-table">
      <thead>
        <tr>
          <th style="width: 50%">
            SKU
          </th>
          <th style="width: 30%">
            Qty
          </th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in parts"
          :key="i"
        >
          <td>
            <TextField
              v-model="row.sku"
              :attribute="`parts.${i}.sku`"
              :validators="[rules.uniqueIn(parts, i, 'sku')]"
            />
          </td>
          <td>
            <TextField
              v-model="row.qty"
              :attribute="`parts.${i}.qty`"
              type="number"
            />
          </td>
          <td>
            <button
              type="button"
              class="ds-btn ds-btn--ghost ds-btn--sm"
              @click="removeRow(i)"
            >
              Remove
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="demo-form__actions">
      <button
        type="button"
        class="ds-btn ds-btn--outline ds-btn--sm"
        @click="addRow"
      >
        + Add row
      </button>
      <button
        type="submit"
        class="ds-btn ds-btn--primary ds-btn--sm"
      >
        Validate
      </button>
    </div>
  </form>
</template>
