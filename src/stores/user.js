import axios from 'axios';
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useScheduleStore } from '@/stores/schedule'


const API = import.meta.env.VITE_API_URL;

export const useUserStore = defineStore('user', () => {
  const scheduleStore = useScheduleStore();
  const users = ref([]);
  const selectedUser = ref({});
  const formType = ref("create");

  const pagination = ref({
    currentPage: 0,
    total: 0,
    from: 0,
    lastPage: 0,
  });

  const get = async (params) => {
    return axios.get(`${API}/api/users`, {
      params
    }).then(res => {
      users.value = res.data.users.data;
      pagination.value = {
        currentPage: res.data.users.current_page,
        total: res.data.users.total,
        from: res.data.users.from,
        lastPage: res.data.users.last_page,
      };
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
  
  const changePassword = (payload) => {
    return axios.post(`${API}/api/user/change-password`, payload);
  }

  return {
    users,
    pagination,
    selectedUser,
    formType,
    get,
    save,
    edit,
    destroy,
    viewSchedule,
    unSelect,
    changePassword,
  }
})
