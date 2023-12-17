<script setup>
import Card from '@/components/Card.vue'
import ComboBox from '@/components/ComboBox.vue'
import FormInput from '@/components/FormInput.vue'
import { computed, onMounted, reactive, ref, toRef, watch } from 'vue';
import profile from '@/assets/profile.png'
import { useUserStore } from '@/stores/user'
import { useOfficeStore } from '@/stores/office'
import { useScheduleStore } from '@/stores/schedule'
import { useEmployeeStore } from '@/stores/employee'
import { useScreens } from 'vue-screen-utils';

import EditIcon from '@/icons/EditIcon.vue'
import DeleteIcon from '@/icons/DeleteIcon.vue'
import CalendarIcon from '@/icons/CalendarIcon.vue'
import UserMinusIcon from '@/icons/UserMinusIcon.vue'
import UserAddIcon from '@/icons/UserAddIcon.vue'
import UsersIcon from '@/icons/UsersIcon.vue'
import UserIcon from '@/icons/UserIcon.vue'
import PlusIcon from '@/icons/PlusIcon.vue'
import SearchIcon from '@/icons/SearchIcon.vue'
import { cloneDeep, debounce } from 'lodash';
import { useThemeStore } from '@/stores/theme.js'
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';

const { mapCurrent } = useScreens({ xs: '0px', sm: '640px', md: '768px', lg: '1024px' });
const columns = mapCurrent({ lg: 2 }, 1);

const themeStore = useThemeStore()
const userStore = useUserStore();
const officeStore = useOfficeStore();
const scheduleStore = useScheduleStore();
const employeeStore = useEmployeeStore();

const tab = ref("employees");
const formErrors = ref({});

const { payload } = storeToRefs(scheduleStore);

const handleUpdateRange = (value) => {
  let {start, end} = value;
  payload.value.working_daterange = {
    start: dayjs(start).format('YYYY-MM-DD'),
    end: dayjs(end).format('YYYY-MM-DD'),
  }
}

const generateDateArray = (start, end) => {
  let currentDate = dayjs(start);
  let dateArray = [{
    date: currentDate.format('dddd, MMMM D, YYYY'),
    value: currentDate.format('YYYY-MM-DD'),
    day: currentDate.format('dddd'),
    isWeekEnd: ['Sat','Sun'].includes(currentDate.format('ddd')),
    isIncluded: true,
  }];
  const endDate = dayjs(end);
  if(currentDate.diff(endDate, 'day') == 0){
    return [];
  }
  do {
    currentDate = currentDate.add(1, 'day')
    dateArray.push({
      date: currentDate.format('dddd, MMMM D, YYYY'),
      value: currentDate.format('YYYY-MM-DD'),
      day: currentDate.format('dddd'),
      isWeekEnd: ['Sat','Sun'].includes(currentDate.format('ddd')),
      isIncluded: true,
    });
  } while (currentDate.diff(endDate, 'day') != 0);
  return dateArray;
}

const workingDates = computed(() => {
  if(payload.value.working_daterange.start && payload.value.working_daterange.end){
    return generateDateArray(dayjs(payload.value.working_daterange.start).format('YYYY-MM-DD'), dayjs(payload.value.working_daterange.end).format('YYYY-MM-DD'))
  }
  return []
})

const submit = ref(false);

const masks = ref({
  modelValue: 'HH:mm:ss',
});

const handleAddShift = () => {
  payload.value.shifts = [
    ...payload.value.shifts,
    {
      working_time_in: "00:00:00",
      working_time_out: "00:00:00",
    }
  ];
}

const handleRemoveShift = (index) => {
  if (index > -1) { // only splice array when item is found
    payload.value.shifts.splice(index, 1); // 2nd parameter means remove one item only
  }
}


const handleRemoveEmployee = (employee) => {
  payload.value.employees = payload.value.employees.filter(i => i.id != employee.id)
}

const handleAddEmployee = (employee) => {
  payload.value.employees = [
    ...payload.value.employees,
    employee
  ]
};

const isEmployeeAdded = (employee) => {
  const payloadEmployees = payload.value.employees.filter(i => i.id == employee.id);
  return payloadEmployees.length === 1;
}

const submitScheduleForm = async () => {
  // submit.value = true;
  formErrors.value = {};
  let formattedPayload = {
    ...payload.value,
    working_dates: workingDates.value,
    working_start_date: payload.value.working_daterange.start,
    working_end_date: payload.value.working_daterange.end,
  }
  await scheduleStore.save(formattedPayload);
  // submit.value = false;
}

const officeOptions = computed(() => officeStore.offices.map(i => {
  return {
    value: i.id,
    label: i.name,
  }
}))


onMounted(() => {
  employeeStore.get();
  officeStore.get();
})


</script>

<template>
  <div class="container mx-auto grid grid-cols-12 gap-2">

    <div class="col-span-12 md:col-span-6">
      <Card :title="tab == 'dates' ? 'Set Working Dates' :  (tab == 'employees' ? 'Set Employees' : 'Set Work Shifts')">
        <div role="tablist" class="tabs tabs-bordered">
          <a role="tab" class="tab" :class="{'tab-active': tab == 'employees'}" @click="tab = 'employees'">Employees</a>
          <a role="tab" class="tab" :class="{'tab-active': tab == 'shifts'}" @click="tab = 'shifts'">Shifts</a>
          <a role="tab" class="tab" :class="{'tab-active': tab == 'dates'}" @click="tab = 'dates'">Dates</a>
        </div>

        <form @submit.prevent="submitScheduleForm">

          <div v-if="tab == 'dates'" class="pt-6">
            <div class="overflow-auto w-full">
              <VDatePicker expanded :columns="columns" :rows="2" v-model.range="payload.working_daterange" @update:modelValue="handleUpdateRange" mode="date" :is-dark="themeStore.calendar.isDark" :color="themeStore.calendar.color"/>
            </div>

            <div class="flex justify-between flex-row-reverse pt-6">
              <button class="btn btn-primary" :disabled="submit">
                Generate Schedules
              </button>
            </div>
          </div>

          <div v-if="tab == 'shifts'" class="pt-6 space-y-4">

            <div class="col-span-12">
              <FormInput label="Assigned Office" :errors="formErrors?.office_id">
                <ComboBox v-model="payload.office_id" :options="officeOptions" />
              </FormInput>
            </div>


            <div class="grid grid-cols-12" v-for="(shift, index) in payload.shifts">
              <div class="col-span-9">
                <FormInput label="Working Hours">
                  <div class="input input-bordered w-full space-x-2">
                    <VDatePicker class="mt-1.5" expanded v-model.string="shift.working_time_in" mode="time" :masks="masks" :is-dark="themeStore.calendar.isDark" :color="themeStore.calendar.color" hide-time-header />
                    <span>to</span>
                    <VDatePicker class="mt-1.5" expanded v-model.string="shift.working_time_out" mode="time" :masks="masks" :is-dark="themeStore.calendar.isDark" :color="themeStore.calendar.color" hide-time-header />
                  </div>
                </FormInput>
              </div>
              <div class="col-span-3 my-auto pt-8">
                <button type="button" class="btn btn-secondary w-full" @click="handleRemoveShift(index)">
                  <DeleteIcon class="w-5 h-5" /> Remove
                </button>
              </div>
            </div>

            <button type="button" class="btn btn-primary btn-sm join-item" @click="handleAddShift">
              <PlusIcon class="w-5 h-5" />
              Add Shift
            </button>

          </div>

          <div v-if="tab == 'employees'" class="pt-6 space-y-2">

            <div class="flex justify-between flex-row-reverse pb-4">
              <div class="flex join">
                <input type="text" placeholder="Search for employee" class="input input-bordered input-sm w-full max-w-xs join-item" />
                <button class="btn btn-sm join-item">
                  <SearchIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>Fullname</th>
                    <th>Position</th>
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
                        <div class="tooltip tooltip-left" data-tip="Remove Employee" v-if="isEmployeeAdded(row)">
                          <span class="btn btn-ghost btn-sm btn-square text-secondary" @click="handleRemoveEmployee(row)">
                            <UserMinusIcon class="w-5 h-5" />
                          </span>
                        </div>

                        <div class="tooltip tooltip-left" data-tip="Add Employee" v-else>
                          <span class="btn btn-ghost btn-sm btn-square" @click="handleAddEmployee(row)">
                            <UserAddIcon class="w-5 h-5" />
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tfoot v-if="employeeStore.employees == 0">
                  <tr>
                    <th colspan="20" class="text-center">
                      <p class="text-lg">No Data</p>
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>

          </div>

        </form>
      </Card>
    </div>

    <div class="col-span-12 md:col-span-6" v-if="tab == 'dates'">
      <Card title="Working Dates">
        <div class="overflow-x-auto">
          <table class="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type of Duty</th>
                <th>Holiday</th>
                <!-- <th class="text-center">Actions</th> -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in workingDates">
                <td>{{ row.date }}</td>
                <td>
                  <span v-if="row.isWeekEnd">Overtime Duty</span>
                  <span v-else>Regular Duty</span>
                </td>
                <td>holiday data</td>
                <!-- <td class="text-center">
                  <div class="tooltip tooltip-left" data-tip="Remove Date">
                    <button class="btn btn-ghost btn-sm btn-square">
                      <DeleteIcon class="w-5 h-5" />
                    </button>
                  </div>
                </td> -->
              </tr>
            </tbody>
            <tfoot v-if="workingDates.length == 0">
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

    <div class="col-span-12 md:col-span-6" v-if="tab == 'employees' || tab == 'shifts'">
      <Card title="List of Employee">
        <div class="overflow-x-auto">
          <table class="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Fullname</th>
                <th>Position</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in payload.employees">
                <td>{{ row.full_name }}</td>
                <td>{{ row.position }}</td>
                <td class="text-center">
                  <div class="tooltip tooltip-left" data-tip="Remove Employee">
                    <span class="btn btn-ghost btn-sm btn-square text-secondary" @click="handleRemoveEmployee(row)">
                      <UserMinusIcon class="w-5 h-5" />
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="payload.employees.length == 0">
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
