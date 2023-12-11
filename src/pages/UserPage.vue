<script setup>
import Card from '@/components/Card.vue'
import ComboBox from '@/components/ComboBox.vue'
import FormInput from '@/components/FormInput.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue';
import profile from '@/assets/profile.png'
import { useUserStore } from '@/stores/user'
import { useOfficeStore } from '@/stores/office'
import { useScheduleStore } from '@/stores/schedule'

import EditIcon from '@/icons/EditIcon.vue'
import DeleteIcon from '@/icons/DeleteIcon.vue'
import CalendarIcon from '@/icons/CalendarIcon.vue'
import SearchIcon from '@/icons/SearchIcon.vue'
import PlusIcon from '@/icons/PlusIcon.vue'
import { cloneDeep } from 'lodash';
import { useThemeStore } from '@/stores/theme.js'
import dayjs from 'dayjs';


const themeStore = useThemeStore()
const userStore = useUserStore();
const officeStore = useOfficeStore();
const scheduleStore = useScheduleStore();

const options = computed(() => officeStore.offices.map(i => {
  return {
    value: i.id,
    label: i.name,
  }
}))

const schedulePayload = ref({
  working_dates: {
    start: null,
    end: null,
  },
  working_time_in: "00:00:00",
  working_time_out: "00:00:00",
  office_id: null,
  user_id: null,
});

const searchQuery = ref("");

const masks = ref({
  modelValue: 'HH:mm:ss',
});

const userPayload = ref({
  email: "",
  password: ""
});
const formErrors = ref({});
// const scheduleModal = ref(null);
const submit = ref(false);

const submitUserForm = () => {
  submit.value = true;
  formErrors.value = {}
}

const submitScheduleForm = async () => {
  submit.value = true;
  formErrors.value = {}
  scheduleStore.save(schedulePayload.value)
  .then((res) => {
    alert("You have successfully added schedules");
    submit.value = false;
    scheduleStore.get();
    scheduleModal.click();
  })
  .catch(err => {
    console.warn(err);
  })
}

const handleUpdateRange = (value) => {
  let {start, end} = value;
  schedulePayload.value = {
    ...schedulePayload.value,
    working_dates: {
      start: dayjs(start).format('YYYY-MM-DD'),
      end: dayjs(end).format('YYYY-MM-DD'),
    }
  }

  console.log(schedulePayload.value);
}

watch(
  () => userStore.selectedUser,
  (value) => {
    userPayload.value = cloneDeep(value);
  }
)

const handleAddSchedule = () => {
  scheduleModal.click();
  schedulePayload.value = {
    ...schedulePayload.value,
    user_id: userStore.selectedUser.id
  }

  // var element = document.getElementsByClassName("vc-time-select-group");

  // for(var i = 0; i < element.length; i++){
  //   element[i].classList.add('w-full');
  //   console.log(element[i].className);
  // }

  // Array.from(document.querySelectorAll('.vc-container')).forEach(
  //   (el) => el.classList.remove('vc-light')
  // );
}

const previewImage = ref(null);

const handleFileChange = (event) => {
  const file = event.target.files[0];

  if (file) {
    // this.selectedFile = file;
    previewImage.value = URL.createObjectURL(file);
  }
}



onMounted(async () => {
  userStore.get();
  officeStore.getOffices();
})

</script>

<template>
  <div class="container mx-auto grid grid-cols-12 gap-2">

    <div class="col-span-12 md:col-span-4">
      <Card title="User Form">
        <form @submit.prevent="submitUserForm">
          <div class="grid grid-cols-12">

            <div class="col-span-12" v-if="previewImage">
              <!-- <img :src="profile" alt="" class="w-52 h-52 rounded-full mx-auto border-4 p-2"> -->
              <img :src="previewImage" alt="" class="w-52 h-52 rounded-full mx-auto border-4 p-2">
            </div>
            <div class="col-span-12">
              <FormInput label="Username" :errors="formErrors?.email">
                <input type="text" :readonly="userStore.formType == 'schedule'" v-model="userPayload.email" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>

            <div class="col-span-12" v-if="userStore.formType == 'create'">
              <FormInput label="Password" :errors="formErrors?.password">
                <input type="password" autocomplete="new-password" v-model="userPayload.password" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>
            
            <div class="col-span-12" v-if="userStore.formType == 'create'">
              <FormInput label="Confirm Password" :errors="formErrors?.confirm_password">
                <input type="password" autocomplete="new-password" v-model="userPayload.confirm_password" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>

            <div class="col-span-12">
              <FormInput label="First Name" :errors="formErrors?.first_name">
                <input type="text" :readonly="userStore.formType == 'schedule'" v-model="userPayload.first_name" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>

            <div class="col-span-12">
              <FormInput label="Middle Name" :errors="formErrors?.middle_name">
                <input type="text" :readonly="userStore.formType == 'schedule'" v-model="userPayload.middle_name" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>

            <div class="col-span-12">
              <FormInput label="Last Name" :errors="formErrors?.last_name">
                <input type="text" :readonly="userStore.formType == 'schedule'" v-model="userPayload.last_name" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>

            <div class="col-span-12">
              <FormInput label="Position/Designation" :errors="formErrors?.position">
                <input type="text" :readonly="userStore.formType == 'schedule'" v-model="userPayload.position" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>

            <div class="col-span-12">
              <FormInput label="Assigned Office" :errors="formErrors?.office_id">
                <ComboBox v-model="schedulePayload.office_id" :options="options" />
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

            <button class="btn btn-accent" v-if="userStore.formType == 'update'" @click="userStore.unSelect()">
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>

    <div class="col-span-12 md:col-span-8" v-if="userStore.formType != 'schedule'">
      <Card title="List of Users">

        <div class="flex justify-between flex-row-reverse">
          <div class="flex join py-4">
            <input type="text" placeholder="Search for employee" v-model="searchQuery" @keyup="handleSearchRecord($event)" class="input input-bordered input-sm w-full max-w-xs join-item" />
            <button class="btn btn-sm join-item">
              <SearchIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Position/Designation</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in userStore.users">
                <td>{{ user.email }}</td>
                <td>{{ user.full_name }}</td>
                <td>{{ user.position }}</td>
                <td class="text-center">
                  <div class="tooltip tooltip-left" data-tip="View Schedules">
                    <button class="btn btn-ghost btn-sm btn-square" @click="userStore.viewSchedule(user)">
                      <CalendarIcon class="w-5 h-5" />
                    </button>
                  </div>
                  <div class="tooltip tooltip-left" data-tip="Edit User">
                    <button class="btn btn-ghost btn-sm btn-square" @click="userStore.edit(user)">
                      <EditIcon class="w-5 h-5" />
                    </button>
                  </div>
                  <div class="tooltip tooltip-left" data-tip="Delete User">
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

    <div class="col-span-12 md:col-span-8" v-else>
      <Card title="Work Schedules" closable @on-close="userStore.unSelect()">
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

    <!-- The button to open modal -->
    <label for="scheduleModal" @ref="scheduleModal"></label>

    <!-- Put this part before </body> tag -->
    <input type="checkbox" id="scheduleModal" class="modal-toggle" />
    <div class="modal" role="dialog">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Add Schedule</h3>
        
        <form @submit.prevent="submitScheduleForm">
          <div class="grid grid-cols-12">
            <div class="col-span-12 mt-4 text-center">
              <VDatePicker v-model.range="schedulePayload.working_dates" @update:modelValue="handleUpdateRange" mode="date" :is-dark="themeStore.isDark()" :color="themeStore.isDark() ? 'sky-blue' : 'green'"/>
            </div>
            <div class="col-span-12">
              <FormInput label="Working Dates" :errors="formErrors?.working_dates">
                <input type="text" readonly :value="`${schedulePayload.working_dates?.start} to ${schedulePayload.working_dates?.end}`" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>
            <div class="col-span-12">
              <FormInput label="Working Hours" :errors="formErrors?.working_time_in">
                <div class="input input-bordered w-full space-x-2">
                  <VDatePicker class="mt-1.5" expanded v-model.string="schedulePayload.working_time_in" mode="time" :masks="masks" :is-dark="themeStore.isDark()" :color="themeStore.isDark() ? 'sky-blue' : 'green'" hide-time-header />
                  <span>to</span>
                  <VDatePicker class="mt-1.5" expanded v-model.string="schedulePayload.working_time_out" mode="time" :masks="masks" :is-dark="themeStore.isDark()" :color="themeStore.isDark() ? 'sky-blue' : 'green'" hide-time-header />
                </div>
              </FormInput>
            </div>

            <div class="col-span-12">
              <FormInput label="Assigned Office" :errors="formErrors?.working_dates">
                <ComboBox v-model="schedulePayload.office_id" :options="options" />
              </FormInput>
            </div>
          </div>
          <div class="flex justify-between flex-row-reverse pt-6">

            <button class="btn btn-primary" :disabled="submit">
              <span v-if="submit" class="loading loading-spinner"></span>
              <span>
                Add Schedule
              </span>
            </button>

            <button class="btn btn-accent" v-if="userStore.formType == 'update'" @click="userStore.unSelect()">
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
    
  </div>
</template>

<style>
.vc-time-picker{
  padding: 0 !important;
}
</style>
