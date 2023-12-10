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

const themeStore = useThemeStore()
const scheduleStore = useScheduleStore();
const time = ref("00:00:00");

const masks = ref({
  modelValue: 'HH:mm:ss',
});
const attrs = ref([]);
const currentPage = ref(1);

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
  'gray',
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
  forEach(filteredUserSchedules.value, function(value, index) {
    filtered.push(  {
      keys: index,
      dot: {
        color: colors[random(0, colors.length)],
        fillMode: 'solid',
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
    // const elements = document.getElementsByClassName('pagination');
    // const boxes = document.querySelectorAll('ul.pagination');
    Array.from(document.querySelectorAll('ul.pagination')).forEach(
      (el) => el.classList.add('flex')
    );
    // Array.from(document.querySelectorAll('ul.pagination .page-item')).forEach(
    //   (el) => el.classList.add('p-2')
    // );
  }
)


const getFontColor = (color = 'red') => {
  return `bg-${color}-500`
}

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
                    <span class="font-bold" :class="getFontColor(attribute.dot.base.color)">{{ attribute.schedule.user.full_name }}</span><br>
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
            <input type="text" placeholder="Search for employee" @keyup="handleSearchRecord($event)" class="input input-bordered input-sm w-full max-w-xs join-item" />
            <button class="btn btn-sm join-item">
              <SearchIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <!-- <table class="table"> -->

            <VTable :data="scheduleStore.schedules" class="table" :pageSize="pageSize" :currentPage.sync="currentPage">
              <template #head>
                <tr>
                  <th>Date</th>
                  <th>Employee Name</th>
                  <th>Schedule</th>
                  <th>Office</th>
                </tr>
              </template>
              <template #body="{rows}">
                <tr v-for="row in rows" :key="row.id">
                  <td>{{ row.working_date }}</td>
                  <td>{{ row.user?.full_name }}</td>
                  <td>{{ formatTime(row.working_time_in) }} <br> {{ formatTime(row.working_time_out) }}</td>
                  <td>{{ row.office?.name }}</td>
                </tr>
              </template>
            </VTable>
            <VTPagination
              v-model:currentPage="currentPage"
              :total-pages="totalPages"
              class="pt-2"
            >
            <template #firstPage>
              <span>First</span>
            </template>
            
            <template #lastPage>
              <span>First</span>
            </template>
            
            <template #next>
              <ChevronIcon class="w-6 h-6 rotate-90" />
            </template>
            
            <template #previous>
              <ChevronIcon class="w-6 h-6 -rotate-90" />
            </template>
            </VTPagination>
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
