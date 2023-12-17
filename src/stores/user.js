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

  const save = async (payload) => {
    if(formType.value == 'create'){
      return axios.post(`${API}/api/users`, payload)
    }

    return axios.put(`${API}/api/users/${payload.id}`, payload)
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

  const destroy = (payload) => {
    return axios.delete(`${API}/api/users/${payload.id}`);
  }

  return {
    users,
    selectedUser,
    formType,
    get,
    save,
    edit,
    destroy,
    viewSchedule,
    unSelect,
  }
})
