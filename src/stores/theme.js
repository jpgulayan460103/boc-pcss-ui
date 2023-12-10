import axios from 'axios';
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'


export const useThemeStore = defineStore('theme', () => {
  const theme = ref("emerald");

  const changeTheme = (selectedTheme) => {
    localStorage.setItem('theme', selectedTheme);
    theme.value = selectedTheme;
  }

  const getTheme = () => {
    if(localStorage.getItem('theme')){
      theme.value = localStorage.getItem('theme');
    }
  }

  const isDark = () => {
    return theme.value == "night"
  }

  return {
    changeTheme,
    getTheme,
    isDark,
    theme,
  }
})
