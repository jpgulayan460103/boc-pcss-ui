<script setup>

import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.js'
import { useThemeStore } from '@/stores/theme.js'
import Card from '@/components/Card.vue';
import { computed, ref } from 'vue';
import HomeIcon from './icons/HomeIcon.vue';
import UsersIcon from './icons/UsersIcon.vue';
import UserIcon from './icons/UserIcon.vue';
import { CalendarDaysIcon } from '@heroicons/vue/20/solid';

const router = useRouter()

const authStore = useAuthStore()
const themeStore = useThemeStore()
const route = useRoute();

const showLabels = ref(false);

const routeName = computed(() => route.name )

</script>

<template>
  <div class="fixed top-1/2 left-2 hidden md:inline z-50" @mouseenter="showLabels = true" @mouseleave="showLabels = false">
    <ul class="menu menu-xs bg-base-200 rounded-box">
      <li>
        <a href="#" @click="router.push({name: 'home'})" :class="{ 'active': routeName == 'home' }">
          <HomeIcon class="w-5 h-5" />
          <span v-if="showLabels">Home</span>
        </a>
      </li>
      <li v-if="authStore.authUser.role == 'admin'">
        <a href="#" @click="router.push({name: 'users'})" :class="{ 'active': routeName == 'users' }">
          <UsersIcon class="w-5 h-5" />
          <span v-if="showLabels">Users</span>
        </a>
      </li>
      <li>
        <a href="#" @click="router.push({name: 'employees'})" :class="{ 'active': routeName == 'employees' }">
          <UserIcon class="w-5 h-5" />
          <span v-if="showLabels">Employees</span>
        </a>
      </li>
      <li v-if="authStore.authUser.role == 'admin'">
        <a href="#" @click="router.push({name: 'schedules'})" :class="{ 'active': routeName == 'schedules' }">
          <CalendarDaysIcon class="w-5 h-5" />
          <span v-if="showLabels">Schedules</span>
        </a>
      </li>
    </ul>
  </div>

  <div class="container mx-auto">
    
    <div class="inline md:hidden">
    
    <ul class="menu menu-horizontal rounded-box">
      <li>
        <a>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          Home
        </a>
      </li>
      <li>
        <a>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Users
        </a>
      </li>
      <li>
        <a>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          Schedules
        </a>
      </li>
    </ul>
  </div>
  </div>
</template>

<style scoped>
</style>
