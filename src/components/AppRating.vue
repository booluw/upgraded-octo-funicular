<script lang="ts" setup>
const value = defineModel() as any

const rater = function (rate: any) {
  value.value = rate
}
</script>
<template>
  <div class="">
    <h3 class="mb-[4px]">Rate location</h3>
    <div class="flex items-center gap-2">
      <svg
        viewBox="0 0 20 20"
        class="cursor-pointer w-[24px]"
        :class="{ 'opacity-40 hover:opacity-100' : value < i }"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        v-for="i in 5"
        :key="i"
        @click="rater(i)"
      >
        <path
          d="M10.0002 0L13.0902 6.26L20.0002 7.27L15.0002 12.14L16.1802 19.02L10.0002 15.77L3.82024 19.02L5.00024 12.14L0.000244141 7.27L6.91024 6.26L10.0002 0Z"
          fill="#FFC700"
        />
      </svg>
    </div>
  </div>
</template>
