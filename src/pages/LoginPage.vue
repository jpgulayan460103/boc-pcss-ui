<script setup>
import Card from '@/components/Card.vue'
import { onMounted, reactive, ref } from 'vue';
import schedulingIcon  from '@/assets/scheduling-icon.png'
import LoginForm from './LoginForm.vue';
import SchedulingGraphic from '@/graphics/SchedulingGraphic.vue'
import logo from '@/assets/logo.png'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
    
})
</script>

<template>
  <div class="container mx-auto grid grid-cols-12 gap-2">

    <div class="col-span-12 md:py-18 lg:py-24">
      <Card title="">
        <div class="grid grid-cols-12 gap-2 py-8">
            <div class="col-span-12 md:col-start-2 md:col-span-5">
                <div class="flex space-x-4">
                    <img :src="logo" class="h-24">   
                    <p class="text-4xl font-bold">
                        Port of Clark <br>
                        Scheduling System
                    </p>
                </div>
                <SchedulingGraphic />
    
            </div>
            <div class="col-span-12  md:col-start-8 md:col-span-4 pt-8">
                <p class="text-xl mt-16 mb-4">Login to your account to get started</p>
                <LoginForm />
            </div>
        </div>
      </Card>
    </div>
    
  </div>
</template>

<style scoped>
</style>
