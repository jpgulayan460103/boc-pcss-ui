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
import { v4 as uuidv4 } from 'uuid';

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
import { cloneDeep, debounce, forEach, groupBy, isEmpty, uniq } from 'lodash';
import { useThemeStore } from '@/stores/theme.js'
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import Pagination from '@/components/Pagination.vue';
import AutoComplete from '@/components/AutoComplete.vue';
import TableHeader from '@/components/TableHeader.vue';
import { usePositionStore } from '@/stores/position';

const { mapCurrent } = useScreens({ xs: '0px', sm: '640px', md: '768px', lg: '1024px' });
const columns = mapCurrent({ lg: 2 }, 1);

const themeStore = useThemeStore()
const userStore = useUserStore();
const officeStore = useOfficeStore();
const positionStore = usePositionStore();
const scheduleStore = useScheduleStore();
const employeeStore = useEmployeeStore();
const holidayStore = useHolidayStore()
const authStore = useAuthStore();
const router = useRouter()


const tab = ref("shifts");
const formErrors = ref({});

const { payload, selectedShift } = storeToRefs(scheduleStore);

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
    return dateArray;
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

const formatTime = (time) => {
  return dayjs(`2001-01-01 ${time}`).format("hh:mm:ss A");
}

const formatDate = (date) => {
  return dayjs(date).format("MMMM D, YYYY");
}

const getPayloadOffice = () => {
  if(payload.value.office_id){
    const office = officeStore.offices.find(i => i.id == payload.value.office_id);
    return office.name;
  }
  return "";
}

const selectedShiftData = computed(() => {
  const data = payload.value.shifts.find(i => i.uuid == selectedShift.value);
  if(data){
    return {
      ...data,
      index: payload.value.shifts.findIndex(i => i.uuid == selectedShift.value)
    }
  }else{
    return {}
  }
})

const handleAddShift = () => {
  if(payload.value.shifts.length == 0){
    const uuid = uuidv4();
    payload.value.shifts = [
      ...payload.value.shifts,
      {
        uuid,
        working_time_in: "08:00:00",
        working_time_out: "17:00:00",
        employees: [],
        positions: [],
      }
    ];
    selectedShift.value = uuid;
  }else{
    payload.value.shifts = [
      ...payload.value.shifts,
      {
        uuid: uuidv4(),
        working_time_in: "00:00:00",
        working_time_out: "00:00:00",
        employees: [],
        positions: [],
      }
    ];
  }
}

const selectedPosition = ref(null);

const handleAddPosition = () => {
  if(!isEmpty(selectedShiftData.value)){
    
    if(selectedPosition.value){
      if(isEmpty(payload.value.shifts[selectedShiftData.value.index].positions)){
        payload.value.shifts[selectedShiftData.value.index].positions = [
          ...payload.value.shifts[selectedShiftData.value.index].positions,
          {
            uuid: uuidv4(),
            employees: 0,
            value: positionStore.positions.find(i => i.id == selectedPosition.value)
          },
        ]

        selectedPosition.value = null;
        
        return false;
      }

      const filteredEmployee = payload.value.shifts[selectedShiftData.value.index].positions.filter(i => i.value.id == selectedPosition.value);
      if(filteredEmployee.length == 0){
        payload.value.shifts[selectedShiftData.value.index].positions = [
          ...payload.value.shifts[selectedShiftData.value.index].positions,
          {
            uuid: uuidv4(),
            employees: 0,
            value: positionStore.positions.find(i => i.id == selectedPosition.value)
          },
        ]

        selectedPosition.value = null;
      }
    }
  }

  
  // const filteredPosition = payload.value.positions.filter(i => i.value.id == selectedPosition.value);
  // if(isEmpty(filteredPosition)){

  //   payload.value.positions = [
  //     ...payload.value.positions,
  //     {
  //       uuid: uuidv4(),
  //       employees: 0,
  //       value: positionStore.positions.find(i => i.id == selectedPosition.value)
  //     }
  //   ];

  //   selectedPosition.value = null;
  // }
}

const handleRemovePosition = (position) => {
  // payload.value.positions = payload.value.positions.filter(i => i.uuid != position.uuid);

  if(!isEmpty(selectedShiftData.value)){

    payload.value.shifts[selectedShiftData.value.index].positions = payload.value.shifts[selectedShiftData.value.index].positions.filter(i => i.uuid != position.uuid);
  }
}

const showErrors = ref(false);

const getErrorMessages = (index, error) => {
  if(index.includes("shift.")){
    return formErrors.value[index][0].label;
  }else{
    return error[0];
  }
}

const handleRemoveShift = (index) => {
  if (index > -1) { // only splice array when item is found
    payload.value.shifts.splice(index, 1); // 2nd parameter means remove one item only
    if(index == selectedShiftData.value.index){
      if(payload.value.shifts.length == 0){
        selectedShift.value = '';
      }else{
        selectedShift.value = payload.value.shifts[0].uuid;
      }
    }else{
      if(payload.value.shifts.length == 0){
        selectedShift.value = '';
      }else{
        selectedShift.value = payload.value.shifts[0].uuid;
      }
    }
  }
}

const searchQuery = ref("");

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

const handleSearchRecord = debounce(() => {
  employeeStore.get({
    q: searchQuery.value,
    page: 1
  });
}, 500)

const handleRemoveEmployee = (employee) => {
  // payload.value.employees = payload.value.employees.filter(i => i.id != employee.id)
  if(!isEmpty(selectedShiftData.value)){
    payload.value.shifts[selectedShiftData.value.index].employees = payload.value.shifts[selectedShiftData.value.index].employees.filter(i => i.id != employee.id)
  }
}

const handleAddEmployee = (employee) => {
  // const filteredEmployee = payload.value.employees.filter(i => i.id == employee.id);
  // if(filteredEmployee.length == 0){
  //   payload.value.employees = [
  //     ...payload.value.employees,
  //     employee
  //   ]
  // }


  if(!isEmpty(selectedShiftData.value)){
    const filteredEmployee = payload.value.shifts[selectedShiftData.value.index].employees.filter(i => i.id == employee.id);
    if(filteredEmployee.length == 0){
      payload.value.shifts[selectedShiftData.value.index].employees = [
        ...payload.value.shifts[selectedShiftData.value.index].employees,
        employee
      ]
    }
  }
};

const isEmployeeAdded = (employee) => {
  // const payloadEmployees = payload.value.employees.filter(i => i.id == employee.id);
  // return payloadEmployees.length === 1;

  if(!isEmpty(selectedShiftData.value)){    
    const payloadEmployees = payload.value.shifts[selectedShiftData.value.index].employees.filter(i => i.id == employee.id);
    return payloadEmployees.length === 1;
  }

  return false;
}

const options = computed(() => officeStore.offices.map(i => {
  return {
    value: i.id,
    label: i.name,
  }
}))

const handleAddEmployeeUsingOffice = async () => {
  // const payloadEmployees = payload.value.employees.filter(i => i.office_id !== selectedOffice.value);

  // const params = {
  //   getType: 'all',
  //   office_id: selectedOffice.value
  // };

  // const officeEmployees = await employeeStore.search(params).then(res => res.data.employees);

  // payload.value = {
  //   ...payload.value,
  //   employees: [
  //     ...payloadEmployees,
  //     ...officeEmployees,
  //   ]
  // }

  // selectedOffice.value = null;
  // alert("All employees in the selected office are successfully added.");


  if(!isEmpty(selectedShiftData.value)){    
    const payloadEmployees = payload.value.shifts[selectedShiftData.value.index].employees.filter(i => i.office_id !== selectedOffice.value);

    const params = {
      getType: 'all',
      office_id: selectedOffice.value
    };

    const officeEmployees = await employeeStore.search(params).then(res => res.data.employees);

    payload.value.shifts[selectedShiftData.value.index].employees = [
        ...payloadEmployees,
        ...officeEmployees
    ]

    selectedOffice.value = null;
    alert("All employees in the selected office are successfully added.");
  }
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

const positionOptions = computed(() => positionStore.positions.map(i => {
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

const employeeOptions = ref([]);

const searchEmployee = (q) => {
  employeeStore.search({
    q,
    sortTable: {
      field: 'full_name',
      order: 'asc',
    }
  })
  .then(res => {
    employeeOptions.value = res.data.employees.data.map(i => {
      return {
        value: i.id,
        label: i.full_name,
        data: i,
      }
    })
  })
}

const handleOptionSelectEmployee = (selectedEmployee) => {
  handleAddEmployee(selectedEmployee.data)
}

const getShiftErrors = (index) => {
  return formErrors.value[`shifts.${index}.working_time_out`];
}

const getSummaryEmployee = (employees) => {
  const positions = groupBy(employees, 'position');
  const result = Object.keys(positions).map((key) => [key, positions[key]])

  return result.map(i => ({
    label: i[0],
    total: i[1].length
  }));
}

const getTotalEmployee = (shift) => {
  const initialValue = 0;

  return shift.positions.reduce(
    (accumulator, currentValue) => accumulator + currentValue.employees,
    initialValue,
  )
}

const getMainCardTitle = computed(() => {
  return '';
  //     <Card :title="tab == 'dates' ? 'Set Working Dates' :  (tab == 'employees' ? 'Set Employees' : 'Set Work Shifts')">
  switch (tab.value) {
    case 'shifts':
      return 'Set Work Shifts';
    case 'employees':
      return 'Set Employees';
    case 'dates':
      return 'Set Working Dates'
    case 'summary':
      return 'View Summary'
    default:
      return '';
  }
})


onMounted(() => {
  employeeStore.get();
  officeStore.get();
  holidayStore.get();
  positionStore.get();
})


</script>

<template>
  <div class="container mx-auto grid grid-cols-12 gap-2">

    <div class="col-span-12 md:col-span-6">
      <Card :title="getMainCardTitle">
        <div role="tablist" class="tabs tabs-bordered">
          <a role="tab" class="tab" :class="{'tab-active': tab == 'shifts'}" @click="tab = 'shifts'">Shifts</a>
          <!-- <a role="tab" class="tab" :class="{'tab-active': tab == 'employees'}" @click="tab = 'employees'">Employees</a> -->
          <a role="tab" class="tab" :class="{'tab-active': tab == 'dates'}" @click="tab = 'dates'">Dates</a>
          <a role="tab" class="tab" :class="{'tab-active': tab == 'settings'}" @click="tab = 'settings'">Inputs</a>
          <a role="tab" class="tab" :class="{'tab-active': tab == 'summary'}" @click="tab = 'summary'">Summary</a>
        </div>

        <form @submit.prevent="submitScheduleForm">

          <div v-if="tab == 'summary'" class="pt-6">

            <div class="space-y-2">
              <p class="text-sm"><span class="font-bold">Schedule:</span> {{ formatDate(payload.working_daterange.start) }} - {{ formatDate(payload.working_daterange.end) }}</p>
              <p class="text-sm"><span class="font-bold">Assigned Office:</span> {{ getPayloadOffice() }}</p>
              <p class="text-sm"><span class="font-bold">Shifts:</span> {{ payload.shifts.length }}</p>
              <p class="text-sm pl-4" v-for="(shift, index) in payload.shifts">
                <span class="font-bold">Shift {{ index +1 }}: </span>
                <span>{{ formatTime(shift.working_time_in) }} - {{ formatTime(shift.working_time_out) }}</span> <br>
                <span class="pl-4 font-bold">Employees: </span> <span>{{ getTotalEmployee(shift) }}</span><br>
                <!-- <span class="pl-4" v-for="employee in getSummaryEmployee(shift.employees)">
                  <span class="font-bold">{{ employee.label }}: </span>
                  <span>{{ employee.total }}</span>
                  <br>
                </span> -->
                <span class="pl-4" v-for="position in shift.positions">
                  <span class="font-bold">{{ position.value.name }}: </span>
                  <span>{{ position.employees }}</span>
                  <br>
                </span>
              </p>
            </div>
          
            <div class="flex justify-between flex-row-reverse pt-6">
              <button class="btn btn-primary" :disabled="submit">
                Generate Schedules
              </button>
            </div>

            <div class="pt-4" v-if="showErrors">
              <div role="alert" class="alert">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div class="space-y-2">
                  <p class="font-bold">Generating schedule failed. Please review the form.</p>
                  <p v-for="(error, index) in formErrors" :key="index">{{ getErrorMessages(index, error) }}</p>
                </div>
                <div>
                  <button type="button" class="btn btn-sm btn-ghost" @click="showErrors = false">Close</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="tab == 'dates'" class="pt-6">
            <div class="overflow-auto w-full">
              <VDatePicker expanded :columns="columns" :attributes="attrs" :rows="2" v-model.range="payload.working_daterange" @update:modelValue="handleUpdateRange" mode="date" :is-dark="themeStore.calendar.isDark" :color="themeStore.calendar.color"/>
            </div>

          </div>

          <div v-if="tab == 'settings'" class="pt-6 space-y-4">

            <div class="col-span-12">
              <FormInput label="Position" :errors="formErrors?.office_id">
                <ComboBox v-model="selectedPosition" :options="positionOptions" />
              </FormInput>
            </div>

            <button type="button" class="btn btn-primary btn-sm join-item" @click="handleAddPosition">
              <PlusIcon class="w-5 h-5" />
              Add Position
            </button>

            <div class="grid grid-cols-12" v-for="(position, index) in payload.positions">

              <div class="col-span-9">
                <FormInput :label="`How many ${position.value.name}?`" :errors="formErrors?.office_id" :right-label="`${position.value.employees_count} max`">
                  <input type="number" :max="position.value.employees_count" v-model="position.employees" placeholder="" class="input input-bordered w-full" />
                </FormInput>
              </div>
              <div class="col-span-3 my-auto pt-8">
                <button type="button" class="btn btn-secondary w-full" @click="handleRemovePosition(position)">
                  <DeleteIcon class="w-5 h-5" /> Remove
                </button>
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
                <FormInput :label="`Shift ${(index + 1)} Time Schedule`" :errors="getShiftErrors(index)">
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
                <input type="text" placeholder="Search for employee" class="input input-bordered input-sm w-full max-w-xs join-item"  v-model="searchQuery" @keyup="handleSearchRecord($event)" />
                <button type="button" class="btn btn-sm join-item">
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
                    <th><TableHeader field="office_id" label="Office" v-model="sortTable" /></th>
                    <th><TableHeader field="full_name" label="Full Name" v-model="sortTable" /></th>
                    <th><TableHeader field="position" label="Position/Designation" v-model="sortTable" /></th>
                    <th><TableHeader field="is_overtimer" label="Type" v-model="sortTable" /></th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in employeeStore.employees">
                    <td>{{ row.office?.name }}</td>
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

                        <div class="tooltip tooltip-left" data-tip="Add Employee" v-else-if="!isEmpty(selectedShift)">
                          <span class="btn btn-ghost btn-sm btn-square" @click="handleAddEmployee(row)">
                            <UserAddIcon class="w-5 h-5" />
                          </span>
                        </div>

                        <div class="tooltip tooltip-left" data-tip="Add Shift" v-else>
                          <span class="btn btn-ghost btn-sm btn-square" @click="tab = 'shifts'">
                            <CalendarIcon class="w-5 h-5" />
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
            <Pagination class="pt-4" :total="employeeStore.pagination.lastPage" :current="employeeStore.pagination.currentPage" @change="handleChangePage" />

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

    <div class="col-span-12 md:col-span-6" v-if="tab == 'shifts' && !isEmpty(selectedShiftData)">
      <Card title="" >

        <div role="tablist" class="tabs tabs-bordered pb-6">
          <a role="tab" class="tab" v-for="(shift, index) in payload.shifts" :key="index" :class="{'tab-active': selectedShift == shift.uuid}" @click="selectedShift = shift.uuid">
            <span>Shift {{ index + 1 }}</span>
          </a>
        </div>


        
        <div class="grid grid-cols-12 mb-4">

          <div class="col-span-9">
            <FormInput label="Position" :errors="formErrors?.office_id">
              <ComboBox v-model="selectedPosition" :options="positionOptions" class="join-item" />
            </FormInput>
          </div>
          <div class="col-span-3 my-auto pt-8">
            <button type="button" class="btn btn-primary btn-sm w-full join-item" @click="handleAddPosition">
              <PlusIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
        

        <div class="grid grid-cols-12" v-if="payload.shifts[selectedShiftData.index]" v-for="(position, index) in payload.shifts[selectedShiftData.index].positions">

          <div class="col-span-9">
            <FormInput :label="`How many ${position.value.name}?`" :errors="formErrors?.office_id" :right-label="`${position.value.employees_count} max`">
              <input type="number" :max="position.value.employees_count" v-model="position.employees" placeholder="" class="input input-bordered w-full" />
            </FormInput>
          </div>
          <div class="col-span-3 my-auto pt-8">
            <button type="button" class="btn btn-secondary w-full" @click="handleRemovePosition(position)">
              <DeleteIcon class="w-5 h-5" /> Remove
            </button>
          </div>
        </div>


      </Card>
    </div>

    <div class="col-span-12 md:col-span-6" v-if="(tab == 'employees' || tab == 'shifts1') && !isEmpty(selectedShiftData)">
      <Card
        title=""
      >
        <!-- :title="`Shift ${ selectedShiftData.index + 1 }: ${formatTime(selectedShiftData.working_time_in)} - ${formatTime(selectedShiftData.working_time_out)} ` -->

        <div role="tablist" class="tabs tabs-bordered">
          <!-- <a role="tab" class="tab" :class="{'tab-active': tab == 'employees'}" @click="tab = 'employees'">Employees</a>
          <a role="tab" class="tab" :class="{'tab-active': tab == 'shifts'}" @click="tab = 'shifts'">Shifts</a>
          <a role="tab" class="tab" :class="{'tab-active': tab == 'dates'}" @click="tab = 'dates'">Dates</a> -->
          <a role="tab" class="tab" v-for="(shift, index) in payload.shifts" :key="index" :class="{'tab-active': selectedShift == shift.uuid}" @click="selectedShift = shift.uuid">
            <span>Shift {{ index + 1 }}</span>
          </a>
        </div>

        <div class="flex justify-between flex-row-reverse pt-14 pb-6">

          <div class="flex join">
            <AutoComplete :options="employeeOptions" :search="searchEmployee" @select="handleOptionSelectEmployee" placeholder="Search for employee name"/>
            <button type="button" class="btn btn-sm join-item">
              <SearchIcon class="w-4 h-4" />
            </button>
          </div>

          <div class="flex join space-x-2 pt-2" v-if="!isEmpty(selectedShiftData)">
            <span class="font-bold">Shift {{ selectedShiftData?.index + 1 }}:</span>
            <span>
              {{ formatTime(selectedShiftData.working_time_in) }} - {{ formatTime(selectedShiftData.working_time_out) }}
            </span>
          </div>

        </div>

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
            <tbody v-if="payload.shifts[selectedShiftData.index]">
              <!-- <tr v-for="row in payload.employees"> -->
              <tr v-for="row in payload.shifts[selectedShiftData.index].employees">
                <td>{{ row.office?.name }}</td>
                <td>{{ row.full_name }}</td>
                <td>{{ row.position }}</td>
                <td class="text-center">
                  <div class="join">

                    <div class="tooltip tooltip-left" data-tip="Remove Employee">
                      <span class="btn btn-ghost btn-sm btn-square text-secondary" @click="handleRemoveEmployee(row)">
                        <UserMinusIcon class="w-5 h-5" />
                      </span>
                    </div>
                    
                    <!-- <div class="tooltip tooltip-left" data-tip="Remove Employee">
                      <span class="btn btn-ghost btn-sm btn-square text-secondary" @click="handleRemoveEmployee(row)">
                        <UserMinusIcon class="w-5 h-5" />
                      </span>
                    </div> -->

                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="!isEmpty(selectedShiftData)">
              <tr v-if="isEmpty(payload.shifts[selectedShiftData.index].employees)">
                <th colspan="20" class="text-center">
                  <p class="text-lg">No Data</p>
                </th>
              </tr>
            </tfoot>
            <tfoot v-else>
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
