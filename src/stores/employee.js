import axios from 'axios';
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const API = import.meta.env.VITE_API_URL;

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref([]);
  const pagination = ref({
    currentPage: 0,
    total: 0,
    from: 0,
    lastPage: 0,
  });
  const selectedEmployee = ref({});
  const formType  = ref("create");

  const get = async (params) => {
    return axios.get(`${API}/api/employees`, {
      params
    }).then(res => {
      employees.value = res.data.employees.data;
      pagination.value = {
        currentPage: res.data.employees.current_page,
        total: res.data.employees.total,
        from: res.data.employees.from,
        lastPage: res.data.employees.last_page,
      };
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

  const destroy = (payload) => {
    return axios.delete(`${API}/api/employees/${payload.id}`);
  }

  return {
    employees,
    selectedEmployee,
    formType,
    pagination,
    get,
    save,
    edit,
    destroy,
    unSelect,
  }
})
