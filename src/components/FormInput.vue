<script setup>
defineProps({
  label: {
    type: String,
  },
  help: {
    type: String,
  },
  required: {
    type: Boolean,
    default: false,
  },
  errors: {
    type: Object,
  },
})


</script>

<template>
<div class="form-control w-full text-base-content">
  <label class="label">
    <span class="label-text md:text-xs">
      <span v-if="required">*</span>
      <span v-if="label">{{ label }}</span>
      <span v-else>&nbsp;</span>
    </span>
  </label>
  <slot />
  <label class="label" v-if="help">
    <span class="label-text">{{ help }}</span>
  </label>
  <span class="text-sm text-error" v-for="error in errors">{{ error }}</span>
</div>
</template>

<style scoped>
</style>
