<!-- eslint-disable vue/no-parsing-error -->
<script lang="ts" setup>
import AppLoader from './AppLoader.vue'

defineProps<{
  type: 'primary' | 'outline'
  mode?: 'submit' | 'button' | undefined
  loading?: boolean
  size?: 'small' | 'large'
}>()
</script>
<template>
  <button
    class="flex items-center justify-center rounded-[6px] outline-none border-[1.5px] disabled:opacity-75 disabled:cursor-not-allowed"
    :class="type === 'primary'
      ? 'bg-primary border-primary text-white'
      : 'border-primary bg-transparent text-primary',
        size === 'small' ? 'py-[10px] px-[16px] text-[12px] md:text-[14px]' : 'py-[16px] px-[40px] text-[14px] md:text-[16px]'
    "
    :type="mode"
    :disabled="loading"
  >
    <AppLoader v-if="loading" />
    <slot></slot>
  </button>
</template>
