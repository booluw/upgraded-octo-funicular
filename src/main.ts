import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { appNotification } from './components/AppNotification'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(appNotification)

app.mount('#app')
