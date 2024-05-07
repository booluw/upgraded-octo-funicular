<script lang="ts" setup>
const props = defineProps<{
  columns: { title: string, field: string }[] | string[],
  data: any[],
  actions?: string[]
}>()
</script>
<template>
  <div class="border border-primary-light">
    <!-- Table Headers -->
    <div class="flex border-b border-primary-light">
      <!-- Header Row -->
      <div class="border-r border-primary-light" v-for="(col, index) in columns" :key="index">
        {{ typeof col === 'string' ? col : col.title }}
      </div>
    </div>
  </div>
</template>