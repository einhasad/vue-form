import 'ant-design-vue/dist/reset.css'
import './design-system.css'
import './style.css'
import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import { setStrings } from '@einhasad-vue/vue-form'
import customStrings from './locales/vue-form.en.json'
import App from './App.vue'

setStrings(customStrings)

async function bootstrap() {
  // MSW runs in dev AND prod so the published demo works without a backend.
  // serviceWorker.url must respect BASE_URL when deployed under a subpath
  // (e.g. https://einhasad.github.io/vue-form/).
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
  createApp(App).use(Antd).mount('#app')
}

bootstrap()
