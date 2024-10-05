<script lang="ts" setup>
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { isEmpty } from 'lodash'

const props = defineProps<{
  options: string[] | { label: string; val: string }[]
  placeholder?: string
  disabled?: boolean
}>()

const target = ref(null)
const input = ref<HTMLInputElement | null>(null)
const value = defineModel() as any
const show = ref(false)
const searchString = ref(value.value || '')

const filteredOptions = computed(() => {
  if (searchString.value === '') return props.options
  if (typeof props.options[0] === 'string') {
    return props.options.filter((option: any) =>
      option.toLocaleLowerCase().includes(searchString.value.toLocaleLowerCase())
    )
  } else {
    return props.options?.filter((option: any) =>
      option.label?.toLocaleLowerCase().includes(searchString.value?.toLocaleLowerCase())
    )
  }
})

const updateModel = function (option: string | { label: string, val: string }) {
  value.value = option
  searchString.value = typeof option === 'string' ? option : option.label
  show.value = !show.value
}

onClickOutside(target, () => (show.value = false))
</script>
<template>
  <div class="" ref="target">
    <div
      class="flex flex-col justify-center rounded-[6px] bg-[#F3F7FE] dark:bg-black-light text-black-light dark:text-[#F3F7FE] border dark:border-[#383B43] focus-within:border-primary transition-all ease-out group p-[12px] pb-[16px] capitalize"
      :class="{ 'cursor-pointer': !disabled }"
      @click="input!.focus()"
    >
      <span
        class="text-[10px] !text-left"
        :class="
          !isEmpty(value) || show
            ? 'opacity-55'
            : 'opacity-0 translate-y-[15px] group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all ease-in-out'
        "
      >
        {{ placeholder }}
      </span>
      <input
        ref="input"
        type="text"
        v-model="searchString"
        @focus="show = true"
        :placeholder
        :disabled
        class="outline-none focus-within:outline-none bg-transparent w-full"
      />
    </div>
    <div
      class="w-full bg-transparent focus-within:outline-none outline-none relative"
    >
      <div
        class="absolute -top-[4px] right-0 left-0 z-20 rounded-b max-h-[200px] overflow-auto flex flex-col gap-[5px] bg-[#F3F7FE] dark:bg-black-light px-2"
        v-show="show"
      >
        <div
          class="text-sm cursor-pointer hover:opacity-75 p-2 rounded-sm capitalize"
          :class="{ 'bg-primary': value === option }"
          v-for="(option, index) in filteredOptions"
          :key="index"
          @click="updateModel(option)"
        >
          {{ typeof option === 'string' ? option : option.label }}
        </div>
      </div>
    </div>
  </div>
</template>
