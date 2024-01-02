<script setup>
import Card from '@/components/Card.vue'
import ComboBox from '@/components/ComboBox.vue'
import FormInput from '@/components/FormInput.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useEmployeeStore } from '@/stores/employee'
import { useAuthStore } from '@/stores/auth.js'
import { useOfficeStore } from '@/stores/office'
import EditIcon from '@/icons/EditIcon.vue'
import DeleteIcon from '@/icons/DeleteIcon.vue'
import CalendarIcon from '@/icons/CalendarIcon.vue'
import SearchIcon from '@/icons/SearchIcon.vue'
import PlusIcon from '@/icons/PlusIcon.vue'
import { cloneDeep, debounce, isEmpty } from 'lodash';
import { useThemeStore } from '@/stores/theme.js'
import dayjs from 'dayjs';
import Pagination from '@/components/Pagination.vue';
import ChevronUpDownIcon from '@/icons/ChevronUpDownIcon.vue';
import ChevronIcon from '@/icons/ChevronIcon.vue';
import TableHeader from '@/components/TableHeader.vue';
import { usePositionStore } from '@/stores/position';


const themeStore = useThemeStore()
const employeeStore = useEmployeeStore();
const officeStore = useOfficeStore();
const positionStore = usePositionStore();
const authStore = useAuthStore()

const searchQuery = ref("");

const payload = ref({});

const emplopyeeOptions = computed(() => officeStore.offices.map(i => {
  return {
    value: i.id,
    label: i.name,
  }
}))

const positionOptions = computed(() => positionStore.positions.map(i => {
  return {
    value: i.id,
    label: i.name,
  }
}))

const formErrors = ref({});

const submit = ref(false);

const submitEmployeeForm = () => {
  submit.value = true;
  formErrors.value = {}
  if(authStore.authUser.role != 'admin'){
    payload.value.office_id = authStore.authUser.office_id;
  }
  employeeStore.save(payload.value)
  .then((res) => {
    if (employeeStore.formType == 'create') {
      alert("You have successfully added an employee");
    }else{
      alert("You have successfully updated an employee");
    }
    submit.value = false;
    employeeStore.get();
    employeeStore.unSelect();
    formErrors.value = {}
    payload.value = {};
  })
  .catch(err => {
    submit.value = false;
    formErrors.value = err.response.data.errors;
    console.warn(err);
  })
}

const handleResetForm = () => {
  employeeStore.unSelect();
  payload.value = {};
}


const handleSearchRecord = debounce(() => {
  employeeStore.get({
    q: searchQuery.value,
    page: 1
  });
}, 500)

const handleDeleteEmployee = (schedule) => {
  if(confirm('Are you sure you want to delete this user')){
    employeeStore.destroy(schedule)
    .then(res => {
      employeeStore.get();
    })
  }
}

const handleChangePage = debounce((page) => {
  employeeStore.get({
    q: searchQuery.value,
    page,
    sortTable: sortTable.value
  });
}, 150)

const sortTable = ref({
  field: null,
  order: null,
})

const sortEmployees = debounce((sortTable) => {
  employeeStore.get({
    q: searchQuery.value,
    page: 1,
    sortTable
  });
}, 250)

watch(
  sortTable,
  (value) => {
    sortEmployees(value)
  }
)

watch(
  () => employeeStore.selectedEmployee,
  (value) => {
    if(!isEmpty(value)){
      payload.value = cloneDeep(value);
    }
  }
)

onMounted(async () => {
  employeeStore.get();
  employeeStore.unSelect();
  officeStore.get();
  positionStore.get();
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
              <FormInput label="Position" :errors="formErrors?.position_id">
                <ComboBox v-model="payload.position_id" :options="positionOptions" />
              </FormInput>
            </div>

            <div class="col-span-12" v-if="authStore.authUser.role == 'admin'">
              <FormInput label="Assigned Office" :errors="formErrors?.office_id">
                <ComboBox v-model="payload.office_id" :options="emplopyeeOptions" />
              </FormInput>
            </div>


            <div class="col-span-12">
              <FormInput label="Employee Type" :errors="formErrors?.is_overtimer">
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

            <button class="btn btn-default" v-if="employeeStore.formType == 'update'" @click="handleResetForm">
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
            <button type="button" class="btn btn-sm join-item">
              <SearchIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra table-sm">
            <thead>
              <tr>
                <th><TableHeader field="office_id" label="Office" v-model="sortTable" /></th>
                <th><TableHeader field="full_name" label="Full Name" v-model="sortTable" /></th>
                <th><TableHeader field="position" label="Position/Designation" v-model="sortTable" /></th>
                <th><TableHeader field="is_overtimer" label="Employee Type" v-model="sortTable" /></th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in employeeStore.employees">
                <td>{{ row.office?.name }}</td>
                <td>{{ row.full_name }}</td>
                <td>{{ row.position?.name }}</td>
                <td>{{ row.is_overtimer ? 'Overtimer' : 'Regular' }}</td>
                <td class="text-center">
                  <div class="join">
                    <!-- <div class="tooltip tooltip-left" data-tip="View Schedules">
                      <button class="btn btn-ghost btn-sm btn-square" @click="employeeStore.viewSchedule(row)">
                        <CalendarIcon class="w-5 h-5" />
                      </button>
                    </div> -->
                    <div class="tooltip tooltip-left" data-tip="Edit Employee">
                      <button class="btn btn-ghost btn-sm btn-square" @click="employeeStore.edit(row)">
                        <EditIcon class="w-5 h-5" />
                      </button>
                    </div>
                    <div class="tooltip tooltip-left" data-tip="Delete Employee">
                      <button class="btn btn-ghost btn-sm btn-square" @click="handleDeleteEmployee(row)">
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
        <Pagination class="pt-4" :total="employeeStore.pagination.lastPage" :current="employeeStore.pagination.currentPage" @change="handleChangePage" />
      </Card>
    </div>
    
  </div>
</template>

<style>
.vc-time-picker{
  padding: 0 !important;
}
</style>
