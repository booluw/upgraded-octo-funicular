<script lang="ts" setup>
import Rows from './Rows.vue'

const emit = defineEmits(['on'])

const props = defineProps<{
  columns: { title: string; field: string, status: boolean }[] | string[]
  data: any[]
  actions?: string[]
}>()

const emitAction = function(data: typeof props.columns) {
  emit('on', data)
}
</script>
<template>
  <table class="table-auto w-full text-left border-collapse border rounded mt-10">
    <thead>
      <tr class="bg-slate-300/30">
        <th class="border border-slate-50/25 px-[16px] py-[15.5px]" v-for="(col, index) in columns" :key="index">
          {{ typeof col === 'string' ? col : col.title }}
        </th>
        <th v-if="actions" class="border border-slate-50/25 p-3"></th>
      </tr>
    </thead>
    <tbody v-if="data.length !== 0">
      <Rows
        :columns="columns"
        :row="row"
        :action="actions"
        v-for="(row, index) in data"
        :key="index"
        :class="index % 2 === 1 ? 'bg-slate-500/10' : ''"
        @action="emitAction"
      />
    </tbody>
    <div class="text-center absolute right-0 left-0 p-5 opacity-45 text-sm" v-else>
      No data
    </div>
  </table>
</template>
