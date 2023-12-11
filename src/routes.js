import { createRouter, createWebHistory } from 'vue-router'
import UserPage from '@/pages/UserPage.vue'
import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import SchedulePage from '@/pages/SchedulePage.vue'
import { vueApp } from '@/app.js'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

const routes = [
  {
    path: '',
    name: 'home',
    component: HomePage,
    meta: {
      label: 'Home',
      hasNavBar: true,
      auth: false,
    },
  },
  {
    path: '/users',
    name: 'users',
    component: UserPage,
    meta: {
      label: 'Users',
      hasNavBar: true,
      auth: true,
    },
  },
  {
    path: '/schedules',
    name: 'schedules',
    component: SchedulePage,
    meta: {
      label: 'Schedules',
      hasNavBar: true,
      auth: true,
    },
  },
  {
    path: '/auth/login',
    name: 'auth-login',
    component: LoginPage,
    meta: {
      label: 'Login',
      hasNavBar: false,
      auth: false,
    },
  },
//   {
//     path: '/:catchAll(.*)',
//     name: 'not-found',
//     component: () => import('@/views/misc/404Page.vue'),
//     meta: {
//       label: 'Page not found',
//     },
//   },
]


const appName = "PCSS"

const router = createRouter({
  history: createWebHistory(),
  routes,
})


router.beforeEach(async (to, from) => {
  // Always scroll to the top of the page
  window.scrollTo(0, 0)

  if (to.name === 'auth') {
    // Redirect 'domain.com/auth' to 'domain.com/auth/sign-up'
    return { name: 'auth-login' }
  }

  if (authStore.isAuthenticated && to.name == "auth-login") {
    return { name: 'home' }
  }

  // Protect routes that need authentication
  if (to.meta.auth && !authStore.isAuthenticated) {
    return { name: 'auth-login' }
  }

  // Change the browser tab title
  document.title = `${appName} | ${to.meta.label}` || appName
})


vueApp.use(router)
