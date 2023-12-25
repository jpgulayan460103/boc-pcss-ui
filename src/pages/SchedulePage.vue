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
import { useHolidayStore } from '@/stores/holiday.js'

import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

import EditIcon from '@/icons/EditIcon.vue'
import DeleteIcon from '@/icons/DeleteIcon.vue'
import CalendarIcon from '@/icons/CalendarIcon.vue'
import UserMinusIcon from '@/icons/UserMinusIcon.vue'
import UserAddIcon from '@/icons/UserAddIcon.vue'
import UsersIcon from '@/icons/UsersIcon.vue'
import UserIcon from '@/icons/UserIcon.vue'
import PlusIcon from '@/icons/PlusIcon.vue'
import SearchIcon from '@/icons/SearchIcon.vue'
import { cloneDeep, debounce, forEach } from 'lodash';
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
const holidayStore = useHolidayStore()
const authStore = useAuthStore();
const router = useRouter()


const tab = ref("employees");
const formErrors = ref({});

const { payload } = storeToRefs(scheduleStore);

const handleUpdateRange = (value) => {
  if(value){
    let {start, end} = value;
    payload.value.working_daterange = {
      start: dayjs(start).format('YYYY-MM-DD'),
      end: dayjs(end).format('YYYY-MM-DD'),
    }
  }
}

const generateDateArray = (start, end) => {
  let currentDate = dayjs(start);
  let holidays = holidayStore.holidays?.map(i => dayjs(i.holiday_date).format('YYYY-MM-DD'));
  console.log(holidays);
  let dateArray = [{
    date: currentDate.format('dddd, MMMM D, YYYY'),
    value: currentDate.format('YYYY-MM-DD'),
    day: currentDate.format('dddd'),
    isWeekEnd: ['Sat','Sun'].includes(currentDate.format('ddd')),
    isHoliday: holidays.includes(currentDate.format('YYYY-MM-DD')),
    holidayData: holidays.includes(currentDate.format('YYYY-MM-DD')) ? holidayStore.holidays.find(i => dayjs(i.holiday_date).format('YYYY-MM-DD') == currentDate.format('YYYY-MM-DD')) : {},
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
      isHoliday: holidays.includes(currentDate.format('YYYY-MM-DD')),
      holidayData: holidays.includes(currentDate.format('YYYY-MM-DD')) ? holidayStore.holidays.find(i => dayjs(i.holiday_date).format('YYYY-MM-DD') == currentDate.format('YYYY-MM-DD')) : {},
      isIncluded: true,
    });
  } while (currentDate.diff(endDate, 'day') != 0);
  return dateArray;
}

const workingDates = computed(() => {
  if(payload.value.working_daterange?.start && payload.value.working_daterange?.end){
    return generateDateArray(dayjs(payload.value.working_daterange.start).format('YYYY-MM-DD'), dayjs(payload.value.working_daterange.end).format('YYYY-MM-DD'))
  }
  return []
})

const submit = ref(false);

const masks = ref({
  modelValue: 'HH:mm:ss',
});

const attrs = ref([])


const filteredSchedules = computed(() => {
  let filtered = [];
  // Weekends
  filtered.push({
    dates: { repeat: { weekdays: 1 } },
    content: 'red',
    popover: false,
  })

  //Holidays

  forEach(holidayStore.holidays, function(value, index) {
    filtered.push(  {
      keys: `holiday-${index}`,
      highlight: {
        color: 'red',
        fillMode: 'outline',
      },
      dates: [new Date(value.holiday_date)],
      labelType: 'holiday',
      schedule: value,
      popover: {
        label: value.name,
      }
    });
  });
  return filtered;
});

watch(
  filteredSchedules,
  (value) => {
    attrs.value = cloneDeep(value);
  }
)

const handleAddShift = () => {
  if(payload.value.shifts.length == 0){
    payload.value.shifts = [
      ...payload.value.shifts,
      {
        working_time_in: "08:00:00",
        working_time_out: "17:00:00",
      }
    ];
  }else{
    payload.value.shifts = [
      ...payload.value.shifts,
      {
        working_time_in: "00:00:00",
        working_time_out: "00:00:00",
      }
    ];
  }
}

const showErrors = ref(false);

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

const options = computed(() => officeStore.offices.map(i => {
  return {
    value: i.id,
    label: i.name,
  }
}))

const handleAddEmployeeUsingOffice = () => {
  const payloadEmployees = payload.value.employees.filter(i => i.office_id !== selectedOffice.value);
  const filteredEmployee = employeeStore.employees.filter(i => i.office_id == selectedOffice.value);

  payload.value = {
    ...payload.value,
    employees: [
      ...payloadEmployees,
      ...filteredEmployee,
    ]
  }

  selectedOffice.value = null;
  alert("All employees in the selected office are successfully added.");
  // return payloadEmployees.length === 1;

}

const submitScheduleForm = async () => {
  submit.value = true;
  showErrors.value = false;
  formErrors.value = {};
  let formattedPayload = {
    ...payload.value,
    working_dates: workingDates.value,
    working_start_date: payload.value.working_daterange.start,
    working_end_date: payload.value.working_daterange.end,
  }
  scheduleStore.save(formattedPayload)
  .then(res => {
    alert("You have successfully generated a schedule");
    submit.value = false;
    payload.value = {
      working_daterange: {
        start: null,
        end: null,
      },
      shifts: [],
      employees: []
    }
  })
  .catch(err => {
    submit.value = false;
    formErrors.value = err.response.data.errors;
    showErrors.value = true;
  });
}

const selectedOffice = ref(null);

const officeOptions = computed(() => officeStore.offices.map(i => {
  return {
    value: i.id,
    label: i.name,
  }
}))

watch(
  () => authStore.authUser.role,
  (value) => {
    if(value !== 'admin'){
      router.replace({name: 'home'});
    }
  }
)


onMounted(() => {
  employeeStore.get();
  officeStore.get();
  holidayStore.get();
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
              <VDatePicker expanded :columns="columns" :attributes="attrs" :rows="2" v-model.range="payload.working_daterange" @update:modelValue="handleUpdateRange" mode="date" :is-dark="themeStore.calendar.isDark" :color="themeStore.calendar.color"/>
            </div>

            <div class="flex justify-between flex-row-reverse pt-6">
              <button class="btn btn-primary" :disabled="submit">
                Generate Schedules
              </button>
            </div>

            <div class="pt-4" v-if="showErrors">
              <div role="alert" class="alert">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <p class="font-bold">Generating schedule failed. Please review the form.</p>
                  <p v-for="error in formErrors">{{ error[0] }}</p>
                </div>
                <div>
                  <button type="button" class="btn btn-sm btn-ghost" @click="showErrors = false">Close</button>
                </div>
              </div>
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

              <div class="flex join">
                <ComboBox v-model="selectedOffice" :options="options" size="sm" placeholder="Select Office" />
                <div class="tooltip tooltip-bottom" data-tip="Add all employees in this office">
                  <button class="btn btn-sm join-item mt-1" type="button" @click="handleAddEmployeeUsingOffice">
                    <PlusIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            <div class="overflow-x-auto">
              <table class="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>Office</th>
                    <th>Fullname</th>
                    <th>Position</th>
                    <th>Employee Type</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in employeeStore.employees">
                    <td>{{ row.office.name }}</td>
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
                  <span v-if="row.isWeekEnd || row.isHoliday">Overtime Duty</span>
                  <span v-else>Regular Duty</span>
                </td>
                <td>
                  <span v-if="row.isHoliday">{{ row.holidayData.name }}</span>
                </td>
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
                <th>Office</th>
                <th>Fullname</th>
                <th>Position</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in payload.employees">
                <td>{{ row.office.name }}</td>
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
