<script setup>
import LoginForm from '@/pages/LoginForm.vue';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import SettingIcon from '@/icons/SettingIcon.vue'
import SignIcon from '@/icons/SignIcon.vue'
import SignOutIcon from '@/icons/SignOutIcon.vue'
import LightThemeIcon from '@/icons/LightThemeIcon.vue'
import DarkThemeIcon from '@/icons/DarkThemeIcon.vue'
import LockIcon from '@/icons/LockIcon.vue'
import profile from '@/assets/profile.png'
import logo from '@/assets/logo.png'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.js'
import { useThemeStore } from '@/stores/theme.js'

const router = useRouter()

const authStore = useAuthStore()
const themeStore = useThemeStore()

const handleLogoutButton = async (theme) => {
  await authStore.logout();
  router.replace({name: 'auth-login'});
}

const handleAuthorizeUser = () => {
  loginModal.click();
}

const handleChangePasswordButton = () => {
  changePasswordModal.showModal() 
}

</script>

<template>
  <div class="navbar bg-base-100 container mx-auto">
    <div class="flex-1">
      <a class="btn btn-ghost text-xl" @click="router.push({name: 'home'})"><img :src="logo" class="h-12"> Scheduling System</a>
    </div>
    <div class="flex-none">
      <Menu as="div" class="relative inline-block text-left z-50" v-if="authStore.isAuthenticated">
      <div>
        <MenuButton
          class="pr-6"
        >
          <div class="space-x-2 flex">
            <span class="hidden md:inline">{{ authStore.authUser.email }}</span>
            <SettingIcon class="w-6 h-6" />
          </div>
        </MenuButton>
      </div>

      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems
          class="absolute right-0 mb-24 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-base-100 shadow-lg ring-3 ring-black ring-opacity-5 focus:outline-none"
        >
          <div class="px-1 py-1">
            <MenuItem v-slot="{ active }">
              <button
                :class="[
                  active ? 'bg-base-300 text-base-content' : 'text-base-content',
                  'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                ]"
                @click="handleChangePasswordButton"
              >
                <div class="space-x-2 flex">
                  <LockIcon class="w-5 h-5" />
                  <span>Change Password</span>
                </div>
              </button>
            </MenuItem>

          </div>
          <div class="px-1 py-1">
            <MenuItem v-slot="{ active }">
              <button
                :class="[
                  active ? 'bg-base-300 text-base-content' : 'text-base-content',
                  'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                ]"
                 @click="themeStore.changeTheme('emerald')"
              >
                <div class="space-x-2 flex">
                  <LightThemeIcon class="w-5 h-5" />
                  <span>Light Theme</span>
                </div>
              </button>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <button
                :class="[
                  active ? 'bg-base-300 text-base-content' : 'text-base-content',
                  'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                ]"
                 @click="themeStore.changeTheme('night')"
              >
                <div class="space-x-2 flex">
                  <DarkThemeIcon class="w-5 h-5" />
                  <span>Dark Theme</span>
                </div>
              </button>
            </MenuItem>
          </div>

          <div class="px-1 py-1">
            <MenuItem v-slot="{ active }">
              <button
                :class="[
                  active ? 'bg-base-300 text-base-content' : 'text-base-content',
                  'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                ]"
                @click="handleLogoutButton"
              >
                <div class="space-x-2 flex">
                  <SignOutIcon class="w-5 h-5" />
                  <span>Logout</span>
                </div>
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </transition>
    </Menu>

    <button class="btn btn-ghost" @click="router.replace({name: 'auth-login'})" v-else>
      Login
      <SignIcon class="w-6 h-6 rotate-180" />
    </button>
    </div>
  </div>


  <!-- Put this part before </body> tag -->
  <input type="checkbox" id="loginModal" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Login to your account</h3>
      <img :src="profile" alt="" class="w-36 h-36 rounded-full mx-auto border-4 p-2 mt-6">
      <LoginForm @authorize-user="handleAuthorizeUser" />
    </div>
  </div>
</template>

<style scoped>
</style>
