<script lang="ts" setup>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

defineProps<{
  menu: string[]
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
      class="absolute top-0 -left-28 overflow-hidden shadow-xl flex flex-col gap-[2px] bg-slate-200 dark:bg-slate-700"
      v-if="show"
    >
      <div
        class="py-3 px-10 cursor-pointer bg-primary-light hover:bg-primary-light/95 dark:bg-black hover:dark:bg-black/95 capitalize text-sm"
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
