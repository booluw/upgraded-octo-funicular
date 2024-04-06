<script lang="ts" setup>
defineProps<{
  type: 'primary' | 'outline'
  mode?: 'submit' | 'button' | undefined
}>()
</script>
<template>
  <button
    class="flex items-center justify-center rounded-[6px] py-[16px] outline-none border-[1.5px] text-[14px] md:text-[16px]"
    :class="
      type === 'primary'
        ? 'bg-primary border-primary text-white px-[40px]'
        : 'border-primary bg-transparent text-primary px-[16px]'
    "
    :type="mode"
  >
    <slot></slot>
  </button>
</template>
