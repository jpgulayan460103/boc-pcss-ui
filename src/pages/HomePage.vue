<script setup>
import Card from '@/components/Card.vue'
import { computed, onMounted, ref, watch} from 'vue';

import { useScreens } from 'vue-screen-utils';
import { useThemeStore } from '@/stores/theme.js'
import { useScheduleStore } from '@/stores/schedule'
import dayjs from 'dayjs'
import { cloneDeep, forEach, groupBy, map, random, uniqBy } from 'lodash';
import profile from '@/assets/profile.png'
import SearchIcon from '@/icons/SearchIcon.vue';
import ChevronIcon from '@/icons/ChevronIcon.vue';
import DeleteIcon from '@/icons/DeleteIcon.vue';

const themeStore = useThemeStore()
const scheduleStore = useScheduleStore();
const time = ref("00:00:00");

const masks = ref({
  modelValue: 'HH:mm:ss',
});
const attrs = ref([]);
const currentPage = ref(1);

const handleDeleteSchedule = (schedule) => {
  if(confirm('Are you sure you want to delete schedule')){
    scheduleStore.destroy(schedule)
    .then(res => {
      scheduleStore.get();
    })
  }
}

const { mapCurrent } = useScreens({ xs: '0px', sm: '640px', md: '768px', lg: '1024px' });
const columns = mapCurrent({ lg: 2 }, 1);

// const expanded = mapCurrent({ lg: true }, true);

const emit = defineEmits(['update:currentPage', 'update:currentPage'])

onMounted(() => {
  scheduleStore.get();
})

const filteredUserSchedules = computed(() => {
  return groupBy(scheduleStore.schedules, 'user_id')
}); 

const colors = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'indigo',
  'purple',
  'pink',
];

const filteredSchedules = computed(() => {
  let filtered = [];
  forEach(scheduleStore.schedules, function(value, index) {
    let color = colors[random(0, colors.length)];
    filtered.push(  {
      keys: index,
      highlight: {
        start: { fillMode: 'light', color },
        base: { fillMode: 'light', color },
        end: { fillMode: 'light', color },
      },
      dates: { start: new Date(value.working_start_date), end: new Date(value.working_end_date) },
      schedule: value,
      color,
      popover: {
        visibility: 'hover',
      }
    });
  });
  // filtered.push({
  //   dates: { repeat: { weekdays: 7 } },
  //   content: 'red',
  //   popover: false,
  // })
  filtered.push({
    dates: { repeat: { weekdays: 1 } },
    content: 'red',
    popover: false,
  })
  return filtered;
});

const formatTime = (time) => {
  return dayjs(`2001-01-01 ${time}`).format("hh:mm:ss A");
}

const formatDate = (date) => {
  return dayjs(date).format("MMMM D, YYYY");
}
const pageSize = ref(12);

const totalPages = computed(() => {
  const totalSchedules = scheduleStore.schedules.length;
  const totalPage = totalSchedules / pageSize.value;
  if(totalSchedules % pageSize.value > 0){
    return parseInt(totalPage.toFixed()) + 1
  }
  return parseInt(totalPage.toFixed())
})

watch(
  filteredSchedules,
  (value) => {
    attrs.value = cloneDeep(value);
  }
)


const getFontColor = (color = 'red') => {
  return `bg-${color}-500`
}

</script>

<template>
  <div class="container mx-auto grid grid-cols-12 gap-2">
    <div class="col-span-12 md:col-span-6">
      <Card title="Work Schedule Calendar">
        <div class="overflow-auto w-full pt-4">
          <VCalendar expanded :columns="columns" :rows="3" :attributes="attrs" :is-dark="themeStore.calendar.isDark" :color="themeStore.calendar.color">
            <template #day-popover="{ attributes }">
              <div class="text-xs bg-base-100 content-base space-y-2 p-2">
                <div class="flex justify-between space-x-1.5 mb-2" v-for="attribute in attributes">
                  <div class="grow">
                    <!-- <span class="font-bold">{{ formatDate(attribute.schedule.working_start_date) }} - {{ formatDate(attribute.schedule.working_end_date) }}</span> <br> -->
                    <div class="vc-dots" style="justify-content: initial;">
                      <span :class="`vc-dot vc-${attribute.color} vc-attr`" style="width: 8px; height: 8px;"></span>
                      <span class="font-bold">{{ attribute.schedule.office.name }}</span>
                    </div>
                    <span v-for="shifts in attribute.schedule.shifts">
                      {{ formatTime(shifts.working_time_in) }} - {{ formatTime(shifts.working_time_out) }}
                      <br>
                    </span>
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
        <div class="overflow-x-auto">
          <table class="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Office</th>
                <th>Schedule Date</th>
                <th>Shifts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in scheduleStore.schedules" :key="row.id">
                <td>{{ row.office?.name }}</td>
                <td>{{ formatDate(row.working_start_date) }} <br> {{ formatDate(row.working_end_date) }}</td>
                <td>
                  <span v-for="shifts in row.shifts">
                    {{ formatTime(shifts.working_time_in) }} - {{ formatTime(shifts.working_time_out) }}
                    <br>
                  </span>
                </td>
                <td>
                  <div class="join">
                    <div class="tooltip tooltip-left" data-tip="Delete Schedule">
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
