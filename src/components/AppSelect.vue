<script lang="ts" setup>
import { reactive, ref, computed } from 'vue';
import { onClickOutside } from '@vueuse/core'
import { isEmpty } from 'lodash';

const target = ref(null)

onClickOutside(target, () => (show.value = false))

const props = defineProps<{
  options: string[] | { label: string, val: string }[]
  placeholder?: string
}>()

const value = defineModel() as any
const show = ref(false)
const query = ref('')

const updateModel = function (option: string) {
  value.value = option
  show.value = !show.value
}
</script>
<template>
  <div class="" ref="target">
    <div
      class="flex flex-col justify-center rounded-[6px] bg-[#F3F7FE] dark:bg-black-light text-black-light dark:text-[#F3F7FE] border dark:border-[#383B43] focus-within:border-primary transition-all ease-out group p-[12px] pb-[16px] cursor-pointer capitalize"
      @click="show = true"
    >
      <span
        class="text-[10px] !text-left"
        :class="
          !isEmpty(value)
            ? 'opacity-55'
            : 'hidden opacity-0 translate-y-[15px] group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all ease-in-out'
        "
      >
        {{ placeholder }}
      </span>
      <div class="opacity-50" v-if="isEmpty(value)" @click="show = true">{{ placeholder }}</div>
      <span>{{ typeof value === 'string' ? value : value?.label }}</span>
    </div>

    <div
      class="w-full bg-transparent focus-within:outline-none outline-none relative"
      :value="value"
      :placeholder="placeholder"
    >
      <div
        class="absolute -top-[4px] right-0 left-0 z-20 rounded-b max-h-[200px] overflow-auto flex flex-col gap-[5px] bg-[#F3F7FE] dark:bg-black-light px-2"
        v-if="show"
      >
        <div
          class="text-sm cursor-pointer hover:opacity-75 p-2 rounded-sm capitalize"
          :class="{ 'bg-primary': value === option }"
          v-for="(option, index) in options"
          :key="index"
          @click="updateModel(option)"
        >
          {{ typeof option === 'string' ? option : option.label }}
        </div>
      </div>
    </div>
  </div>
</template>
