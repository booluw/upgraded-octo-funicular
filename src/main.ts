import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { appNotification } from './components/AppNotification'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(appNotification)

app.mount('#app')
