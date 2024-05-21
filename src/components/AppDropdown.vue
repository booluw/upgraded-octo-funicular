<script lang="ts" setup>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

defineProps<{
  menu: string[],
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
      class="absolute z-[10] overflow-hidden shadow-xl flex flex-col gap-[2px] bg-slate-200 dark:bg-slate-700"
      :class="position === 'bottom' ? 'top-10 right-0' : 'top-0 -left-28'"
      v-if="show"
    >
      <div
        class="py-3 px-10 cursor-pointer bg-primary-light hover:bg-primary/10 dark:bg-black hover:dark:bg-text/60 capitalize text-sm"
        v-for="(action, index) in menu"
        :key="index"
        @click="
          emit('action', action);
          show = !show
        "
      >
        {{ action }}
      </div>
    </div>
  </div>
</template>
