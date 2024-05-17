<script lang="ts" setup>
import { useRouter } from 'vue-router';
import AppButton from '@/components/AppButton.vue';

const router = useRouter();
</script>
<template>
  <section class="h-full flex flex-col items-center justify-center bg-transparent text-red-400">
    <h1 class="text-3xl font-[500]">Oops!</h1>
    <p>An error occurred while fetching data</p>
    <AppButton type="primary" class="mt-4" @click="router.go()" size="small">Refresh Page</AppButton>
  </section>
</template>