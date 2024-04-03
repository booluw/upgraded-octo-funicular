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
      return 'bg-[#F66A57] border-[#F66A57] text-[#101012]'

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
  <div class="rounded-[15px] bg-white dark:bg-[#18181B] w-[239px] p-[20px]">
    <div class="flex items-center justify-between">
      <div class="flex gap-[5px]">
        <img src="@/assets/imgs/card_avatar.png" class="w-[25px] h-[25px]" />
        <div class="">
          <h3 class="text-[12px] font-[500]">{{ review.username }}</h3>
          <span class="block text-[8px] -mt-1">{{ review.time }}</span>
        </div>
      </div>
      <div class="">
        <span class="text-[11px]">{{ review.location }}</span>
        <div class="flex">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            v-for="i in review.rating"
            :key="i"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M6 0L7.875 3.975L12 4.575L9 7.65L9.675 12L6 9.975L2.325 12L3 7.65L0 4.575L4.125 3.975L6 0Z"
              fill="#FABB07"
            />
          </svg>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            v-for="i in 5 - review.rating"
            :key="i"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M6 0L7.875 3.975L12 4.575L9 7.65L9.675 12L6 9.975L2.325 12L3 7.65L0 4.575L4.125 3.975L6 0Z"
              fill="#D1D1D1"
            />
          </svg>
        </div>
      </div>
    </div>
    <div class="text-[14px] my-[10px]">
      There is no stable electricity. The roads are fairly good and there is a sense of community.
      The drainage system is poor and most residents litter their surroundings. There are lots
      stores and Supermarkets.
    </div>
    <div class="flex justify-between items-center">
      <div class="flex gap-2">
        <div class="flex items-center gap-1 text-[10px] text-[#8F95B2]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12.3083 0.875H1.69167C1.2425 0.875 0.875 1.2425 0.875 1.69167V9.04167C0.875 9.49083 1.2425 9.85833 1.69167 9.85833H3.325V12.3083C3.325 12.7575 3.6925 13.125 4.14167 13.125C4.37033 13.125 4.5745 13.0352 4.7215 12.8882L7.74317 9.85833H12.3083C12.7575 9.85833 13.125 9.49083 13.125 9.04167V1.69167C13.125 1.2425 12.7575 0.875 12.3083 0.875Z"
              fill="#8F95B2"
            />
          </svg>
          125
        </div>
        <div class="flex items-center gap-1 text-[10px] text-[#8F95B2]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M2 2H0V9H2C2.55 9 3 8.55 3 8V3C3 2.45 2.55 2 2 2ZM15.99 6.38C16.07 5.8 15.55 5.36 14.84 5.33C14.59 5.32 14.32 5.3 14.03 5.28C14.05 5.28 14.08 5.27 14.1 5.27C14.8 5.17 15.44 4.78 15.51 4.2C15.57 3.62 15.05 3.23 14.34 3.16C14.09 3.14 13.82 3.12 13.55 3.1C14.02 2.95 14.39 2.68 14.42 2.17C14.46 1.59 13.63 1.14 12.92 1.08C12.65 1.06 12.41 1.04 12.19 1.03C12.16 1.03 12.13 1.03 12.1 1.03C11.87 1.01 11.67 1.01 11.48 0.999998C8.35 0.949998 5.66 1.47 4 2.51V8.51C6.14 9.8 8.76 12.1 8.21 14.02C8.03 14.61 8.52 15.07 9.19 15C10 14.91 10.56 14.09 10.59 13.22C10.63 12.22 10.44 11.21 10.09 10.31C10.05 10.06 10.1 9.81 10.46 9.78C10.95 9.75 11.57 9.72 12.05 9.7C12.31 9.7 12.56 9.69 12.8 9.68H12.81C13.22 9.66 13.61 9.63 13.94 9.59C14.64 9.5 15.29 9.12 15.37 8.54C15.45 7.96 14.93 7.57 14.22 7.49C14.17 7.48 14.11 7.48 14.06 7.47C14.23 7.46 14.39 7.44 14.55 7.42C15.27 7.34 15.92 6.96 15.99 6.38Z"
              fill="#8F95B2"
            />
          </svg>
          02
        </div>
        <div class="flex items-center gap-1 text-[10px] text-[#8F95B2]">
          <svg
            width="16"
            height="14"
            viewBox="0 0 16 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M15.99 8.62705C15.91 8.04705 15.26 7.66705 14.56 7.57705C14.41 7.55705 14.24 7.53705 14.07 7.52705C14.13 7.51705 14.18 7.51705 14.23 7.50705C14.94 7.42705 15.46 7.03705 15.38 6.45705C15.3 5.87705 14.65 5.49705 13.95 5.40705C13.61 5.36705 13.23 5.33705 12.82 5.31705C12.82 5.31705 12.82 5.31705 12.81 5.31705C12.57 5.30705 12.32 5.29705 12.06 5.29705C11.58 5.27705 10.95 5.25705 10.47 5.21705C10.11 5.18705 10.06 4.93705 10.1 4.68705C10.45 3.78705 10.64 2.77705 10.6 1.77705C10.56 0.927054 10 0.0970537 9.19 0.00705369C8.52 -0.0629463 8.03 0.397054 8.2 0.987054C8.76 2.91705 6.13 5.20705 4 6.49705V12.4971C5.66 13.5271 8.35 14.0571 11.48 13.9971C11.67 13.9971 11.87 13.9871 12.1 13.9771C12.13 13.9771 12.16 13.9771 12.19 13.9771C12.41 13.9671 12.65 13.9471 12.92 13.9271C13.63 13.8671 14.46 13.4171 14.42 12.8371C14.39 12.3271 14.02 12.0471 13.55 11.9071C13.82 11.8871 14.09 11.8671 14.34 11.8471C15.05 11.7871 15.58 11.3971 15.51 10.8071C15.45 10.2271 14.81 9.83705 14.1 9.73705C14.08 9.73705 14.05 9.72705 14.03 9.72705C14.32 9.70705 14.6 9.69705 14.84 9.67705C15.55 9.64705 16.07 9.20705 15.99 8.62705ZM2 6.00705H0V13.0071H2C2.55 13.0071 3 12.5571 3 12.0071V7.00705C3 6.44705 2.55 6.00705 2 6.00705Z"
              fill="#8F95B2"
            />
          </svg>
          24
        </div>
      </div>
      <div class="py-[2px] px-[8px] rounded-full text-center text-[9px] border" :class="condition">
        {{ review.condition }}
      </div>
    </div>
  </div>
</template>
