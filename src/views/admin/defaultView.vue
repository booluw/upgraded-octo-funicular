<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/stores/user'
import { supabase } from '@/config/supabase'

import { ADMIN_ROUTES } from '@/utils/constants'

import AppLogo from '@/components/AppLogo.vue'
import AppDropdown from '@/components/AppDropdown.vue';

const userStore = useUser()
const route = useRoute()
const router = useRouter()

const user = computed(() => {
  return userStore.user
})

const handleAction = async function (action: 'logout' | 'profile') {
  if (action === 'logout') {
    await supabase.auth.signOut()
    userStore.resetUser()

    router.push('/')
  } else {
    router.push('/profile')
  }
}
</script>
<template>
  <section
    class="bg-light dark:bg-black text-text dark:text-text-dark overflow-hidden h-screen"
  >
    <header class="flex justify-between items-center h-[10vh] px-10">
      <router-link to="/" class="text-text dark:text-text-dark">
        <AppLogo class="text-black dark:text-primary-light" />
      </router-link>
      <AppDropdown :menu="['profiles', 'logout']" position="bottom" @action="handleAction">
        <div class="flex items-center gap-[13px]">
          <span class="hidden md:block">{{ user.username ?? user.email }}</span>
          <img :src="user.img" class="w-[32px] rounded-full border-[2px] border-white dark:border-text" v-if="user.img" />
          <img src="@/assets/imgs/avataaars.png" class="rounded-full w-[32px] border-[2px] border-white dark:border-text" v-else />
        </div>
      </AppDropdown>
    </header>
    <div class="flex h-[90vh] w-full">
      <div class="w-[300px] pt-[20px]">
        <router-link
          :to="'/admin/' + link.path"
          exact-active-class="bg-[#0B153A] dark:bg-black-light text-text-dark"
          :class="
            route.path.includes(link.path) 
              ? link.path === ''
                ? ''
                : 'bg-[#0B153A] dark:bg-black-light text-text-dark'
              : ''
          "
          class="text-icon dark:text-primary-light flex items-center gap-3 py-5 px-10 mb-1 hover:bg-[#0B153A] dark:hover:bg-black-light hover:text-text-dark transition-colors ease-in-out"
          v-for="(link, index) in ADMIN_ROUTES"
          :key="index"
        >
          <component :is="link.icon" />
          {{ link.title }}
        </router-link>
      </div>
      <div class="w-full bg-white dark:bg-[#14161A] py-5 px-10 overflow-auto scrollbar dark:!scrollbar-track-text dark:scrollbar-thumb-black">
        <router-view />
      </div>
    </div>
  </section>
</template>
