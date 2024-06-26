import { ref, type Ref } from "vue";
import { defineStore } from "pinia";
import type { User } from "@/interfaces/user";

export const useUser = defineStore('user', () => {
  const user = ref<User>({
    id: '',
    username: '',
    role: 'USER',
    email: '',
    firstName: '',
    lastName: '',
    location: "",
    phone_number: "",
    img: ""
  })

  const theme: Ref<'dark' | 'light'> = ref('light')
  // let user = user_.value

  const setTheme = function (payload: 'light' | 'dark') {
    theme.value = payload
  }
  
  const setUser = async function (userData: User) {
    user.value = { ...userData, username: userData.username.replace(/"/g, "") }
  }

  const setUserId = function (id: string) {
    user.value.id = id
  }
  const resetUser = function () {
    user.value = {
      id: '',
      username: '',
      role: 'USER',
      email: '',
      location: '',
      phone_number: '',
      img: '',
      firstName: '',
      lastName: ''
    }
  }

  return { user, setUser, setUserId, resetUser, theme, setTheme }
},
  {
  persist: true
})