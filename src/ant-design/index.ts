// Optional adapter for Ant Design Vue. Imported via the `./ant-design`
// subpath (`@einhasad/vue-form/ant-design`). Requires the consumer to install
// `ant-design-vue` and `dayjs` and to register Antd globally:
//
//   import Antd from 'ant-design-vue'
//   import 'ant-design-vue/dist/reset.css'
//   app.use(Antd)
//
// `FormField` is a single scoped-slot wrapper around `<a-form-item>` that
// calls useField from the headless core and exposes a reactive `field`
// object — bring your own antd control inside the slot:
//
//   <FormField v-model="data.email" attribute="email" label="Email"
//              :validators="[rules.required(), rules.email()]"
//              v-slot="{ field }">
//     <a-input v-model:value="field.value" @blur="field.onBlur"
//              :status="field.status" />
//   </FormField>

export { default as FormField } from './FormField.vue'
