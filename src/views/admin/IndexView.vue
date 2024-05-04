<script lang="ts" setup>
import { formatDate } from '@/utils/functions'
</script>
<template>
  <section class="">
    <div class="flex items-center justify-between">
      <h1 class="text-icon font-[600] text-2xl">Admin Dashboard</h1>
      <div class="">{{ formatDate(Date()) }}</div>
    </div>
  </section>
</template>