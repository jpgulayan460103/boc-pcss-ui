<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  closable: {
    type: Boolean,
    default: false,
  },
})

const handleCloseButton = () => {
  emit('close', true);
}
const emit = defineEmits(['close'])
</script>

<template>
<div class="card w-full bg-base-100 text-base-content">

    <div class="card-body">
      <div class="flex justify-between">
        <h2 class="card-title">{{ title }}</h2>

        <div class="card-actions justify-end" v-if="closable">
          <button class="btn btn-square btn-sm" @click="handleCloseButton">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
      </div>
    <slot />
    </div>
</div>
</template>

<style scoped>
</style>
