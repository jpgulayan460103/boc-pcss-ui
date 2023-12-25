<script setup>
import { reactive, ref } from 'vue';
import { useUserStore } from '@/stores/user'
import FormInput from './FormInput.vue';
import { debounce } from 'lodash';

const userStore = useUserStore()

const payload = ref({})
const formErrors = ref([])
const submit = ref(false);
const closeChangePasswordModalButton = ref(null);

const submitUserForm = debounce(() => {
  submit.value = true
  formErrors.value = [];
  userStore.changePassword(payload.value)
  .then(res => {
    submit.value = false
    alert('Your password has been changed')
    closeChangePasswordModalButton.value.click();
  })
  .catch(err => {
    formErrors.value = err.response.data.errors
    submit.value = false
  })
}, 250)
</script>

<template>
  <dialog id="changePasswordModal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Change Password</h3>
      <form @submit.prevent="submitUserForm">
        <div class="grid grid-cols-12 space-y-2">

          <div class="col-span-12">
            <FormInput label="Old Password" :errors="formErrors?.old_password">
              <input type="password" autocomplete="new-password" v-model="payload.old_password" placeholder="" class="input input-bordered w-full" />
            </FormInput>
          </div>

          <div class="col-span-12">
            <FormInput label="New Password" :errors="formErrors?.password">
              <input type="password" autocomplete="new-password" v-model="payload.password" placeholder="" class="input input-bordered w-full" />
            </FormInput>
          </div>

          <div class="col-span-12">
            <FormInput label="Confirm New Password" :errors="formErrors?.password_confirmation">
              <input type="password" autocomplete="new-password" v-model="payload.password_confirmation" placeholder="" class="input input-bordered w-full" />
            </FormInput>
          </div>
        </div>

        <div class="flex justify-between flex-row-reverse pt-6">

          <button type="submit" class="btn btn-primary" :disabled="submit">
            <span>Change Password</span>
          </button>

          <button type="button" class="btn btn-default" @click="closeChangePasswordModalButton.click()">
            Cancel
          </button>
        </div>

      </form>

      <form method="dialog" id="changePasswordForm">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" form="changePasswordForm" ref="closeChangePasswordModalButton"></button>
      </form>

    </div>
  </dialog>
</template>

<style scoped>
</style>
