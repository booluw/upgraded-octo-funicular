<script lang="ts" setup>
defineProps<{
  type: 'primary' | 'outline'
}>()
</script>
<template>
  <button
    class="flex items-center justify-center rounded-[6px] py-[16px] px-[40px] outline-none border"
    :class="
      type === 'primary'
        ? 'bg-primary border-primary text-white'
        : 'border-primary bg-transparent text-primary'
    "
  >
    <slot></slot>
  </button>
</template>
