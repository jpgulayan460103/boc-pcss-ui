import axios from 'axios';
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const API = import.meta.env.VITE_API_URL;

export const usePositionStore = defineStore('position', () => {
  const positions = ref([]);
  const selectedPosition = ref({});
  const formType  = ref("create");

  const get = async (params) => {
    return axios.get(`${API}/api/positions`, {params}).then(res => {
      positions.value = res.data.positions;
    });
  }

  const save = async (payload) => {
    if(formType.value == 'create'){
      return axios.post(`${API}/api/positions`, payload)
    }

    return axios.put(`${API}/api/positions/${payload.id}`, payload)
  }

  const edit = (data) => {
    selectedPosition.value = data;
    formType.value = "update"
  }

  const unSelect = () => {
    selectedPosition.value = {};
    formType.value = "create"
  }

  const destroy = (payload) => {
    return axios.delete(`${API}/api/positions/${payload.id}`);
  }

  return {
    positions,
    selectedPosition,
    formType,
    get,
    save,
    edit,
    destroy,
    unSelect,
  }
})
