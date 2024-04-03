<script lang="ts" setup>
import { useSlots } from 'vue'

const props = defineProps<{
  type: 'text' | 'password' | 'search'
  label?: string
  placeholder?: string
  required?: boolean
}>()

const value = defineModel()

const updateModel = function (e: any) {
  value.value = e.target.value
}
</script>
<template>
  <div
    class="flex items-center gap-[10px] rounded-[6px] py-[16px] px-[12px] bg-[#F3F7FE] dark:bg-black-light border dark:border-black focus-within:border-primary transition-all ease-out"
  >
    <slot name="icon" />
    <input
      class="w-full bg-transparent focus-within:outline-none outline-none"
      :type="type"
      :value="value"
      :placeholder="placeholder"
      :required="required"
      @input="updateModel"
      @focus="updateModel"
    />
  </div>
</template>
