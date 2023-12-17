import axios from 'axios';
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const API = import.meta.env.VITE_API_URL;

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref([]);
  const selectedEmployee = ref({});
  const formType  = ref("create");

  const get = async () => {
    return axios.get(`${API}/api/employees`).then(res => {
      employees.value = res.data.employees.data;
    });
  }

  const save = async (payload) => {
    if(formType.value == 'create'){
      return axios.post(`${API}/api/employees`, payload)
    }

    return axios.put(`${API}/api/employees/${payload.id}`, payload)
  }

  const edit = (data) => {
    selectedEmployee.value = data;
    formType.value = "update"
  }

  const unSelect = () => {
    selectedEmployee.value = {};
    formType.value = "create"
  }

  return {
    employees,
    selectedEmployee,
    formType,
    get,
    save,
    edit,
    unSelect,
  }
})
