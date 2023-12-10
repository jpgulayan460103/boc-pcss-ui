// Dynamically import all modules under the plugins dir for the side effects
import.meta.glob('@/plugins/*.js', { eager: true })

// Register routes to the vueApp
import '@/routes.js'
import '@/style.css'

import VCalendar from 'v-calendar';
import 'v-calendar/style.css';
import SmartTable from 'vuejs-smart-table'

// Finally import the Vue instance that the above imports used
import { vueApp } from '@/app'

vueApp.mount('#app')
vueApp.use(VCalendar, {})
vueApp.use(SmartTable, {
    selectOnClick: false
})
