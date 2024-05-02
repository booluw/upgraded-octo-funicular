<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppButton from '@/components/AppButton.vue'
import AppCard from '@/components/AppCard.vue'
import AppInput from '@/components/AppInput.vue'

const router = useRouter()

const reviews = reactive([
  {
    username: 'James T.',
    time: '5 months ago',
    rating: 1,
    location: 'Omiyale Street, Lagos.',
    review: `There is no stable electricity. The roads are fairly good and there is a sense of community.
      The drainage system is poor and most residents litter their surroundings. There are lots
      stores and Supermarkets.`,
    condition: 'network'
  },
  {
    username: 'James T.',
    time: '5 months ago',
    rating: 3,
    location: 'Omiyale Street, Lagos.',
    review: `There is no stable electricity. The roads are fairly good and there is a sense of community.
      The drainage system is poor and most residents litter their surroundings. There are lots
      stores and Supermarkets.`,
    condition: 'power'
  },
  {
    username: 'James T.',
    time: '5 months ago',
    rating: 4,
    location: 'Omiyale Street, Lagos.',
    review: `There is no stable electricity. The roads are fairly good and there is a sense of community.
      The drainage system is poor and most residents litter their surroundings. There are lots
      stores and Supermarkets.`,
    condition: 'water'
  },
  {
    username: 'James T.',
    time: '5 months ago',
    rating: 3,
    location: 'Omiyale Street, Lagos.',
    review: `There is no stable electricity. The roads are fairly good and there is a sense of community.
      The drainage system is poor and most residents litter their surroundings. There are lots
      stores and Supermarkets.`,
    condition: 'security'
  },
  {
    username: 'James T.',
    time: '5 months ago',
    rating: 5,
    location: 'Omiyale Street, Lagos.',
    review: `There is no stable electricity. The roads are fairly good and there is a sense of community.
      The drainage system is poor and most residents litter their surroundings. There are lots
      stores and Supermarkets.`,
    condition: 'traffic'
  }
])

const query = ref('')
const error = ref(false)

const search = function () {
  error.value = false
  if (query.value === '') {
    error.value = true
    return
  }
  router.push(`/areas?query=${query.value}`)
}
</script>

<template>
  <section class="h-[90vh] flex gap-[100px] items-center justify-between overflow-hidden">
    <div class="md:w-1/3">
      <h1 class="text-[52px] font-bold mb-[16px] md:mb-[40px]">
        Find a place you will love to live!
      </h1>
      <p class="mb-[24px] md:mb-[40px]">
        See through the lenses of people who have lived or visited the neighbourhood you might have
        in mind.
      </p>
      <form @submit.prevent="search">
        <div class="text-sm text-red-500 mb-[2px] md:mb-[5px]" v-if="error">Please add a search query</div>
        <AppInput
          v-model="query"
          type="search"
          placeholder="Enter street address"
          class="mb-[8px] md:mb-[20px]"
          required
        >
          <template #icon>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              class="fill-none text-[#0D2159] dark:text-[#BACAF5]"
            >
              <path
                d="M7.4074 12.1482C10.0256 12.1482 12.1481 10.0257 12.1481 7.40749C12.1481 4.78925 10.0256 2.66675 7.4074 2.66675C4.78916 2.66675 2.66666 4.78925 2.66666 7.40749C2.66666 10.0257 4.78916 12.1482 7.4074 12.1482Z"
                stroke="currentColor"
                stroke-width="1.18519"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M13.333 13.3331L10.7552 10.7554"
                stroke="currentColor"
                stroke-width="1.18519"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </template>
        </AppInput>
        <AppButton type="primary" class="uppercase">Explore Area</AppButton>
      </form>
    </div>
    <div class="hidden h-full md:flex gap-[20px] overflow-hidden relative">
      <div
        class="absolute top-0 right-0 left-0 bg-gradient-to-b from-light dark:from-black to-transparent p-10 h-[50vh]"
      />
      <div class="w-1/2 flex flex-col gap-[20px]">
        <AppCard v-for="(review, i) in reviews" :key="i" :review="review" />
      </div>
      <div class="w-1/2 flex flex-col gap-[20px] -mt-[50px]">
        <AppCard v-for="(review, i) in reviews" :key="i" :review="review" />
      </div>
      <div
        class="absolute bottom-0 right-0 left-0 bg-gradient-to-t from-light dark:from-black to-transparent p-10 h-[50vh]"
      />
    </div>
  </section>
</template>
