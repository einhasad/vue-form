import 'ant-design-vue/dist/reset.css'
import './design-system.css'
import './style.css'
import { createApp } from 'vue'
import {
  Alert,
  Button,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  TimePicker,
} from 'ant-design-vue'
import { setStrings } from '@einhasad-vue/vue-form'
import customStrings from './locales/vue-form.en.json'
import App from './App.vue'

setStrings(customStrings)

const antdComponents = [
  Alert,
  Button,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  TimePicker,
]

async function bootstrap() {
  // MSW runs in dev AND prod so the published demo works without a backend.
  // serviceWorker.url must respect BASE_URL when deployed under a subpath
  // (e.g. https://einhasad.github.io/vue-form/).
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
  const app = createApp(App)
  for (const component of antdComponents) app.use(component)
  app.mount('#app')
}

bootstrap()
