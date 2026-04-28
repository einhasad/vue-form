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
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' },
    })
  }
  createApp(App).use(Antd).mount('#app')
}

bootstrap()
