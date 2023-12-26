<script setup>

import ChevronDoubleIcon from '@/icons/ChevronDoubleIcon.vue'
import ChevronIcon from '@/icons/ChevronIcon.vue'
import { cloneDeep, debounce } from 'lodash';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Type something',
  },
  options: {
    type: Array,
    required: true,
  },
  search: {
    type: Function,
    required: true,
  },
  limit: {
    type: Number,
    default: 5,
  }
})

const handleClickOption = (option) => {
  emit('select', option);
}


const handleSearchOption = () => {
  props.search(searchQuery.value);
};

const emit = defineEmits(['select'])

const searchQuery = ref('')

const filteredOptions = computed(() => {
  return props.options.slice(0, props.limit);
})

</script>

<template>
  <div class="dropdown dropdown-bottom">
    <input type="text" v-model="searchQuery" @keyup="handleSearchOption" tabindex="0" :placeholder="placeholder" role="button" class="join-item input input-sm input-bordered w-full max-w-xs" />
    <ul tabindex="0" class="dropdown-content p2 z-30 menu shadow bg-base-100 rounded-box w-52" v-if="filteredOptions.length != 0">
      <li v-for="option in filteredOptions" :key="option" @click="handleClickOption(option)">
        <a>{{ option.label }}</a>
      </li>
    </ul>
  </div>

</template>

<style scoped>
</style>
