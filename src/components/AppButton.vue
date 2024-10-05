<script lang="ts" setup>
import { computed } from 'vue';
import AppLoader from './AppLoader.vue'

const props = defineProps<{
  type: 'primary' | 'outline'
  mode?: 'submit' | 'button' | undefined
  loading?: boolean
  size?: 'small' | 'large'
}>()

const _class = computed(() => {
  let style;

  switch (props.type) {
    case 'primary':
      style = 'bg-primary border-primary text-white'
      break;
  
    default:
      style = 'border-primary bg-transparent text-primary'
      break;
  }

  switch (props.size) {
    case 'small':
      style += ' py-[10px] px-[16px] text-[12px] md:text-[14px]'
      break;
  
    default:
      style += ' py-[16px] px-[40px] text-[14px] md:text-[16px]'
      break;
  }

  return style
})
</script>
<template>
  <button
    class="flex items-center justify-center rounded-[6px] outline-none border-[1.5px] disabled:opacity-75 disabled:cursor-not-allowed"
    :class="_class"
    :type="mode"
    :disabled="loading"
  >
    <AppLoader v-if="loading" />
    <slot></slot>
  </button>
</template>
