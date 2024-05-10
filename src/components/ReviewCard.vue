<script lang="ts" setup>
import { useTimeAgo } from '@vueuse/core'

const props = defineProps<{
  review: any
}>()
</script>
<template>
  <div class="border-b border-[#D9D9D9]/5 mb-[16px] pb-[16px]">
    <div class="flex justify-between">
      <div class="flex items-center gap-[4px]">
        <img src="@/assets/imgs/card_avatar.png" class="w-[25px] h-[25px]" />
        <div class="flex gap-[5px] text-[14px]">
          {{ review.anon ? 'Annon User' : review.profile.username.replace(/"/g, "") }}
          <b v-if="review.isAdmin">(Admin)</b>
          <span class="opacity-60">{{ useTimeAgo(review.created_at) }}</span>
        </div>
      </div>
      <div class="flex items-center gap-[4px] text-[14px]">
        <svg class="w-[12px]" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M6 0L7.875 3.975L12 4.575L9 7.65L9.675 12L6 9.975L2.325 12L3 7.65L0 4.575L4.125 3.975L6 0Z"
            fill="#FABB07"
          />
        </svg>
        {{ review.rating }}.0
      </div>
    </div>
    <p class="text-justify my-[8px]">{{ review.review }}</p>
  </div>
</template>
