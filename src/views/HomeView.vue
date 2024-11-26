<script setup lang="ts">
import { reactive, ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { supabase } from '../config/supabase'
import { onClickOutside, useTitle } from '@vueuse/core'

import AppButton from '@/components/AppButton.vue'
import AppCard from '@/components/AppCard.vue'
import AppInput from '@/components/AppInput.vue'
import AppLoader from '@/components/AppLoader.vue'
import AddNewAddressModal from '@/components/AddNewAddressModal.vue'

const title = useTitle()
title.value = 'SpottaNG | Find a place you will love to live!'

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

const area = reactive({ items: [] as any[] })

const query = ref({ query: '', name: '', id: '' })
const closeSuggestion = ref(false)
const error = ref(false)
const loading = ref(false)
const target = ref(null)
const addAddressModal = ref(false)

const numberOfReviews = reactive({ count: 0, imgs: [] as any })

const param = computed({
  set(newVal) {
    query.value.query = newVal as any
    if (newVal !== '') closeSuggestion.value = true
  },
  get() {
    return query.value.name
      ? query.value.name.charAt(0).toUpperCase() +
          query.value.name.slice(1) +
          ', ' +
          query.value.id.split('-')[query.value.id.split('-').length - 1].charAt(0).toUpperCase() +
          query.value.id.split('-')[query.value.id.split('-').length - 1].slice(1)
      : '' || query.value.query
  }
})

const setPath = function (item: any) {
  query.value.id = item.area_id
  query.value.name = item.area_name
  query.value.query = ''
  closeSuggestion.value = false
}

const search = async function () {
  error.value = false
  if (param.value === '') {
    area.items = []
    error.value = true
    return
  }

  loading.value = true

  try {
    const { data, error } = await supabase
      .rpc('search_areas', { search_name: query.value.query.replace(/\d+/g, '').replace(' ', '') })
      .order('area_created_at', { ascending: true })

    if (error) throw Error(error.message ?? error)
    area.items = data
  } catch (error) {
    console.log(error)
  }

  loading.value = false
  // router.push(`/areas?query=${query.value}`)
}

const gotoArea = function () {
  if (query.value.id === '') {
    error.value = true
    return
  }

  router.push(`/areas/${query.value.id}`)
}

const getNumberOfReviews = async function () {
  try {
    const { count } = await supabase
      .from('reviews')
      .select('', { count: 'exact' })
      .or(`and(approved.eq.APPROVED)`)
    const { data } = await supabase.from('profile').select('img').not('img', 'is', 'null').limit(20)

    data?.map((item) => {
      numberOfReviews.imgs.push(item.img)
    })

    numberOfReviews.count = count as unknown as number
  } catch (error) {
    console.log(error)
  }
}

watch(
  query,
  async () => {
    await search()
  },
  { deep: true }
)

onMounted(() => {
  getNumberOfReviews()
})

onClickOutside(target, () => (closeSuggestion.value = false))
</script>

<template>
  <section class="h-[90vh] flex gap-[100px] items-center justify-between overflow-hidden">
    <div class="md:w-[calc(100%/2.5)]">
      <h1 class="text-[54px] font-bold mb-[12px] md:mb-[16px] leading-tight">
        Find your ideal neighborhood
      </h1>
      <p class="md:w-2/3 mb-[24px] md:mb-[40px]">
        Get authentic insights from locals and visitors to help you find the place that feels like home.
      </p>
      <form @submit.prevent="gotoArea()" class="mb-[24px] md:w-5/6">
        <div class="text-sm text-red-500 mb-[2px] md:mb-[5px]" v-if="error">
          Please add a search query
        </div>
        <div class="relative">
          <AppInput
            ref="target"
            v-model="param"
            type="search"
            placeholder="Enter street address"
            class="mb-[8px] md:mb-[20px] !capitalize"
            remote
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
          <div
            class="absolute top-16 left-0 right-0 z-50 bg-light dark:bg-icon text-text dark:text-text-dark rounded h-[25vh] overflow-y-auto scrollbar-thin dark:scrollbar-track-black/50 dark:scrollbar-thumb-slate-700/60 shadow-lg border border-black/5 dark:border-[#383B43]"
            v-if="closeSuggestion"
          >
            <template v-if="area.items.length !== 0">
              <button
                type="button"
                class="block w-full text-left p-3 cursor-pointer hover:bg-[#3366FF]/30 capitalize border-b border-black/5 dark:border-[#383B43]"
                :class="item.area_name === query.name ? 'bg-primary rounded' : ''"
                v-for="(item, index) in area.items"
                :key="index"
                @click="setPath(item)"
              >
                {{ item.area_name }} {{ item.area_lga }}, {{ item.area_state }} state
              </button>
            </template>
            <template v-else>
              <div class="h-full w-full flex items-center justify-center" v-if="loading">
                <AppLoader />
              </div>
              <div class="w-full text-center text-sm mt-5" v-else>
                Your query did not return any result
              </div>
            </template>
          </div>
        </div>
        <AppButton type="primary" class="uppercase w-full md:w-auto">Explore Area</AppButton>
      </form>
      <router-link to="/all-reviews" class="inline-flex items-center gap-5">
        <div class="flex items-center gap-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path
                d="M9.77364 17.2316C9.54253 17.2316 9.31164 17.142 9.13741 16.9634C8.79475 16.612 8.80141 16.0491 9.15275 15.7065L12.9556 11.9958L9.16141 8.29359C8.81008 7.95093 8.80341 7.38804 9.14608 7.0367C9.48919 6.68515 10.0519 6.67848 10.4032 7.02137L14.8494 11.3596C15.0207 11.5267 15.1174 11.7563 15.1174 11.9958C15.1174 12.2354 15.0207 12.4647 14.8494 12.632L10.3945 16.9787C10.2214 17.1476 9.99741 17.2316 9.77364 17.2316Z"
                class="fill-[#14161A] dark:fill-[#FBFCFE]"
              />
            </g>
          </svg>
          <p class="text-primary font-[600]">{{ numberOfReviews.count }} Reviews so far!</p>
        </div>
        <div class="flex">
          <img
            :src="img"
            class="w-[32px] h-[32px] rounded bg-text-dark dark:bg-black-light border-2 border-light dark:border-black"
            :class="{ '-ml-2': index !== 0 }"
            v-for="(img, index) in numberOfReviews.imgs"
            :key="index"
          />
        </div>
      </router-link>
      <a
        href="#add-place"
        @click.prevent="addAddressModal = true"
        class="mt-2 flex items-center gap-1 text-primary font-[600]"
      >
        <svg
          width="16"
          height="17"
          viewBox="0 0 16 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M9.00022 3.81097C9.00022 3.25868 8.55251 2.81096 8.00022 2.81097C7.44794 2.81097 7.00022 3.25868 7.00022 3.81097L7.00022 7.6665L3.14468 7.6665C2.5924 7.6665 2.14468 8.11422 2.14468 8.6665C2.14468 9.21879 2.5924 9.6665 3.14468 9.6665L7.00022 9.6665L7.00022 13.522C7.00022 14.0743 7.44794 14.522 8.00022 14.522C8.55251 14.522 9.00022 14.0743 9.00022 13.522L9.00022 9.6665L12.8558 9.6665C13.408 9.6665 13.8558 9.21879 13.8558 8.6665C13.8558 8.11422 13.408 7.6665 12.8558 7.6665L9.00022 7.6665L9.00022 3.81097Z"
            class="fill-[#14161A] dark:fill-[#FBFCFE]"
          />
        </svg>
        Can't find your address?
      </a>
    </div>
    <div class="hidden h-full md:flex gap-[20px] overflow-hidden relative">
      <div
        class="absolute z-[9] top-0 right-0 left-0 bg-gradient-to-b from-light dark:from-black to-transparent p-10 h-[50vh]"
      />
      <div
        class="w-1/2 flex flex-col gap-[20px] animate-marqueen-infinite transition-transform ease-in-out"
      >
        <AppCard v-for="(review, i) in reviews" :key="i" :review="review" />
      </div>
      <div
        class="w-1/2 flex flex-col gap-[20px] -mt-[50px] animate-marquee-infinite transition-transform ease-in-out"
      >
        <AppCard v-for="(review, i) in reviews" :key="i" :review="review" />
      </div>
      <div
        class="absolute z-[9] bottom-0 right-0 left-0 bg-gradient-to-t from-light dark:from-black to-transparent p-10 h-[50vh]"
      />
    </div>

    <AddNewAddressModal v-if="addAddressModal" @close="addAddressModal = false" @done="router.go(0)" />
  </section>
</template>
