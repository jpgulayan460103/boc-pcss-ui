import axios from 'axios';
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useScheduleStore } from '@/stores/schedule'

const scheduleStore = useScheduleStore();

const API = import.meta.env.VITE_API_URL;

export const useUserStore = defineStore('user', () => {
  const users = ref([]);
  const selectedUser = ref({});
  const formType = ref("create");

  const get = async () => {
    return axios.get(`${API}/api/users`).then(res => {
      users.value = res.data.users.data;
    });
  }

  const edit = (data) => {
    selectedUser.value = data;
    formType.value = "update"
  }

  const viewSchedule = (data) => {
    selectedUser.value = data;
    formType.value = "schedule"
    scheduleStore.get();
  }

  const unSelect = () => {
    selectedUser.value = {};
    formType.value = "create"
  }

  return {
    users,
    selectedUser,
    formType,
    get,
    edit,
    viewSchedule,
    unSelect,
  }
})
