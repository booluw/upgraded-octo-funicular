import { ref } from "vue";
import { defineStore } from "pinia";

export const useUser = defineStore('user', () => {
  const user_ = ref({})
  const user = user_.value

  return { user }
})