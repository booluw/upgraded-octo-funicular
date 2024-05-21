<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { isEmpty } from 'lodash'
import { supabase } from '@/config/supabase'
import { useUser } from '@/stores/user'


import { onClickOutside } from '@vueuse/core'

import AppLogo from '@/components/AppLogo.vue'
import AppLogin from './components/AppLogin.vue'
import AppDropdown from '@/components/AppDropdown.vue'


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

const handleAction = async function (action: 'logout' | 'profile' | 'reviews') {
  if (action === 'logout') {

    await supabase.auth.signOut()
    userStore.resetUser()
    router.push('/')

  } else if (action === 'profile') {

    router.push('/profile')

  } else {

    router.push('/profile/reviews')

  }
}

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
  <section class="">
    <section
      class="min-h-[100vh] flex justify-center bg-light dark:bg-black text-text dark:text-text-dark"
      v-if="route.name === 'home'"
    >
      <div class="md:w-page px-[16px] md:px-0">
        <header class="py-[10.5px] flex justify-between items-center">
          <router-link to="/" class="text-text dark:text-text-dark">
            <AppLogo />
          </router-link>
          <AppDropdown :menu="['profile', 'reviews', 'logout']" position="bottom" @action="handleAction" v-if="!isEmpty(user.id)">
          <div class="flex items-center gap-[13px]">
            <span class="hidden md:block">{{ user.username ?? user.email }}</span>
          <img :src="user.img" class="w-[32px] rounded-full border-[2px] border-white" v-if="user.img" />
          <img src="@/assets/imgs/avataaars.png" class="rounded-full w-[32px] border-[2px] border-white" v-else />
          </div>
          </AppDropdown>
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
  </section>
</template>
