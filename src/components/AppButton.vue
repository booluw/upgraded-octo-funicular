<script lang="ts" setup>
import AppLoader from './AppLoader.vue'

defineProps<{
  type: 'primary' | 'outline'
  mode?: 'submit' | 'button' | undefined
  loading?: boolean
}>()
</script>
<template>
  <button
    class="flex items-center justify-center rounded-[6px] py-[16px] outline-none border-[1.5px] text-[14px] md:text-[16px] disabled:opacity-75 disabled:cursor-not-allowed"
    :class="
      type === 'primary'
        ? 'bg-primary border-primary text-white px-[40px]'
        : 'border-primary bg-transparent text-primary px-[16px]'
    "
    :type="mode"
    :disabled="loading"
  >
    <AppLoader v-if="loading" />
    <slot></slot>
  </button>
</template>
