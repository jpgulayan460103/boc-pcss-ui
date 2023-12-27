<script setup>
import ChevronIcon from '@/icons/ChevronIcon.vue';
import ChevronUpDownIcon from '@/icons/ChevronUpDownIcon.vue';
import { ref } from 'vue'

const handleToogleSort = () => {
  if(props.modelValue.field && props.modelValue.field == props.field){
    if(props.modelValue.order == 'DESC'){
      emits('update:modelValue', {
        field: null,
        order: null,
      });
    }else{
      emits('update:modelValue', {
        field: props.field,
        order: 'DESC',
      });
    }
  }else{
    emits('update:modelValue', {
      field: props.field,
      order: 'ASC',
    });
  }
}

const props = defineProps({
  field: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex justify-between space-x-1 cursor-pointer" @click="handleToogleSort()">

    <span class="cursor-pointer">{{ props.label }}</span>
    
    <div class="flex space-x-1 cursor-pointer">
      <span class="tooltip tooltip-bottom" :data-tip="`Sort ${props.label}`">
        <ChevronIcon class="w-4 h-4" v-if="props.modelValue.field == props.field && props.modelValue.order != 'DESC'" />
        <ChevronIcon class="w-4 h-4 rotate-180" v-else-if="props.modelValue.field == props.field && props.modelValue.order == 'DESC'" />
        <ChevronUpDownIcon class="w-4 h-4" v-else />
      </span>
    </div>

  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
