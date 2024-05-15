<script lang="ts" setup>
const props = defineProps<{
  currentPage: number
  itemsPerPage: number
  totalItems: number
}>()

const emit = defineEmits(['next'])
</script>
<template>
  <section class="flex justify-between items-center mt-10">
    <button
      class="flex items-center justify-between gap-5 text-[#344054] border border-[#344054]/50 dark:border-white/75 dark:text-white/75 rounded-lg px-5 py-3"
      :disabled="currentPage < 1"
      @click="emit('next', currentPage - 1)"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15.8327 10.0003H4.16602M4.16602 10.0003L9.99935 15.8337M4.16602 10.0003L9.99935 4.16699"
          stroke="currentColor"
          stroke-width="1.67"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Previous
    </button>
    <!-- <div class="w-[50%] flex items-center justify-center gap-[20px]">
      <button
        class="py-[10px] px-[20px] bg-[#3366FF]/5 rounded-full text-primary dark:text-primary-light disabled:cursor-not-allowed"
        :class="{ '!bg-primary/10 !text-primary': currentPage == 0 }"
        @click="emit('next', 0)"
        :disabled="currentPage < 1"
      >
        1
      </button>
      <template v-for="(page, index) in Math.floor(totalItems / itemsPerPage)" :key="index">
        <button
          v-if="page !== 1"
          class="py-[10px] px-[20px] bg-[#3366FF]/5 rounded-full text-primary dark:text-primary-light disabled:cursor-not-allowed"
          :class="{ '!bg-primary/10 !text-primary': page === currentPage }"
          @click="emit('next', 0)"
          :disabled="page === currentPage"
        >
          {{ page }}
        </button>
      </template>
    </div> -->
    <button
      class="flex items-center justify-between gap-5 text-[#344054] border border-[#344054]/50 dark:border-white/75 dark:text-white/75 rounded-lg px-5 py-3"
      :disabled="currentPage === Math.floor(totalItems / itemsPerPage) || itemsPerPage > totalItems"
      @click="emit('next', currentPage + 1)"
    >
      Next
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.16602 10.0003H15.8327M15.8327 10.0003L9.99935 4.16699M15.8327 10.0003L9.99935 15.8337"
          stroke="currentColor"
          stroke-width="1.67"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </section>
</template>
