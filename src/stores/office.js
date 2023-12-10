import axios from 'axios';
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const API = import.meta.env.VITE_API_URL;

export const useOfficeStore = defineStore('office', () => {
  const offices = ref([]);

  const getOffices = async () => {
    return axios.get(`${API}/api/offices`).then(res => {
      offices.value = res.data.offices;
    });
  }
  return {
    offices,
    getOffices,
  }
})
