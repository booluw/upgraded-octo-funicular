<script lang="ts" setup>
import { computed } from 'vue'

import { ADMIN_ROUTES } from '@/utils/constants'
import { useUser } from '@/stores/user'

import AppLogo from '@/components/AppLogo.vue'

const userStore = useUser()

const user = computed(() => {
  return userStore.user
})
</script>
<template>
  <section class="bg-light dark:bg-dark-blue text-text dark:text-text-dark overflow-hidden h-screen">
    <header class="flex justify-between items-center h-[10vh] px-10">
      <router-link to="/" class="text-text dark:text-text-dark">
        <AppLogo class="text-black dark:text-primary-light" />
      </router-link>
      <div class="flex items-center gap-[13px]">
        <span class="hidden md:block">{{ user.username ?? user.email }}</span>
        <img src="@/assets/imgs/avatar.png" class="rounded-full border-[2px] border-white" />
      </div>
    </header>
    <div class="flex h-[90vh] w-full">
      <div class="w-[300px] pt-[20px]">
        <router-link
          :to="'/admin/' + link.path"
          exact-active-class="bg-[#0B153A] text-text-dark"
          class="text-icon dark:text-primary-light flex items-center gap-3 py-5 px-10 mb-1 hover:bg-[#0B153A] hover:text-text-dark transition-colors ease-in-out"
          v-for="(link, index) in ADMIN_ROUTES"
          :key="index"
        >
          <component :is="link.icon" />
          {{ link.title }}
        </router-link>
      </div>
      <div class="w-full bg-white dark:bg-black py-5 px-10 overflow-auto">
        <router-view />
      </div>
    </div>
  </section>
</template>
