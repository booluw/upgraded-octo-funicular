<script lang="ts" setup>
const emits = defineEmits(['done', 'cancelled'])
</script>
<template>
  <section
    class="fixed top-0 right-0 bottom-0 left-0 bg-[#1D3045] dark:bg-black flex justify-center items-center"
  >
    <div
      class="mx-5 h-5/6 w-full md:mx-0 md:!w-[695px] md:!h-[587px] rounded-[6px] p-[24px] bg-[#F3F7FE] dark:bg-transparent dark:border dark:border-white text-black dark:text-text-dark overflow-x-auto"
    >
      <slot></slot>
    </div>
  </section>
</template>
