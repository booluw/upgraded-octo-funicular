<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useUser } from './stores/user'
import { isEmpty } from 'lodash'

import { onClickOutside } from '@vueuse/core'

import AppLogo from '@/components/AppLogo.vue'
import AppLogin from './components/AppLogin.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUser()
const target = ref(null)

const user = computed(() => {
  return userStore.user
})

onClickOutside(target, () => {
  router.push(route.path)
})

onMounted(() => {
  // Handle dark theme based on system preference
  if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.remove('dark') // fix: when ready for prod
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
        <div class="flex items-center gap-[13px]" v-if="!isEmpty(user.id)">
          <span class="hidden md:block">{{ user.username ?? user.email }}</span>
          <img src="@/assets/imgs/avatar.png" class="rounded-full border-[2px] border-white" />
        </div>
        <div
          class="font-[700] text-primary uppercase cursor-pointer hover:opacity-75"
          @click="router.push('?action=login')"
          v-else
        >
          Login
        </div>
      </header>
      <RouterView />
    </div>
  </section>
  <RouterView v-else />
  <div
    class="fixed top-0 right-0 bottom-0 left-0 bg-[#1D3045]/90 dark:bg-black/90 flex justify-center items-center"
    v-if="route.query.action === 'login'"
  >
    <AppLogin ref="target" />
  </div>
</template>
