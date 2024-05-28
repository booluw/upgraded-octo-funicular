<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

import { supabase } from '../config/supabase'

import AppButton from '@/components/AppButton.vue'
import AppCard from '@/components/AppCard.vue'
import AppInput from '@/components/AppInput.vue'
import AppLoader from '@/components/AppLoader.vue'

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

const area = reactive({ items: [] as any[] })

const query = ref({ query: '', name: '', id: '' })
const closeSuggestion = ref(true)
const error = ref(false)
const loading = ref(false)

const param = computed({
  set(newVal) {
    query.value.query = newVal
    closeSuggestion.value = true
  },
  get() {
    return query.value.name || query.value.query
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
      .rpc('search_areas', { search_name: query.value.query })
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

watch(
  query,
  async () => {
    await search()
  },
  { deep: true }
)
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
      <form @submit.prevent="gotoArea()">
        <div class="text-sm text-red-500 mb-[2px] md:mb-[5px]" v-if="error">
          Please add a search query
        </div>
        <div class="group relative">
          <AppInput
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
            class="hidden group-focus-within:block absolute top-16 left-0 right-0 z-50 p-1 bg-light dark:bg-icon text-text dark:text-text-dark rounded h-[25vh] overflow-y-auto"
            v-if="closeSuggestion"
          >
            <template v-if="area.items.length !== 0">
              <button
                type="none"
                class="block w-full text-left p-3 cursor-pointer hover:opacity-75 capitalize"
                :class="item.area_name === query.name ? 'bg-primary rounded' : ''"
                v-for="(item, index) in area.items"
                :key="index"
                @click.prevent="setPath(item)"
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
