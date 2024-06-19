<script lang="ts" setup>
import { useRouter } from 'vue-router'
import AppLogin from '@/components/AppLogin.vue';

const router = useRouter()
</script>
<template>
  <section class="bg-[#E5EDF5] dark:bg-black flex justify-center items-center h-screen">
    <AppLogin @close="router.push('/')" />
  </section>
</template>