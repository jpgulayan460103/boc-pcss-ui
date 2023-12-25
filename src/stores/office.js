import axios from 'axios';
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const API = import.meta.env.VITE_API_URL;

export const useOfficeStore = defineStore('office', () => {
  const offices = ref([]);
  const selectedOffice = ref({});
  const formType  = ref("create");

  const get = async (params) => {
    return axios.get(`${API}/api/offices`, {params}).then(res => {
      offices.value = res.data.offices;
    });
  }

  const save = async (payload) => {
    if(formType.value == 'create'){
      return axios.post(`${API}/api/offices`, payload)
    }

    return axios.put(`${API}/api/offices/${payload.id}`, payload)
  }

  const edit = (data) => {
    selectedOffice.value = data;
    formType.value = "update"
  }

  const unSelect = () => {
    selectedOffice.value = {};
    formType.value = "create"
  }

  const destroy = (payload) => {
    return axios.delete(`${API}/api/offices/${payload.id}`);
  }

  return {
    offices,
    selectedOffice,
    formType,
    get,
    save,
    edit,
    destroy,
    unSelect,
  }
})
