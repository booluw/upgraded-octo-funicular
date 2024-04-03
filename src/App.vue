<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppLogo from '@/components/AppLogo.vue'
</script>

<template>
  <section class="min-h-[100vh] flex justify-center bg-light text-text">
    <div class="w-page px-[16px]">
      <header class="py-[10.5px] flex justify-between items-center">
        <div class="">
          <router-link to="">
            <AppLogo />
          </router-link>
        </div>
        <div class="flex items-center gap-[13px]">
          <span class="hidden md:block">Welcome!</span>
          <img src="@/assets/imgs/avatar.png" class="rounded-full border-[2px] border-white" />
        </div>
      </header>
      <RouterView />
    </div>
  </section>
</template>
