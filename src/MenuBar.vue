<script setup>

import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.js'
import { useThemeStore } from '@/stores/theme.js'
import Card from '@/components/Card.vue';
import { computed, ref } from 'vue';
import HomeIcon from './icons/HomeIcon.vue';
import UsersIcon from './icons/UsersIcon.vue';
import UserIcon from './icons/UserIcon.vue';
import WalletIcon from './icons/WalletIcon.vue';
import CalendarDaysIcon from './icons/CalendarDaysIcon.vue';

const router = useRouter()

const authStore = useAuthStore()
const themeStore = useThemeStore()
const route = useRoute();

const showLabels = ref(false);

const routeName = computed(() => route.name )

</script>

<template>
  <div class="fixed top-1/2 left-1.5 hidden md:inline z-50" @mouseenter="showLabels = true" @mouseleave="showLabels = false">
    <ul class="menu menu-xs bg-base-200 rounded-box p-0">
      <li>
        <a href="#" class="p-2 rounded-box" @click="router.push({name: 'home'})" :class="{ 'active': routeName == 'home' }">
          <HomeIcon class="w-5 h-5" />
          <span v-if="showLabels">Home</span>
        </a>
      </li>
      <li v-if="authStore.authUser.role == 'admin'">
        <a href="#" class="p-2 rounded-box" @click="router.push({name: 'users'})" :class="{ 'active': routeName == 'users' }">
          <UsersIcon class="w-5 h-5" />
          <span v-if="showLabels">Users</span>
        </a>
      </li>
      <li>
        <a href="#" class="p-2 rounded-box" @click="router.push({name: 'employees'})" :class="{ 'active': routeName == 'employees' }">
          <UserIcon class="w-5 h-5" />
          <span v-if="showLabels">Employees</span>
        </a>
      </li>
      <li v-if="authStore.authUser.role == 'admin'">
        <a href="#" class="p-2 rounded-box" @click="router.push({name: 'schedules'})" :class="{ 'active': routeName == 'schedules' }">
          <CalendarDaysIcon class="w-5 h-5" />
          <span v-if="showLabels">Generate Schedules</span>
        </a>
      </li>
      <li v-if="authStore.authUser.role == 'admin'">
        <a href="#" class="p-2 rounded-box" @click="router.push({name: 'offices'})" :class="{ 'active': routeName == 'offices' }">
          <WalletIcon class="w-5 h-5" />
          <span v-if="showLabels">Offices</span>
        </a>
      </li>
    </ul>
  </div>

  <div class="container mx-auto">
    
    <div class="inline md:hidden">
    
    <ul class="menu menu-horizontal rounded-box">
      <li>
        <a href="#" class="p-2 rounded-box" @click="router.push({name: 'home'})" :class="{ 'active': routeName == 'home' }">
          <HomeIcon class="w-5 h-5" />
          Home
        </a>
      </li>
      <li v-if="authStore.authUser.role == 'admin'">
        <a href="#" class="p-2 rounded-box" @click="router.push({name: 'users'})" :class="{ 'active': routeName == 'users' }">
          <UsersIcon class="w-5 h-5" />
          Users
        </a>
      </li>
      <li>
        <a href="#" class="p-2 rounded-box" @click="router.push({name: 'employees'})" :class="{ 'active': routeName == 'employees' }">
          <UserIcon class="w-5 h-5" />
          Employees
        </a>
      </li>
      <li v-if="authStore.authUser.role == 'admin'">
        <a href="#" class="p-2 rounded-box" @click="router.push({name: 'schedules'})" :class="{ 'active': routeName == 'schedules' }">
          <CalendarDaysIcon class="w-5 h-5" />
          Generate Schedules
        </a>
      </li>
      <li v-if="authStore.authUser.role == 'admin'">
        <a href="#" class="p-2 rounded-box" @click="router.push({name: 'offices'})" :class="{ 'active': routeName == 'offices' }">
          <WalletIcon class="w-5 h-5" />
          Offices
        </a>
      </li>
    </ul>
  </div>
  </div>
</template>

<style scoped>
</style>
