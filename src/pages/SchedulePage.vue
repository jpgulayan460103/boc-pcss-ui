<script setup>
import Card from '@/components/Card.vue'
import ComboBox from '@/components/ComboBox.vue'
import FormInput from '@/components/FormInput.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue';
import profile from '@/assets/profile.png'
import { useUserStore } from '@/stores/user'
import { useOfficeStore } from '@/stores/office'
import { useScheduleStore } from '@/stores/schedule'

import EditIcon from '@/icons/EditIcon.vue'
import DeleteIcon from '@/icons/DeleteIcon.vue'
import CalendarIcon from '@/icons/CalendarIcon.vue'
import SearchIcon from '@/icons/SearchIcon.vue'
import PlusIcon from '@/icons/PlusIcon.vue'
import { cloneDeep } from 'lodash';
import { useThemeStore } from '@/stores/theme.js'
import dayjs from 'dayjs';


const themeStore = useThemeStore()
const userStore = useUserStore();
const officeStore = useOfficeStore();
const scheduleStore = useScheduleStore();


</script>

<template>
  <div class="container mx-auto grid grid-cols-12 gap-2">

    <div class="col-span-12 md:col-span-4">
      <Card title="User Form">
        <div role="tablist" class="tabs tabs-bordered">
          <a role="tab" class="tab">Tab 1</a>
          <a role="tab" class="tab tab-active">Tab 2</a>
          <a role="tab" class="tab">Tab 3</a>
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
