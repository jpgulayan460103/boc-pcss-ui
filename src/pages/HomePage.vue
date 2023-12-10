<script setup>
import Card from '@/components/Card.vue'
import { computed, onMounted, ref, watch} from 'vue';

import { useScreens } from 'vue-screen-utils';
import { useThemeStore } from '@/stores/theme.js'
import { useScheduleStore } from '@/stores/schedule'
import dayjs from 'dayjs'
import { cloneDeep, forEach, groupBy, map, uniqBy } from 'lodash';
import profile from '@/assets/profile.png'
import SearchIcon from '@/icons/SearchIcon.vue';

const themeStore = useThemeStore()
const scheduleStore = useScheduleStore();
const time = ref("00:00:00");

const masks = ref({
  modelValue: 'HH:mm:ss',
});
const attrs = ref([]);

const { mapCurrent } = useScreens({ xs: '0px', sm: '640px', md: '768px', lg: '1024px' });
const columns = mapCurrent({ lg: 2 }, 1);

// const expanded = mapCurrent({ lg: true }, true);

onMounted(() => {
  scheduleStore.get();
})

const filteredUserSchedules = computed(() => {
  return groupBy(scheduleStore.schedules, 'user_id')
}); 

const filteredSchedules = computed(() => {
  let filtered = [];
  forEach(filteredUserSchedules.value, function(value, index) {
    filtered.push(  {
      keys: index,
      highlight: {
        color: 'red',
        fillMode: 'outline',
      },
      dates: value.map(i => new Date(i.working_date)),
      schedule: value[0],
      popover: {
        visibility: 'hover',
      }
    },);
  });
  return filtered;
});

const formatTime = (time) => {
  return dayjs(`2001-01-01 ${time}`).format("hh:mm:ss A");
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
      <Card title="Employee Work Schedule Calendar">
        <div class="overflow-auto w-full pt-4">
          <VCalendar expanded :columns="columns" :rows="3" :attributes="attrs" :is-dark="themeStore.isDark()" :color="themeStore.isDark() ? 'sky-blue' : 'green'">
            <template #day-popover="{ attributes }">
              <div class="text-xs bg-base-100 content-base space-y-2 p-2">
                <div class="flex justify-between space-x-1.5 mb-2" v-for="attribute in attributes">
                  <!-- {{ console.log(attribute.schedule) }} -->
                  <img :src="profile" alt="" class="w-12 h-12 rounded-full border-4 p-2">
                  <div class="grow">
                    <span class="font-bold">{{ attribute.schedule.user.full_name }} <br></span>
                    {{ attribute.schedule.office.name }} ({{ formatTime(attribute.schedule.working_time_in) }} - {{ formatTime(attribute.schedule.working_time_out) }})  <br>
                    {{ attribute.schedule.user.position }}
                  </div>
                </div>
              </div>
            </template>
          </VCalendar>
        </div>
      </Card>
    </div>
    <div class="col-span-12 md:col-span-6">
      <Card title="">
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
                <th>Date</th>
                <th>Employee Name</th>
                <th>Schedule</th>
                <th>Office</th>
              </tr>
            </thead>
            <tbody>
                <tr v-for="schedule in scheduleStore.schedules">
                  <td>{{ schedule.working_date }}</td>
                  <td>{{ schedule.user?.full_name }}</td>
                  <td>{{ formatTime(schedule.working_time_in) }} <br> {{ formatTime(schedule.working_time_out) }}</td>
                  <td>{{ schedule.office?.name }}</td>
                </tr>
              </tbody>
          </table>
        </div>
      </Card>
    </div>
    
  </div>
</template>

<style scoped>
</style>
