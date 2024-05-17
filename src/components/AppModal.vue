<script lang="ts" setup>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

const emits = defineEmits(['done', 'close'])

const target = ref(null)

onClickOutside(target, event => emits('close'))
</script>
<template>
  <section
    class="fixed top-0 right-0 bottom-0 left-0 bg-[#FBFCFE]/50 dark:bg-black/50 flex justify-center items-center backdrop-blur"
  >
    <div
      class="mx-5 h-5/6 w-full md:mx-0 md:!w-[500px] md:!h-[587px] rounded-[6px] p-[24px] bg-[#FBFCFE] dark:bg-black text-black dark:text-text-dark overflow-x-auto"
      ref="target"
    >
      <slot></slot>
    </div>
  </section>
</template>
