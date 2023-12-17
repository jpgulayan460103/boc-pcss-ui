import axios from 'axios';
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

const API = import.meta.env.VITE_API_URL;

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref([]);
  const selectedSchedule = ref({});
  const formType = ref("create");

  const payload = ref({
    working_daterange: {
      start: null,
      end: null,
    },
    shifts: [],
    employees: []
  });

  const get = async () => {
    return axios.get(`${API}/api/schedules`).then(res => {
      schedules.value = res.data.schedules.data;
    });
  }

  const save = async (payload) => {
    if (formType.value == 'create') {
      return axios.post(`${API}/api/schedules`, payload);
    }else{
      return axios.put(`${API}/api/schedules/${payload.id}`, payload);
    }
  }

  const edit = (data) => {
    selectedSchedule.value = data;
    formType.value = "update"
  }

  const view = (data) => {
    selectedSchedule.value = data;
    formType.value = "schedule"
  }

  const unSelect = () => {
    selectedSchedule.value = {};
    formType.value = "create"
  }

  return {
    payload,
    schedules,
    selectedSchedule,
    formType,
    save,
    get,
    edit,
    view,
    unSelect,
  }
})
