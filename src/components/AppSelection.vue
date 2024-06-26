<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

const target = ref(null)

onClickOutside(target, () => (show.value = false))

defineProps<{
  options: string[]
  label?: string
  placeholder?: string
  required?: boolean
}>()

const value = defineModel() as any
const selected = reactive({ item: [] }) as any
const show = ref(false)

const updateModel = function (option: string) {
  if (selected.item.includes(option)) {
    selected.item.splice(selected.item.indexOf(option), 1)
  } else {
    selected.item.push(option)
    show.value = false
  }
  value.value = selected.item
}
</script>
<template>
  <div class="" ref="target">
    <div
      class="flex flex-col gap-[10px] rounded-[6px] py-[12px] px-[12px] bg-[#F3F7FE] dark:bg-black-light border dark:border-[#383b43] transition-all ease-out cursor-pointer"
      :class="{ 'border-primary dark:border-black': show }"
      @click="show = !show"
    >
      <span
        class="text-[10px] !text-left"
        :class="
          selected.item.length !== 0
            ? 'opacity-55'
            : 'hidden opacity-0 translate-y-[15px] group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all ease-in-out'
        "
      >
        {{ placeholder }}
      </span>
      <div class="opacity-55" v-if="selected.item.length == 0">
        {{ placeholder }}
      </div>
      <div class="flex justify-start gap-2 relative py-1 overflow-x-auto scrollbar-thin scrollbar-track-transparent" v-else>
        <span
          class="flex-shrink-0 bg-primary/5 text-sm py-1 px-3 rounded shadow flex items-center gap-2"
          v-for="(item, index) in selected.item.slice(0, 4)"
          :key="index"
          @click="updateModel(item)"
        >
          {{ item }}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12"
              stroke="currentColor"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M4 4L12 12"
              stroke="currentColor"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <!-- <span
          class="flex-shrink-0 bg-primary text-sm py-1 px-2 rounded absolute z-[5] top-auto right-0"
          v-if="selected.item.length > 4"
          >+{{ selected.item.length - 4 }}</span
        > -->
      </div>
    </div>
    <div
      class="w-full bg-transparent focus-within:outline-none outline-none relative"
      :value="value"
      :placeholder="placeholder"
      :required="required"
    >
      <div
        class="absolute top-0 right-0 left-0 z-20 border border-grey/40 dark:border-[#F3F7FE] rounded-[6px] max-h-[200px] overflow-auto grid grid-cols-1 md:grid-cols-3 gap-[5px] p-5 bg-[#F3F7FE] dark:bg-black-light"
        v-if="show"
      >
        <div
          class="flex items-center gap-[10px] text-sm cursor-pointer hover:opacity-75"
          v-for="(option, index) in options"
          :key="index"
          @click="updateModel(option)"
        >
          <div
            class="p-2 border rounded"
            :class="{ 'bg-primary': selected.item.includes(option) }"
          />
          {{ option }}
        </div>
      </div>
    </div>
  </div>
</template>
