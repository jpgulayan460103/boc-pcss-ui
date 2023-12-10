import axios from 'axios';
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const API = import.meta.env.VITE_API_URL;

export const useAuthStore = defineStore('auth', () => {
  const authUser = ref({});
  const isAuthenticated = ref(false);

  const getUser = async () => {
    let user = await axios.get(`${API}/api/user`).then(res => res.data);
    authUser.value = user;
    isAuthenticated.value = true;
    localStorage.setItem('auth', true);
  }

  const login = async (payload) => {
    return axios.post(`${API}/api/login`, payload).then(res => {
      localStorage.setItem('auth-token', res.data.token);
      localStorage.setItem('auth', true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    })
  }
  const logout = (payload) => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth');
    authUser.value = {};
    isAuthenticated.value = false;
  }

  const getIsAuth = () => {
    if(localStorage.getItem('auth')){
      isAuthenticated.value = true;
      return isAuthenticated.value;
    }
    return false;
  }
  
  getIsAuth();

  return {
    authUser,
    isAuthenticated,
    getUser,
    login,
    logout,
    getIsAuth,
  }
})
