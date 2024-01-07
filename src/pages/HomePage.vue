<script setup>

const API = import.meta.env.VITE_API_URL;

import Card from '@/components/Card.vue'
import { computed, onMounted, reactive, ref, watch} from 'vue';

import { useScreens } from 'vue-screen-utils';
import { useThemeStore } from '@/stores/theme.js'
import { useHolidayStore } from '@/stores/holiday.js'
import { useAuthStore } from '@/stores/auth.js'
import { useScheduleStore } from '@/stores/schedule'
import dayjs from 'dayjs'
import { cloneDeep, debounce, forEach, groupBy, map, random, uniqBy } from 'lodash';
import profile from '@/assets/profile.png'
import SearchIcon from '@/icons/SearchIcon.vue';
import DownloadIcon from '@/icons/DownloadIcon.vue';
import DeleteIcon from '@/icons/DeleteIcon.vue';
import PlusIcon from '@/icons/PlusIcon.vue';
import FormInput from '@/components/FormInput.vue';

const themeStore = useThemeStore()
const holidayStore = useHolidayStore()
const authStore = useAuthStore()
const scheduleStore = useScheduleStore();
const time = ref("00:00:00");

const masks = ref({
  modelValue: 'HH:mm:ss',
});

const formType = ref('schedule');

const formErrors = ref({});
const payload = reactive({
  holiday_date: null,
  name: null,
});

const submit = ref(false);
const attrs = ref([]);
const currentPage = ref(1);
const tab = ref('schedules');

const handleDeleteSchedule = (schedule) => {
  if(confirm('Are you sure you want to delete schedule')){
    scheduleStore.destroy(schedule)
    .then(res => {
      scheduleStore.get();
    })
  }
}

const handleDownloadSchedule = (schedule) => {
  window.location = `${API}/api/schedules/${schedule.id}/pdf`
  // submit.value = true
  // scheduleStore.download(schedule)
  //   .then(res => {
  //     submit.value = false
  //     window.location = `${API}/${res.data.url}`
  //   })
}

const { mapCurrent } = useScreens({ xs: '0px', sm: '640px', md: '768px', lg: '1024px' });
const columns = mapCurrent({ lg: 2 }, 1);

// const expanded = mapCurrent({ lg: true }, true);

const emit = defineEmits(['update:currentPage', 'update:currentPage'])
const schedulesLoaded = ref(false);
const holidaysLoaded = ref(false);
onMounted(() => {
  scheduleStore.get()
  .then(res => {
    schedulesLoaded.value = true;
  });
  holidayStore.get()
  .then(res => {
    holidaysLoaded.value = true;
  });
})


const colors = [
  'yellow',
  'green',
  'teal',
  'blue',
  'indigo',
  'purple',
];

const filteredSchedules = computed(() => {
  if(schedulesLoaded.value && holidaysLoaded.value){    
    //schedules
    let filtered = [];
    forEach(scheduleStore.schedules, function(value, index) {
      let color = colors[random(0, colors.length)];
      filtered.push(  {
        keys: `schedule-${index}`,
        highlight: {
          start: { fillMode: 'light', color },
          base: { fillMode: 'light', color },
          end: { fillMode: 'light', color },
        },
        dates: { start: new Date(value.working_start_date), end: new Date(value.working_end_date) },
        schedule: value,
        color,
        labelType: 'schedule',
        popover: {
          visibility: 'hover',
        }
      });
    });
  
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
          visibility: 'hover',
        }
      });
    });
    return filtered;
  }

  return [];
});

const formatTime = (time) => {
  return dayjs(`2001-01-01 ${time}`).format("hh:mm:ss A");
}

const formatDate = (date) => {
  return dayjs(date).format("MMMM D, YYYY");
}

const handleSelectDate = (e) => {
  payload.holiday_date = dayjs(e.date).format("YYYY-MM-DD");
}

const submitHolidayForm = debounce((e) => {
  submit.value = true;
  holidayStore.save(payload)
  .then(res => {
    resetHolidayForm();
    submit.value = false;
    alert('Holiday has been added.')
    holidayStore.get();
  })
  .catch(err => {
    submit.value = false;
    formErrors.value = err.data.response.errors
  })
}, 250)

const resetHolidayForm = () => {
  payload.holiday_date = null;
  payload.name = null;
}

const pageSize = ref(12);

const handleAddHoliday = () => {
  formType.value = 'holiday';
  holidayModal.showModal()
}

const handleDeleteHoliday = (holiday) => {
  if(confirm('Are you sure you want to delete this holiday?')){
    holidaysLoaded.value = false;
    holidayStore.destroy(holiday)
    .then(res => {
      holidayStore.get();
      holidaysLoaded.value = true;
    })
  }
}

watch(
  filteredSchedules,
  (value) => {
    attrs.value = cloneDeep(value);
  }
)

</script>

<template>
  <div class="container mx-auto grid grid-cols-12 gap-2">
    <div class="col-span-12 md:col-span-6">
      <Card title="Work Schedule Calendar">
        <div class="overflow-auto w-full pt-4">
          <VCalendar expanded :columns="columns" :rows="3" :attributes="attrs" :is-dark="themeStore.calendar.isDark" :color="themeStore.calendar.color" @dayfocusin="handleSelectDate">
            <template #day-popover="{ attributes, day }">
              <div class="text-xs bg-base-100 content-base space-y-2 p-2">
                <span class="font-bold">{{ dayjs(day.date).format('ddd, MMM D, YYYY') }}</span>
                <div class="flex justify-between space-x-1.5 mb-2" v-for="attribute in attributes">
                  <div class="grow" v-if="attribute.labelType == 'schedule'">
                    <div class="vc-dots" style="justify-content: initial;" v-for="office in attribute.schedule.offices">
                      <span :class="`vc-dot vc-${attribute.color} vc-attr`" style="width: 8px; height: 6px;"></span>
                      <span class="font-bold">{{ office.office?.name }}</span>
                    </div>
                    <!-- <span v-for="shifts in attribute.schedule.shifts">
                      {{ formatTime(shifts.working_time_in) }} - {{ formatTime(shifts.working_time_out) }}
                      <br>
                    </span> -->
                  </div>
                  <div class="grow" v-else>
                    <div class="vc-dots" style="justify-content: initial;">
                      <span :class="`vc-dot vc-red vc-attr`" style="width: 8px; height: 6px;"></span>
                      <span class="font-bold">{{ attribute.schedule.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </VCalendar>
        </div>
      </Card>
    </div>
    <div class="col-span-12 md:col-span-6">
      <Card title="List of Work Schedules">
        <div role="tablist" class="tabs tabs-bordered">
          <a role="tab" class="tab" :class="{'tab-active': tab == 'schedules'}" @click="tab = 'schedules'">Schedules</a>
          <a role="tab" class="tab" :class="{'tab-active': tab == 'holidays'}" @click="tab = 'holidays'">Holidays</a>
        </div>

        <div v-if="tab == 'schedules'" class="pt-6">
          <div class="overflow-x-auto">
            <table class="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Office</th>
                  <th>Schedule Date</th>
                  <!-- <th>Shifts</th> -->
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in scheduleStore.schedules" :key="row.id">
                  <td>
                    <span v-for="office in row.offices">
                      {{ office.office.name }}
                      <br>
                    </span>
                  </td>
                  <td>{{ formatDate(row.working_start_date) }} <br> {{ formatDate(row.working_end_date) }}</td>
                  <!-- <td>
                    <span v-for="shifts in row.shifts">
                      {{ formatTime(shifts.working_time_in) }} - {{ formatTime(shifts.working_time_out) }}
                      <br>
                    </span>
                  </td> -->
                  <td>
                    <div class="join">
                      <div class="tooltip tooltip-left" data-tip="Download PDF">
                        <button class="btn btn-ghost btn-sm btn-square" @click="handleDownloadSchedule(row)" :disabled="submit">
                          <span class="loading loading-spinner loading-xs" v-if="submit"></span>
                          <DownloadIcon class="w-5 h-5" v-else />
                        </button>
                      </div>
                      <div class="tooltip tooltip-left" data-tip="Delete Schedule" v-if="authStore.authUser.role == 'admin'">
                        <button class="btn btn-ghost btn-sm btn-square" @click="handleDeleteSchedule(row)">
                          <DeleteIcon class="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="scheduleStore.schedules.length == 0">
                <tr>
                  <th colspan="20" class="text-center">
                    <p class="text-lg">No Data</p>
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div v-if="tab == 'holidays'" class="pt-6">

          <div class="flex justify-between" v-if="authStore.authUser.role == 'admin'">
            <button type="button" class="btn btn-primary btn-sm join-item" @click="handleAddHoliday" v-if="payload.holiday_date">
              <PlusIcon class="w-5 h-5" />
              Add Holiday
            </button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Holiday</th>
                  <th v-if="authStore.authUser.role == 'admin'">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in holidayStore.holidays">
                  <td>{{ formatDate(row.holiday_date) }}</td>
                  <td>{{ row.name }}</td>
                  <td v-if="authStore.authUser.role == 'admin'">
                    <div class="join">
                      <div class="tooltip tooltip-left" data-tip="Delete Holiday">
                        <button class="btn btn-ghost btn-sm btn-square" @click="handleDeleteHoliday(row)">
                          <DeleteIcon class="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="holidayStore.holidays.length == 0">
                <tr>
                  <th colspan="20" class="text-center">
                    <p class="text-lg">No Data</p>
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Open the modal using ID.showModal() method -->
        <dialog id="holidayModal" class="modal">
          <div class="modal-box">
            <h3 class="font-bold text-lg pb-2">Add Holiday</h3>
            <form @submit.prevent="submitHolidayForm" id="holidayForm">
              <div class="grid grid-cols-12 space-y-4">

                <div class="col-span-12">
                  <FormInput label="Holiday Date" :errors="formErrors?.holiday_date">
                    <input type="text" readonly v-model="payload.holiday_date" class="input input-bordered w-full">
                  </FormInput>
                </div>

                <div class="col-span-12">
                  <FormInput label="Holiday Name" :errors="formErrors?.name">
                    <input type="text" v-model="payload.name" class="input input-bordered w-full">
                  </FormInput>
                </div>


              </div>
            </form>
            <!-- <div class="modal-action"> -->
              <form method="dialog" id="holidayModalClose">
              <div class="modal-action flex justify-between flex-row-reverse pt-6">
                <button form="holidayForm" type="submit" class="btn btn-primary" :disabled="submit">
                  Submit
                </button>

                <button form="holidayModalClose" type="submit" class="btn btn-default" @click="resetHolidayForm">
                  Cancel
                </button>
              </div>
            </form>
            <!-- </div> -->
          </div>
        </dialog>


      </Card>
    </div>
    
  </div>
</template>

<style>
.page-item{
  padding-left: 3px;
  padding-right: 3px;
}
.page-item.active{
  border: 1px solid black;
}
</style>
