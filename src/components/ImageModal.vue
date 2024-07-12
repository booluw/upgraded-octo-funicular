<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

defineProps<{ img: string[] }>()

const emit = defineEmits(['close'])
const target = ref(null)
const currentImage: Ref<string | null> = ref(null)

onClickOutside(target, () => {
  emit('close')
})
</script>
<template>
  <div
    class="py-5 fixed z-20 top-0 right-0 bottom-0 left-0 bg-[#FBFCFE]/50 dark:bg-black/50 flex flex-col justify-center items-center backdrop-blur"
  >
    <button
      class="bg-transparent border border-[#E5EDF5] dark:border-[#212327] rounded-full p-3 absolute top-3 right-"
      @click="emit('close')"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.6">
          <path
            d="M18 6L6 18"
            class="stroke-[#14161A] dark:stroke-[#FBFCFE]"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M6 6L18 18"
            class="stroke-[#14161A] dark:stroke-[#FBFCFE]"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
      </svg>
    </button>
    <img :src="currentImage ?? img[0]" class="m-10 md:m-0 w-full md:w-2/6 h-auto rounded" />
    <div class="mt-3 flex gap-2">
      <img
        :src="item"
        v-for="(item, index) in img"
        :key="index"
        @click="currentImage = item"
        :class="
          currentImage === null
            ? index === 0
              ? '!border-primary'
              : ''
            : currentImage === item
              ? '!border-primary'
              : ''
        "
        class="w-[70px] rounded cursor-pointer p-[2px] border-2 border-transparent transition-all ease-linear"
      />
    </div>
  </div>
</template>
