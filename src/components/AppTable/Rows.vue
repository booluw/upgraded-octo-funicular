<script lang="ts" setup>
const emits = defineEmits(['action'])
const props = defineProps<{
  row: object
  action?: string[]
}>()
</script>
<template>
  <div class="border-b border-primary-light flex">
    <div class="" v-for="(item, index) in row" :key="index">
      {{ item }}
    </div>
  </div>
</template>