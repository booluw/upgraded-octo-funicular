<script lang="ts" setup>
import AppDropdown from '@/components/AppDropdown.vue'

const emits = defineEmits(['action'])
const props = defineProps<{
  row: any
  columns: { title: string; field: string; status: boolean }[] | string[]
  action?: string[]
}>()

const emitClick = function (action: string) {
  emits('action', { action, data: props.row })
}
</script>
<template>
  <tr>
    <td
      class="border dark:border-slate-50/25 px-[16px] py-[13px] capitalize max-w-[30%] text-[16px]"
      v-for="(col, index) in columns"
      :key="index"
    >
      <template v-if="col.status">
        <span
          class="block text-xs !capitalize"
          :class="
            row[typeof col === 'string' ? col : col.field] === 'APPROVED'
              ? 'text-[#52BD94]'
              : row[typeof col === 'string' ? col : col.field] === 'DECLINED'
                ? 'text-red-500'
                : 'text-orange-500'
          "
        >
          {{ row[typeof col === 'string' ? col : col.field] }}
        </span>
      </template>
      <p class="line-clamp-3" v-else>
        {{ row[typeof col === 'string' ? col : col.field] }}
      </p>
    </td>
    <td v-if="action" class="border border-slate-50/25 p-3 w-[50px]">
      <AppDropdown :menu="action" @action="emitClick">
        <svg
          width="5"
          height="16"
          class="block my-0 mx-auto"
          viewBox="0 0 5 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M2.0293 12C3.13387 12 4.0293 12.8954 4.0293 14C4.0293 15.1046 3.13387 16 2.0293 16C0.924727 16 0.0292969 15.1046 0.0292969 14C0.0292969 12.8954 0.924727 12 2.0293 12ZM2.0293 0C3.13387 0 4.0293 0.895431 4.0293 2C4.0293 3.10457 3.13387 4 2.0293 4C0.924727 4 0.0292969 3.10457 0.0292969 2C0.0292969 0.895431 0.924727 0 2.0293 0ZM4.0293 8C4.0293 6.89543 3.13387 6 2.0293 6C0.924727 6 0.0292969 6.89543 0.0292969 8C0.0292969 9.10457 0.924727 10 2.0293 10C3.13387 10 4.0293 9.10457 4.0293 8Z"
            fill="#8F95B2"
          />
        </svg>
      </AppDropdown>
    </td>
  </tr>
</template>
