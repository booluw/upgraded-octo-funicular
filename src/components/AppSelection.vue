<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

const target = ref(null)

onClickOutside(target, () => show.value = false)

const props = defineProps<{
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
  }
  value.value = selected.item
}
</script>
<template>
  <div class="" ref="target">
    <div
      class="flex items-center gap-[10px] rounded-[6px] py-[16px] px-[12px] bg-[#F3F7FE] dark:bg-black-light border dark:border-black transition-all ease-out cursor-pointer"
      :class="{ 'border-primary dark:border-black': show }"
      @click="show = !show"
    >
      <template v-if="selected.item.length == 0">
        {{ placeholder }}
      </template>
      <div class="flex gap-2 overflow-hidden" v-else>
        <span class="flex-shrink-0 bg-primary/5 text-sm p-1 rounded" v-for="(item, index) in selected.item" :key="index">{{ item }}</span>
      </div>
    </div>
    <div
      class="w-full bg-transparent focus-within:outline-none outline-none relative"
      :value="value"
      :placeholder="placeholder"
      :required="required"
    >
      <div
        class="absolute top-0 right-0 left-0 border border-grey/40 dark:border-[#F3F7FE] rounded-[6px] max-h-[200px] overflow-auto grid grid-cols-1 md:grid-cols-4 gap-[5px] p-5 bg-[#F3F7FE] dark:bg-black-light"
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
            :class="{'bg-primary' : selected.item.includes(option) }"
          />
          {{ option }}
        </div>
      </div>
    </div>
  </div>
</template>
