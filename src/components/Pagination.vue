<script setup>

import ChevronDoubleIcon from '@/icons/ChevronDoubleIcon.vue'
import ChevronIcon from '@/icons/ChevronIcon.vue'
import { ref } from 'vue';

const props = defineProps({
  total: {
    type: Number,
    // required: true,
    default: 10,
  },
  current: {
    type: Number,
    default: 1,
  }
})

const handleClickPage = (page) => {
  if(page !== props.current){
    emit('change', page);
  }
}

const emit = defineEmits(['change'])

const pager = ref(null);

const handleGoToPage = () => {
  if(pager.value > props.total){
    pager.value = props.total;
  }
  handleClickPage(pager.value);
}

</script>

<template>

  <div class="join">
    <div class="tooltip" data-tip="First Page" v-if="props.current != 1">
      <button type="button" class="join-item btn btn-sm" @click="handleClickPage(1)">
        <ChevronDoubleIcon class="w-3 h-3 -rotate-90" />
      </button>
    </div>
    <div class="tooltip" data-tip="Previous Page" v-if="props.current > 1">
      <button type="button" class="join-item btn btn-sm" @click="handleClickPage(props.current - 1)">
        <ChevronIcon class="w-3 h-3 -rotate-90" />
      </button>
    </div>
    <!-- <button type="button" class="join-item btn btn-sm"> -->
      <!-- Page {{ current }} -->
    <!-- </button> -->


    <div class="dropdown dropdown-bottom">
      <div tabindex="0" role="button" class="join-item btn btn-sm">Page {{ props.current }}</div>
      <ul tabindex="0" class="dropdown-content p-0 z-30 menu shadow bg-base-100 rounded-box w-52">
        <li>
          <a>
            <input type="number" v-model="pager" step="1" @keypress.enter="handleGoToPage" class="input input-xs input-bordered" placeholder="Go to page">
          </a>
        </li>
        <!-- <li v-for="page in total" @click="handleClickPage(page)">
          <a :class="{'active': page == props.current}">Page {{ page }}</a>
        </li> -->
      </ul>
    </div>

    <!-- <details class="dropdown">
      <summary class="join-item btn btn-sm">Page {{ current }}</summary>
      <ul class="shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-28">
        <li v-for="page in total"><a>Page {{ page }}</a></li>
      </ul>
    </details> -->
    <div class="tooltip" data-tip="Next Page" v-if="props.total > props.current">
      <button type="button" class="join-item btn btn-sm" @click="handleClickPage(props.current + 1)">
        <ChevronIcon class="w-3 h-3 rotate-90" />
      </button>
    </div>
    <div class="tooltip" data-tip="Last Page" v-if="props.total > props.current">
      <button type="button" class="join-item btn btn-sm"  @click="handleClickPage(props.total)">
        <ChevronDoubleIcon class="w-3 h-3 rotate-90" />
      </button>
    </div>
    <!-- <button
      class="join-item btn btn-sm"
      :class="{'btn-active': page==props.current}"
      v-for="page in total"
      :key="page"
      @click="handleClickPage(page)"
    >
      <span>{{ page }}</span>
    </button> -->
  </div>
</template>

<style scoped>
</style>
