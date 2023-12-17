<script setup>
import Card from '@/components/Card.vue'
import ComboBox from '@/components/ComboBox.vue'
import FormInput from '@/components/FormInput.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useEmployeeStore } from '@/stores/employee'

import EditIcon from '@/icons/EditIcon.vue'
import DeleteIcon from '@/icons/DeleteIcon.vue'
import CalendarIcon from '@/icons/CalendarIcon.vue'
import SearchIcon from '@/icons/SearchIcon.vue'
import PlusIcon from '@/icons/PlusIcon.vue'
import { cloneDeep } from 'lodash';
import { useThemeStore } from '@/stores/theme.js'
import dayjs from 'dayjs';


const themeStore = useThemeStore()
const employeeStore = useEmployeeStore();

const searchQuery = ref("");

const payload = ref({
  email: "",
  password: ""
});

const formErrors = ref({});

const submit = ref(false);

const submitEmployeeForm = () => {
  submit.value = true;
  formErrors.value = {}
  employeeStore.save(payload.value)
  .then((res) => {
    alert("You have successfully added employee");
    submit.value = false;
    employeeStore.get();
  })
  .catch(err => {
    submit.value = false;
    formErrors.value = err.response.data.errors;
    console.warn(err);
  })
}



watch(
  () => employeeStore.selectedEmployee,
  (value) => {
    payload.value = cloneDeep(value);
  }
)



onMounted(async () => {
  employeeStore.get();
  employeeStore.unSelect();
})

</script>

<template>
  <div class="container mx-auto grid grid-cols-12 gap-2">

    <div class="col-span-12 md:col-span-4">
      <Card title="Employee Form">
        <form @submit.prevent="submitEmployeeForm">
          <div class="grid grid-cols-12">

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
              <FormInput label="Position" :errors="formErrors?.position">
                <input type="text" v-model="payload.position" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>


            <div class="col-span-12">
              <FormInput label="Employee Type" :errors="formErrors?.last_name">
                <div class="flex space-x-2">
                    <label class="label cursor-pointer space-x-2">
                        <input type="radio" class="radio" :value="0" v-model="payload.is_overtimer" />
                        <span class="label-text">Regular</span> 
                    </label>
                    <label class="label cursor-pointer space-x-2">
                        <input type="radio" class="radio" :value="1" v-model="payload.is_overtimer" />
                        <span class="label-text">Overtimer</span> 
                    </label>
                </div>
              </FormInput>
            </div>


          </div>
          <div class="flex justify-between flex-row-reverse pt-6" v-if="employeeStore.formType != 'schedule'">

            <button class="btn btn-primary" :disabled="submit">
              <span v-if="submit" class="loading loading-spinner"></span>
              <span>
                <span v-if="employeeStore.formType == 'create'">Submit</span>
                <span v-else>Update</span>
              </span>
            </button>

            <button class="btn btn-secondary" v-if="employeeStore.formType == 'update'" @click="employeeStore.unSelect()">
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>

    <div class="col-span-12 md:col-span-8">
      <Card title="List of Employees">

        <div class="flex justify-between flex-row-reverse">
          <div class="flex join py-4">
            <input type="text" placeholder="Search for employee" v-model="searchQuery" @keyup="handleSearchRecord($event)" class="input input-bordered input-sm w-full max-w-xs join-item" />
            <button class="btn btn-sm join-item">
              <SearchIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Position/Designation</th>
                <th>Employee Type</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in employeeStore.employees">
                <td>{{ row.full_name }}</td>
                <td>{{ row.position }}</td>
                <td>{{ row.is_overtimer ? 'Overtimer' : 'Regular' }}</td>
                <td class="text-center">
                  <div class="join">
                    <div class="tooltip tooltip-left" data-tip="View Schedules">
                      <button class="btn btn-ghost btn-sm btn-square" @click="employeeStore.viewSchedule(row)">
                        <CalendarIcon class="w-5 h-5" />
                      </button>
                    </div>
                    <div class="tooltip tooltip-left" data-tip="Edit Employee">
                      <button class="btn btn-ghost btn-sm btn-square" @click="employeeStore.edit(row)">
                        <EditIcon class="w-5 h-5" />
                      </button>
                    </div>
                    <div class="tooltip tooltip-left" data-tip="Delete Employee">
                      <button class="btn btn-ghost btn-sm btn-square">
                        <DeleteIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="employeeStore.employees.length == 0">
              <tr>
                <th colspan="20" class="text-center">
                  <p class="text-lg">No Data</p>
                </th>
              </tr>
            </tfoot>
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
