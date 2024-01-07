<script setup>
const API = import.meta.env.VITE_API_URL;
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
// import XmarkIcon from '@/icons/XmarkIcon.vue'
import CalendarIcon from '@/icons/CalendarIcon.vue'
import UserMinusIcon from '@/icons/UserMinusIcon.vue'
import LockIcon from '@/icons/LockIcon.vue'
import LockOpenIcon from '@/icons/LockOpenIcon.vue'
import XmarkIcon from '@/icons/XmarkIcon.vue'
import PlusIcon from '@/icons/PlusIcon.vue'
import SearchIcon from '@/icons/SearchIcon.vue'
import SettingIcon from '@/icons/SettingIcon.vue';
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


const tab = ref("offices");
const formErrors = ref({});

const { payload, selectedShift, selectedOffice } = storeToRefs(scheduleStore);

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

const selectedOfficeData = computed(() => {
  const data = payload.value.offices.find(i => i.uuid == selectedOffice.value);
  if(data){
    return {
      ...data,
      index: payload.value.offices.findIndex(i => i.uuid == selectedOffice.value)
    }
  }else{
    return {}
  }
})

const handleAddShift = () => {
  if(payload.value.offices[selectedOfficeData.value.index].shifts.length == 0){
    const uuid = uuidv4();
    payload.value.offices[selectedOfficeData.value.index].shifts = [
      ...payload.value.offices[selectedOfficeData.value.index].shifts,
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
    const lastShift = payload.value.offices[selectedOfficeData.value.index].shifts[payload.value.offices[selectedOfficeData.value.index].shifts.length - 1];

    // console.log(lastShift.working_time_in);
    const workingTimeIn = dayjs(`2024-01-01 ${lastShift.working_time_in}`);
    const workingTimeOut = dayjs(`2024-01-01 ${lastShift.working_time_out}`);
    
    payload.value.offices[selectedOfficeData.value.index].shifts = [
      ...payload.value.offices[selectedOfficeData.value.index].shifts,
      {
        uuid: uuidv4(),
        working_time_in: workingTimeOut.add(1, 'minute').format('H:m:s'),
        working_time_out: workingTimeOut.add(1, 'hour').format('H:m:s'),
        employees: [],
        positions: [],
      }
    ];
  }
}


const selectedOfficeOption = ref(null);

watch(
  selectedOfficeOption,
  (value) => {
    if(value){
      handleAddOffice();
    }
  }
)

const handleSelectOffice = (office) => {
  selectedOffice.value = office.uuid;
}

const handleRemoveOffice = (office) => {
  if(confirm('Are you sure you want to remove?')){
    payload.value.offices = payload.value.offices.filter(i => i.uuid != office.uuid);
    if(payload.value.offices.length != 0){
      selectedOffice.value = payload.value.offices[0].uuid;
    }
  }
}


const handleAddPosition = (value, shiftIndex) => {

  if(value){    
    const uuid = uuidv4();

    const filterExisted = payload.value.offices[selectedOfficeData.value.index].shifts[shiftIndex].positions.filter(i => i.value.id == value);
    if(isEmpty(filterExisted)){
      payload.value.offices[selectedOfficeData.value.index].shifts[shiftIndex].positions = [
        ...payload.value.offices[selectedOfficeData.value.index].shifts[shiftIndex].positions,
        {
          uuid,
          employees: 0,
          value: positionStore.positions.find(i => i.id == value)
        },
      ]
    }
    payload.value.offices[selectedOfficeData.value.index].shifts[shiftIndex].selectedPositionOption = null;
  }
}

const handleAddOffice = () => {
  const uuid = uuidv4();
  if(selectedOfficeOption.value){
    if(isEmpty(payload.value.offices.find(i => i.value.id == selectedOfficeOption.value))){
      if(isEmpty(payload.value.offices)){
        selectedOffice.value = uuid;
      }
      payload.value.offices = [
        ...payload.value.offices,
        {
          uuid,
          shifts: [],
          value: officeStore.offices.find(i => i.id == selectedOfficeOption.value)
        },
      ]
    }
    selectedOfficeOption.value = null;
  }
}

const getShiftPostionEmployeesError = (shiftKey, positionKey) => {
  return formErrors.value[`offices.${selectedOfficeData.value.index}.shifts.${shiftKey}.positions.${positionKey}`];
}

const getShiftPostionError = (shiftKey) => {
  return formErrors.value[`offices.${selectedOfficeData.value.index}.shifts.${shiftKey}.positions`];
}

const handleRemovePosition = (shiftIndex, position) => {
  payload.value.offices[selectedOfficeData.value.index].shifts[shiftIndex].positions = payload.value.offices[selectedOfficeData.value.index].shifts[shiftIndex].positions.filter(i => i.uuid != position.uuid);
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
    payload.value.offices[selectedOfficeData.value.index].shifts.splice(index, 1); // 2nd parameter means remove one item only
    if(index == selectedShiftData.value.index){
      if(payload.value.offices[selectedOfficeData.value.index].shifts.length == 0){
        selectedShift.value = '';
      }else{
        selectedShift.value = payload.value.offices[selectedOfficeData.value.index].shifts[0].uuid;
      }
    }else{
      if(payload.value.offices[selectedOfficeData.value.index].shifts.length == 0){
        selectedShift.value = '';
      }else{
        selectedShift.value = payload.value.offices[selectedOfficeData.value.index].shifts[0].uuid;
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


const showGeneratedSchedule = ref(false);

const generatedSchedule = ref({});

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
      employees: [],
      offices: [],
    }
    generatedSchedule.value = res.data;
    showGeneratedSchedule.value = true;
  })
  .catch(err => {
    submit.value = false;
    formErrors.value = err.response.data.errors;
    showErrors.value = true;
  });
}

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
  return formErrors.value[`offices.${selectedOfficeData.value.index}.shifts.${index}.working_time_out`];
}

const getOfficeErrors = (index) => {
  const errorsField = Object.keys(formErrors.value);
  const partialMatch = `offices.${index}`;
  const matchingWords = errorsField.filter(word => word.includes(partialMatch));
  if(!isEmpty(matchingWords)){
    if(formErrors.value[`offices.${index}.shifts`]){
      return [
        'Review the shifting configuration.',
        ...formErrors.value[`offices.${index}.shifts`]
      ];
      return formErrors.value[`offices.${index}.shifts`];
    }
    return ['Review the shifting configuration.']
  }
  return [];
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
  <div class="container mx-auto grid grid-cols-12 gap-4">

    <div class="col-span-12 md:col-span-6">
      <Card :title="getMainCardTitle" class="min-h-full">
        <div role="tablist" class="tabs tabs-bordered">
          <a role="tab" class="tab" :class="{'tab-active': tab == 'offices'}" @click="tab = 'offices'">Offices</a>
          <a role="tab" class="tab" :class="{'tab-active': tab == 'settings'}" @click="tab = 'settings'"  v-if="payload.shifts.length != 0">Shift Composition</a>
          <a role="tab" class="tab" :class="{'tab-active': tab == 'dates'}" @click="tab = 'dates'">Dates</a>
          <a role="tab" class="tab" :class="{'tab-active': tab == 'summary'}" @click="tab = 'summary'">Summary</a>
        </div>

        <form @submit.prevent="submitScheduleForm">

          <div v-if="tab == 'summary'" class="pt-6">

            <div class="space-y-2">
              <p class="text-sm">
                <span class="font-bold">Schedule: </span>
                <span v-if="payload.working_daterange.start && payload.working_daterange.end">{{ formatDate(payload.working_daterange.start) }} - {{ formatDate(payload.working_daterange.end) }}</span>
                <span v-else class="text-error font-bold">No working dates selected.</span>
                <br>
                <span class="font-bold pl-4">Working Days: </span><span>{{ workingDates.length }}</span><br>
                <span class="font-bold pl-8">Regular Duty Days: </span><span>{{ workingDates.filter(i => !(i.isWeekEnd || i.isHoliday)).length }}</span><br>
                <span class="font-bold pl-8">Overtime Duty Days: </span><span>{{ workingDates.filter(i => (i.isWeekEnd || i.isHoliday)).length }}</span><br>
              </p>
              <!-- <p class="text-sm"><span class="font-bold">Assigned Office:</span> {{ getPayloadOffice() }}</p> -->
              <p class="text-sm"><span class="font-bold">Offices:</span> {{ payload.offices.length }}</p>
              <div v-for="office in payload.offices">
                <p class="font-bold text-sm">{{ office.value.name }}</p>
                <p class="text-sm pl-4" v-for="(shift, index) in office.shifts">
                  <span class="font-bold">Shift {{ index +1 }}: </span>
                  <span>{{ formatTime(shift.working_time_in) }} - {{ formatTime(shift.working_time_out) }}</span> <br>
                  <span class="pl-4 font-bold">Employees: </span> <span>{{ getTotalEmployee(shift) }}</span><br>
                  <span class="pl-8" v-for="position in shift.positions">
                    <span class="font-bold">{{ position.value.name }}: </span>
                    <span>{{ position.employees }}</span>
                    <br>
                  </span>
                </p>
              </div>
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
                  <!-- <p v-for="(error, index) in formErrors" :key="index">{{ getErrorMessages(index, error) }}</p> -->
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


          <div v-if="tab == 'offices'" class="pt-6 space-y-2">

            <div class="col-span-12">
              <FormInput label="Add Office for Assignment" :errors="formErrors.offices">
                <ComboBox v-model="selectedOfficeOption" :options="officeOptions" />
              </FormInput>
            </div>
            <div class="divider"></div> 
            <div class="grid grid-cols-12" v-if="payload.offices" v-for="(office, officeIndex) in payload.offices">

              <div class="col-span-12">
                <FormInput
                  :label="`Office ${(officeIndex + 1)}`"
                  :errors="getOfficeErrors(officeIndex)"
                >
                <div class="join w-full">
                  <div class="tooltip" data-tip="View Shiftings">
                    <button type="button" class="btn join-item" :class="[selectedOfficeData.uuid == office.uuid ? 'btn-primary' : 'btn-default']" @click="handleSelectOffice(office)">
                      <LockIcon class="w-5 h-5" v-if="selectedOfficeData.uuid != office.uuid" />
                      <LockOpenIcon class="w-5 h-5" v-else />
                    </button>
                  </div>
                  <input type="string" readonly :value="office.value.name" placeholder="" class="input input-bordered w-full join-item cursor-pointer"  @click="handleSelectOffice(office)" />
                  <div class="tooltip" data-tip="Remove">
                    <button type="button" class="btn btn-default join-item" @click="handleRemoveOffice(office)">
                      <XmarkIcon class="w-5 h-5" />
                    </button>
                  </div>
                </div>
                </FormInput>
              </div>
            </div>
            
          </div>

        </form>
      </Card>
    </div>

    <div class="col-span-12 md:col-span-6" v-if="tab == 'offices' && payload.offices[selectedOfficeData.index]">
      <Card :title="`${selectedOfficeData.value.name} Shiftings`"  class="min-h-full">
        <div class="pt-6 col-span-12">

          <div class="grid grid-cols-12 mb-2" v-for="(shift, shiftIndex) in payload.offices[selectedOfficeData.index].shifts">
            <div class="col-span-12">
              <FormInput :label="`Shift ${(shiftIndex + 1)} Time Schedule`" :errors="getShiftErrors(shiftIndex)">
                <div class="join w-full">
                  <div class="input input-bordered w-full join-item space-x-2">
                    <VDatePicker class="mt-1.5" expanded v-model.string="shift.working_time_in" mode="time" :masks="masks" :is-dark="themeStore.calendar.isDark" :color="themeStore.calendar.color" hide-time-header />
                    <span>to</span>
                    <VDatePicker class="mt-1.5" expanded v-model.string="shift.working_time_out" mode="time" :masks="masks" :is-dark="themeStore.calendar.isDark" :color="themeStore.calendar.color" hide-time-header />
                  </div>
                  <div class="tooltip" data-tip="Remove">
                    <button type="button" class="btn btn-default join-item" @click="handleRemoveShift(shiftIndex)">
                      <XmarkIcon class="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </FormInput>
            </div>
          </div>

          <button type="button" class="btn btn-primary join-item mt-4" @click="handleAddShift">
            <PlusIcon class="w-5 h-5" />
            Add Shift
          </button>

        </div>
        
      </Card>
    </div>


    <div class="col-span-12 md:col-span-6" v-if="tab == 'offices' && payload.offices[selectedOfficeData.index]"  v-for="(shift, shiftIndex) in payload.offices[selectedOfficeData.index].shifts">
      <Card :title="`${selectedOfficeData.value.name} Shift ${(shiftIndex + 1)} Composition`"  class="min-h-full">
        <div class="pt-6 col-span-12">

            <div class="col-span-12">
              <FormInput
                :label="`Add Employee Composition`"
                :errors="getShiftPostionError(shiftIndex)"
              >
                <ComboBox v-model="shift.selectedPositionOption" :options="positionOptions" class="join-item" @change="(value) => handleAddPosition(value, shiftIndex)" />
              </FormInput>
            </div>
            <div class="divider"></div> 
            <div class="grid grid-cols-12" v-for="(position, positionIndex) in shift.positions">

              <div class="col-span-12">
                <FormInput
                  :label="`How many ${position.value?.name}?`"
                  :right-label="`${position.value?.employees_count} max`"
                  :errors="getShiftPostionEmployeesError(shiftIndex, positionIndex)"
                >
                  <div class="join w-full">
                    <input type="number" :max="position.value?.employees_count" v-model="position.employees" placeholder="" class="input input-bordered w-full join-item" />
                    <div class="tooltip" data-tip="Remove">
                      <button type="button" class="btn btn-default join-item" @click="handleRemovePosition(shiftIndex, position)">
                        <XmarkIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </FormInput>
              </div>
            </div>

        </div>
        
      </Card>
    </div>


    <div class="col-span-12 md:col-span-6" v-if="tab == 'dates'">
      <Card title="Working Dates" class="min-h-full">
        <div class="overflow-x-auto">
          <table class="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type of Duty</th>
                <th>Holiday</th>
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

    <div class="col-span-12 md:col-span-6" v-if="tab == 'summary' && showGeneratedSchedule">
      <Card title="Generated Schedule" closable @close="showGeneratedSchedule = false"  class="min-h-full">
        <div class="w-full h-[80vh]">
          <iframe :src="`${API}/api/schedules/${generatedSchedule.id}/pdf?view=1`" class="w-full h-full" title="Iframe Example"></iframe>
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
