<script lang="ts" setup>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import AppButton from './AppButton.vue'

defineProps<{
  heading: string
  text: string
  confirmButtonText: string
  type: 'success' | 'warning' | 'error'
}>()

const emits = defineEmits(['close', 'done'])

const target = ref(null)

onClickOutside(target, () => emits('close'))
</script>

<template>
  <section
    class="fixed top-0 right-0 bottom-0 left-0 bg-[#FBFCFE]/50 dark:bg-black/50 flex justify-center items-center backdrop-blur z-[99]"
  >
    <div
      class="mx-5 w-full md:mx-0 md:!w-[500px] rounded-[6px] p-[24px] bg-[#FBFCFE] dark:bg-black text-black dark:text-text-dark overflow-x-auto"
      ref="target"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="">{{ heading }}</h3>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="cursor-pointer w-[16px] flex-shrink-0"
          @click="emits('close')"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M9.41 8L12.7 4.71C12.89 4.53 13 4.28 13 4C13 3.45 12.55 3 12 3C11.72 3 11.47 3.11 11.29 3.29L8 6.59L4.71 3.29C4.53 3.11 4.28 3 4 3C3.45 3 3 3.45 3 4C3 4.28 3.11 4.53 3.29 4.71L6.59 8L3.3 11.29C3.11 11.47 3 11.72 3 12C3 12.55 3.45 13 4 13C4.28 13 4.53 12.89 4.71 12.71L8 9.41L11.29 12.7C11.47 12.89 11.72 13 12 13C12.55 13 13 12.55 13 12C13 11.72 12.89 11.47 12.71 11.29L9.41 8Z"
            fill="#3366FF"
          />
        </svg>
      </div>
      <p class="my-5">{{ text }}</p>
      <div class="flex gap-5">
        <AppButton type="outline" size="small" @click="emits('close')" class="w-1/3"
          >Close</AppButton
        >
        <AppButton
          type="primary"
          size="small"
          @click="emits('done')"
          class="w-2/3"
          :class="
            type === 'error'
              ? '!bg-[#D14343] !border-[#D14343]'
              : type === 'success'
                ? 'bg-primary'
                : 'bg-orange-500 border-orange-500'
          "
        >
          {{ confirmButtonText }}
        </AppButton>
      </div>
    </div>
  </section>
</template>
