<script lang="ts" setup>
const props = defineProps<{
  review: any
}>()
</script>
<template>
  <div class="">
    <div class="">
      <div class="flex items-center gap-[4px]">
        <img src="@/assets/imgs/card_avatar.png" class="w-[25px] h-[25px]" />
        <div class="text-[14px]">
          {{ review.username }}
          <b v-if="review.isAdmin">(Admin)</b>
          <span class="opacity-60">{{ review.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
