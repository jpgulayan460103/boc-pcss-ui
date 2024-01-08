<script setup>
import Card from '@/components/Card.vue'
import ComboBox from '@/components/ComboBox.vue'
import FormInput from '@/components/FormInput.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue';
import profile from '@/assets/profile.png'
import { useUserStore } from '@/stores/user'
import { useOfficeStore } from '@/stores/office'
import { useScheduleStore } from '@/stores/schedule'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

import EditIcon from '@/icons/EditIcon.vue'
import DeleteIcon from '@/icons/DeleteIcon.vue'
import CalendarIcon from '@/icons/CalendarIcon.vue'
import SearchIcon from '@/icons/SearchIcon.vue'
import PlusIcon from '@/icons/PlusIcon.vue'
import { cloneDeep, debounce, isEmpty } from 'lodash';
import { useThemeStore } from '@/stores/theme.js'
import dayjs from 'dayjs';
import Pagination from '@/components/Pagination.vue';
import TableHeader from '@/components/TableHeader.vue';


const themeStore = useThemeStore()
const userStore = useUserStore();
const officeStore = useOfficeStore();
const scheduleStore = useScheduleStore();
const authStore = useAuthStore();
const router = useRouter()

const options = computed(() => officeStore.offices.map(i => {
  return {
    value: i.id,
    label: i.name,
  }
}))


const searchQuery = ref("");

const masks = ref({
  modelValue: 'HH:mm:ss',
});

const payload = ref({
  email: "",
  password: "",
  role: "",
});
const formErrors = ref({});
// const scheduleModal = ref(null);
const submit = ref(false);

const submitUserForm = () => {
  submit.value = true;
  formErrors.value = {}
  if(payload.value.role == 'admin'){
    payload.value.office_id = null;
  }
  userStore.save(payload.value)
  .then(res => {
    if(userStore.formType == 'create'){
      alert("You have successfully added a user");
    }else{
      alert("You have successfully updated a user");
    }
    submit.value = false;
    userStore.get();
    userStore.unSelect();
    formErrors.value = {};
    payload.value = {
      email: "",
      password: "",
      role: "",
    };
  })
  .catch(err => {
    submit.value = false;
    formErrors.value = err.response.data.errors;
    console.warn(err);
  })
}

const handleChangePage = debounce((page) => {
  userStore.get({
    q: searchQuery.value,
    page,
    sortTable: sortTable.value
  });
}, 150)

const sortTable = ref({
  field: null,
  order: null,
})

const sortUsers = debounce((sortTable) => {
  userStore.get({
    q: searchQuery.value,
    page: 1,
    sortTable
  });
}, 250)

watch(
  sortTable,
  (value) => {
    sortUsers(value)
  }
)


watch(
  () => userStore.selectedUser,
  (value) => {
    if(!isEmpty(value)){
      payload.value = cloneDeep(value);
    }
  }
)

watch(
  () => authStore.authUser.role,
  (value) => {
    if(value !== 'admin'){
      router.replace({name: 'home'});
    }
  }
)

const previewImage = ref(null);

const handleFileChange = (event) => {
  const file = event.target.files[0];

  if (file) {
    // this.selectedFile = file;
    previewImage.value = URL.createObjectURL(file);
  }
}

const handleResetForm = () => {
  userStore.unSelect();
  payload.value = {
    email: "",
    password: "",
    role: "",
  };
}

const handleSearchRecord = debounce(() => {
  userStore.get({
    q: searchQuery.value,
    page: 1,
  });
}, 500)

const handleDeleteUser = (schedule) => {
  if(confirm('Are you sure you want to delete this user?')){
    userStore.destroy(schedule)
    .then(res => {
      userStore.get();
    })
  }
}



onMounted(async () => {
  userStore.get();
  officeStore.get();
  userStore.unSelect()
})

</script>

<template>
  <div class="container mx-auto grid grid-cols-12 gap-2">

    <div class="col-span-12 md:col-span-4">
      <Card title="User Form" class="min-h-full">
        <form @submit.prevent="submitUserForm">
          <div class="grid grid-cols-12">

            <div class="col-span-12" v-if="previewImage">
              <!-- <img :src="profile" alt="" class="w-52 h-52 rounded-full mx-auto border-4 p-2"> -->
              <img :src="previewImage" alt="" class="w-52 h-52 rounded-full mx-auto border-4 p-2">
            </div>

            <div class="col-span-12">
              <FormInput label="Role" :errors="formErrors?.role">
                <select class="select select-bordered w-full" v-model="payload.role">
                  <option value="" disabled>Select User Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </FormInput>
            </div>

            <div class="col-span-12">
              <FormInput label="Username" :errors="formErrors?.email">
                <input type="text" v-model="payload.email" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>

            <div class="col-span-12" v-if="userStore.formType == 'create'">
              <FormInput label="Password" :errors="formErrors?.password">
                <input type="password" autocomplete="new-password" v-model="payload.password" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>
            
            <div class="col-span-12" v-if="userStore.formType == 'create'">
              <FormInput label="Confirm Password" :errors="formErrors?.password_confirmation">
                <input type="password" autocomplete="new-password" v-model="payload.password_confirmation" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>

            <div class="col-span-12">
              <FormInput label="First Name" :errors="formErrors?.first_name">
                <input type="text" v-model="payload.first_name" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>

            <div class="col-span-12">
              <FormInput label="Middle Name" :errors="formErrors?.middle_name">
                <input type="text" v-model="payload.middle_name" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>

            <div class="col-span-12">
              <FormInput label="Last Name" :errors="formErrors?.last_name">
                <input type="text" v-model="payload.last_name" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>

            <div class="col-span-12">
              <FormInput label="Position/Designation" :errors="formErrors?.position">
                <input type="text" v-model="payload.position" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>

            <div class="col-span-12" v-if="payload.role == 'user'">
              <FormInput label="Assigned Office" :errors="formErrors?.office_id">
                <ComboBox v-model="payload.office_id" :options="options" />
              </FormInput>
            </div>

          </div>
          <div class="flex justify-between flex-row-reverse pt-6" v-if="userStore.formType != 'schedule'">

            <button class="btn btn-primary" :disabled="submit">
              <span v-if="submit" class="loading loading-spinner"></span>
              <span>
                <span v-if="userStore.formType == 'create'">Submit</span>
                <span v-else>Update</span>
              </span>
            </button>

            <button class="btn btn-default" v-if="userStore.formType == 'update'" @click="handleResetForm">
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>

    <div class="col-span-12 md:col-span-8" v-if="userStore.formType != 'schedule'">
      <Card title="List of Users" class="min-h-full">

        <div class="flex justify-between flex-row-reverse">
          <div class="flex join py-4">
            <input type="text" placeholder="Search for user" v-model="searchQuery" @keyup="handleSearchRecord($event)" class="input input-bordered input-sm w-full max-w-xs join-item" />
            <button type="button" class="btn btn-sm join-item">
              <SearchIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra table-sm">
            <thead>
              <tr>
                <th><TableHeader field="role" label="Role" v-model="sortTable" /></th>
                <th><TableHeader field="email" label="Username" v-model="sortTable" /></th>
                <th><TableHeader field="full_name" label="Full Name" v-model="sortTable" /></th>
                <th><TableHeader field="office_id" label="Assigned Office" v-model="sortTable" /></th>
                <th><TableHeader field="position" label="Position/Designation" v-model="sortTable" /></th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in userStore.users">
                <td>{{ user.role == 'user' ? 'User' : 'Admin'  }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.full_name }}</td>
                <td>{{ user.office?.name }}</td>
                <td>{{ user.position }}</td>
                <td class="text-center">
                  <div class="join">
                    <div class="tooltip tooltip-left" data-tip="Edit User">
                      <button class="btn btn-ghost btn-sm btn-square" @click="userStore.edit(user)">
                        <EditIcon class="w-5 h-5" />
                      </button>
                    </div>
                    <div class="tooltip tooltip-left" data-tip="Delete User" @click="handleDeleteUser(user)">
                      <button class="btn btn-ghost btn-sm btn-square">
                        <DeleteIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="userStore.users.length == 0">
              <tr>
                <th colspan="20" class="text-center">
                  <p class="text-lg">No Data</p>
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
        <Pagination class="pt-4" :total="userStore.pagination.lastPage" :current="userStore.pagination.currentPage" @change="handleChangePage" />
      </Card>
    </div>

    <div class="col-span-12 md:col-span-8" v-else>
      <Card title="Work Schedules" closable @close="userStore.unSelect()" class="min-h-full">
        <div class="flex justify-between">
          <button class="btn btn-primary btn-sm join-item" @click="handleAddSchedule">
            <PlusIcon class="w-5 h-5" />
            Add Schedule
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Schedule</th>
                <th>Office</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
                <tr v-for="schedule in scheduleStore.schedules">
                  <td>{{ schedule.working_date }}</td>
                  <td>{{ dayjs(`2001-01-01 ${schedule.working_time_in}`).format("hh:mm:ss A") }} - {{ dayjs(`2001-01-01 ${schedule.working_time_out}`).format("hh:mm:ss A") }}</td>
                  <td>{{ schedule.office?.name }}</td>
                  <td class="text-center">
                    <!-- <div class="tooltip tooltip-left" data-tip="Edit User">
                      <button class="btn btn-ghost btn-sm btn-square" @click="userStore.edit(user)">
                        <EditIcon class="w-5 h-5" />
                      </button>
                    </div> -->
                    <div class="tooltip tooltip-left" data-tip="Delete Schedule">
                      <button class="btn btn-ghost btn-sm btn-square">
                        <DeleteIcon class="w-5 h-5" />
                      </button>
                    </div>
                </td>
                </tr>
              </tbody>
          </table>
        </div>
      </Card>
    </div>


  </div>
</template>

<style>
.vc-time-picker{
  padding: 0 !important;
}
</style>
