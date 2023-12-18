<script setup>
import { onMounted, ref } from 'vue';
import NavBar from './NavBar.vue';
import MenuBar from './MenuBar.vue';
import axios from 'axios';

import { useRoute } from 'vue-router'

const route = useRoute()

import { useAuthStore } from '@/stores/auth.js'
import { useThemeStore } from '@/stores/theme.js'
import Card from '@/components/Card.vue';

const authStore = useAuthStore();
const themeStore = useThemeStore();

const useSleep = (seconds) => {
  return new Promise((res) => {
    setTimeout(() => {
      res(true)
    }, seconds * 1000)
  })
}



onMounted(async () => {
  useSleep(0.5);
  if(localStorage.getItem('auth-token')){
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('auth-token')}`;

    await authStore.getUser();
    await authStore.getIsAuth();
    themeStore.getTheme();
  }
})
</script>

<template>
  <div :data-theme="themeStore.theme" style="min-height: 100vh;">
    <NavBar v-if="route.meta.hasNavBar" />
    <MenuBar v-if="route.meta.hasNavBar" />
    
    <div class="flex bg-base-300 min-h-screen pt-4">
      <router-view v-slot="{ Component }">
          <transition
            enter-active-class="transition duration-300"
            enter-from-class="translate-x-[20%] opacity-0"
            leave-to-class="opacity-0"
          >
            <component :is="Component" />
          </transition>
        </router-view>
    </div>
  </div>
</template>

<style scoped>
</style>
