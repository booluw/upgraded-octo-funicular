import { ref } from "vue";
import { defineStore } from "pinia";
import type { User } from "@/interfaces/user";

export const useUser = defineStore('user', () => {
  const user = ref<User>({
    id: '',
    username: '',
    role: 'USER',
    email: '',
    firstName: '',
    lastName: ''
  })
  // let user = user_.value

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
      firstName: '',
      lastName: ''
    }
  }

  return { user, setUser, setUserId, resetUser }
})