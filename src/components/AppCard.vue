<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  review: any
}>()

const condition = computed(() => {
  switch (props.review.condition) {
    case 'network':
      return 'bg-[#FCDCEF] border-[#AD307B] text-[#821958]'

    case 'power':
      return 'bg-[#F66A57] border-[#F66A57] text-[#14161A] font-[500]'

    case 'water':
      return 'bg-[#D1E4FA] border-[#2863B8] text-[#1F4781]'

    case 'security':
      return ''

    case 'traffic':
      return 'bg-[#F5E9CB] border-[#A07C22] text-[#594510]'

    default:
      return ''
  }
})
</script>
<template>
  <div class="rounded-[8px] bg-white dark:bg-[#14161A] w-[286px] p-[16px]">
    <div class="flex justify-between items-center mb-[9px]">
      <div class="flex items-center justify-center py-[2px] px-[8px] rounded-full text-center text-[9px] border " :class="condition">
        {{ review.condition }}
      </div>
      <div class="flex justify-between items-center gap-[3px]  font-bold">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M6 0L7.875 3.975L12 4.575L9 7.65L9.675 12L6 9.975L2.325 12L3 7.65L0 4.575L4.125 3.975L6 0Z"
            fill="#FABB07"
          />
        </svg>
        {{ review.rating }}
      </div>
    </div>
    <div class="text-[14px] my-[12px] line-clamp-2">
      There is no stable electricity. The roads are fairly good and there is a sense of community.
      The drainage system is poor and most residents litter their surroundings. There are lots
      stores and Supermarkets.
    </div>
    <div class="mb-[4px]">
      <span class="text-[14px] font-[600]">{{ review.location }}</span>
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-[5px]">
        <img src="@/assets/imgs/card_avatar.png" class="w-[20px] h-[20px]" />
        <div class="flex items-center gap-[5px] text-[12px]">
          <h3 class="font-[500]">{{ review.username }}</h3>
          <div class="pr-[2px] pt-[2px] h-[4px] w-[4px] bg-[#B2C1E6] dark:bg-black rounded"></div>
          <span class="block font-[400]">{{ review.time }}</span>
        </div>
      </div>
      <div class="">
        <img src="@/assets/imgs/avatar_1.png" class="w-[20px] h-[20px] inline" />
        <img src="@/assets/imgs/avatar.png" class="w-[20px] h-[20px] inline -ml-2" />
        <div class="inline-flex items-center justify-center bg-primary w-[22px] h-[20px] -ml-2 rounded-full  text-white text-[10px]">+2</div>
      </div>
    </div>
  </div>
</template>
