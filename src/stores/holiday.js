import axios from 'axios';
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

const API = import.meta.env.VITE_API_URL;

export const useHolidayStore = defineStore('holiday', () => {
  const holidays = ref([]);
  const selectedHoliday = ref({});
  const formType = ref('create');

  const get = async () => {
    return axios.get(`${API}/api/holidays`).then(res => {
      holidays.value = res.data.holidays;
    });
  }

  const save = async (payload) => {
    if (formType.value == 'create') {
      return axios.post(`${API}/api/holidays`, payload);
    }else{
      return axios.put(`${API}/api/holidays/${payload.id}`, payload);
    }
  }

  const edit = (data) => {
    selectedHoliday.value = data;
    formType.value = "update"
  }

  const view = (data) => {
    selectedHoliday.value = data;
    formType.value = "view"
  }

  const unSelect = () => {
    selectedHoliday.value = {};
    formType.value = "create"
  }
  
  const destroy = (payload) => {
    return axios.delete(`${API}/api/holidays/${payload.id}`);
  }

  return {
    holidays,
    selectedHoliday,
    save,
    get,
    edit,
    view,
    destroy,
    unSelect,
  }
})
