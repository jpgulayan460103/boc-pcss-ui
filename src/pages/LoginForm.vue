<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import FormInput from '@/components/FormInput.vue';
import axios from 'axios';
import { debounce } from 'lodash'
import { useAuthStore } from '@/stores/auth.js'
import { storeToRefs } from 'pinia'

import { useRouter } from 'vue-router'

const router = useRouter()

const authStore = useAuthStore()

const API = import.meta.env.VITE_API_URL;

const payload = reactive({
  email: "",
  password: ""
});

const formErrors = ref({});
const submit = ref(false);

const submitForm = debounce(async () => {
  submit.value = true;
  formErrors.value = {}
  authStore.login(payload)
  .then(async (res) => {
    submit.value = false;
    formErrors.value = {};
    await authStore.getUser();
    router.push({ name: 'home' });
  })
  .catch(err => {
    console.log(err);
    submit.value = false;
    formErrors.value = err.response.data.errors;
  });
}, 500)


</script>

<template>
  <form @submit.prevent="submitForm">
    <div class="grid grid-cols-12 space-y-4">
      <div class="col-span-12">
        <FormInput label="Username" :errors="formErrors?.email">
          <input type="text" v-model="payload.email" placeholder="" class="input input-bordered w-full" />
        </FormInput>
      </div>
      <div class="col-span-12">
        <FormInput label="Password" :errors="formErrors?.password">
          <input type="password" v-model="payload.password" placeholder="" class="input input-bordered w-full" />
        </FormInput>
      </div>
    </div>
    <div class="flex justify-end pt-6">
        <button class="btn btn-primary" :disabled="submit">
          <span v-if="submit" class="loading loading-spinner"></span>
          <span>Login</span>
        </button>
      </div>
  </form>
</template>

<style scoped>
</style>
