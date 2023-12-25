import axios from 'axios';
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'


export const useThemeStore = defineStore('theme', () => {
  const theme = ref('emerald');
  const calendar = ref({
    color: 'sky-blue',
    isDark: true,
  });

  const changeTheme = (selectedTheme) => {
    localStorage.setItem('theme', selectedTheme);
    if(selectedTheme == "emerald"){
      calendar.value = {
        color: 'green',
        isDark: false,
      }
    }else{
      calendar.value = {
        color: 'sky-blue',
        isDark: true,
      }
    }
    theme.value = selectedTheme;
  }

  const getTheme = () => {
    if(localStorage.getItem('theme')){
      theme.value = localStorage.getItem('theme');
      changeTheme(theme.value);
    }else{
      changeTheme('emerald');
    }
  }


  return {
    changeTheme,
    getTheme,
    theme,
    calendar,
  }
})
