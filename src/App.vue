<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useUser } from './stores/user'
import { isEmpty } from 'lodash'

import AppLogo from '@/components/AppLogo.vue'

const route = useRoute()
const user = useUser().user

onMounted(() => {
  // Handle dark theme based on system preference
  if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})
</script>

<template>
  <section
    class="min-h-[100vh] flex justify-center bg-light dark:bg-black text-text dark:text-text-dark"
    v-if="route.name === 'home'"
  >
    <div class="md:w-page px-[16px] md:px-0">
      <header class="py-[10.5px] flex justify-between items-center">
        <router-link to="/" class="text-text dark:text-text-dark">
          <AppLogo />
        </router-link>
        <div class="flex items-center gap-[13px]" v-if="!isEmpty(user)">
          <span class="hidden md:block">Welcome!</span>
          <img src="@/assets/imgs/avatar.png" class="rounded-full border-[2px] border-white" />
        </div>
        <div class="font-[700] text-primary uppercase cursor-pointer hover:opacity-75" v-else>
          Login
        </div>
      </header>
      <RouterView />
    </div>
  </section>
  <RouterView v-else />
</template>
