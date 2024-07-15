<script lang="ts" setup>
import { ref, type Component } from 'vue'
import { onClickOutside } from '@vueuse/core'

defineProps<{
  menu: string[] | { text: string, icon: Component | null }[]
  position?: 'top-left' | 'bottom' | string
}>()

const emit = defineEmits(['action'])
const target = ref(null)
const show = ref(false)

onClickOutside(target, () => {
  show.value = false
})
</script>
<template>
  <div class="relative">
    <div @click="show = !show" class="cursor-pointer">
      <slot />
    </div>
    <div
      ref="target"
      class="absolute z-[10] overflow-hidden shadow-xl flex flex-col gap-[2px] border border-slate-300/75 dark:border-gray-500/50 bg-primary-light dark:bg-icon rounded w-auto !min-w-[170px]"
      :class="position === 'bottom' ? 'top-10 right-0' : 'top-5 -left-[165px]'"
      v-if="show"
    >
      <template v-for="(action, index) in menu" :key="index">
        <div
          class="py-3 px-10 cursor-pointer  hover:bg-primary/20 capitalize w-auto text-center font-semibold text-primary"
          v-if="typeof action === 'string'"
          @click="
            emit('action', action);
            show = !show
          "
        >
          {{ action }}
        </div>

        <div
          class="p-3 cursor-pointer hover:bg-primary/20 capitalize text-sm w-auto flex gap-5 items-center"
          v-else
          @click="
            emit('action', action.text);
            show = !show
          "
        >
          <component :is="action.icon" v-if="action.icon" />
          {{ action.text }}
        </div>
      </template>
    </div>
  </div>
</template>
