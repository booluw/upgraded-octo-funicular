<script lang="ts" setup>
import { reactive, ref, computed, onMounted, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/config/supabase'
import { onClickOutside } from '@vueuse/core'

import { useUser } from '@/stores/user'
import { notify } from '@/components/AppNotification'

import AppSelection from '@/components/AppSelection.vue'
import AppRating from '@/components/AppRating.vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'

const emit = defineEmits(['close', 'done'])
const target = ref(null)
const route = useRoute()
const user = useUser()
const loading = ref(false)
const error = ref(false)

const query = ref({ query: '', name: '', id: '' }) // route.params.name })
const closeSuggestion = ref(false)

const area = reactive({ items: [] as any[] })

const amenity: Ref<{ title: string }[]> = ref([])
const review = reactive({
  amenities: [] as string[],
  rating: 0,
  review: '',
  anon: false,
  area: query.value.id,
  profile_id: user.user.id
})

const amenities = computed(() => {
  if (amenity.value.length === 0) return []

  return amenity.value.map((item) => {
    return item.title
  })
})

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

const getAllAmenities = async function () {
  try {
    const { data, error } = await supabase.from('amenities').select('title')

    if (error) throw Error(error.message ?? error)
    amenity.value = data
  } catch (err) {
    console.log(err)
    notify({
      content: err ?? `We couldn't fetch Amenities, please reload`,
      type: 'error',
      position: 'top-center'
    })
  }
}

const submitReview = async function () {
  if (review.area === '') {
    notify({
      content: 'Choose a location to review',
      position: 'top-center',
      type: 'warning'
    })
    return
  }
  
  if (review.rating === 0) {
    notify({
      content: 'How many stars will you rate this location?',
      position: 'top-center',
      type: 'warning'
    })
    return
  }

  if (review.review === '') {
    notify({
      content: 'Write something about this location',
      position: 'top-center',
      type: 'warning'
    })
    return
  }

  try {
    loading.value = true

    const { data, error } = await supabase
      .from('reviews')
      .insert({ ...review })
      .select('*, profile(*)')

    if (error) throw Error(error.message ?? error)

    notify({ content: 'review Submitted', position: 'top-center', type: 'success' })
    emit('done', data)
  } catch (error) {
    console.log(error)
    notify({ content: error, position: 'top-center', type: 'error' })
  }

  loading.value = false
}

onClickOutside(target, () => {
  emit('close')
})

onMounted(() => {
  getAllAmenities()
  if (route.params.name) { search() }
})

watch(
  query,
  async () => {
    await search()
  },
  { deep: true }
)
</script>
<template>
  <section
    class="py-5 fixed z-20 top-0 right-0 bottom-0 left-0 bg-[#FBFCFE]/50 dark:bg-black/50 flex justify-center items-center backdrop-blur"
  >
    <div
      class="mx-5 h-full w-full md:mx-0 md:!w-[500px] rounded-[6px] p-[24px] bg-[#FBFCFE] dark:bg-black text-black dark:text-text-dark overflow-x-auto shadow scrollbar-none relative"
      ref="target"
      id="modal"
    >
      <button
        class="bg-transparent border border-[#E5EDF5] dark:border-[#212327] rounded p-[4px] absolute right-[24px]"
        @click="emit('close')"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity="0.6">
            <path
              d="M18 6L6 18"
              class="stroke-[#14161A] dark:stroke-[#FBFCFE]"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M6 6L18 18"
              class="stroke-[#14161A] dark:stroke-[#FBFCFE]"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        </svg>
      </button>
      <h1 class="text-center mb-7 font-semibold text-[24px]">Review Location</h1>
      <form
        @submit.prevent="submitReview()"
        class="h-[85%] overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-black"
      >
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
        <h3 class="mb-[4px]">Topic of concern</h3>
        <AppSelection
          v-model="review.amenities"
          :options="amenities"
          placeholder="Select an amenity to start"
        />
        <div class="flex items-center gap-5">
          <AppRating v-model="review.rating" class="my-[16px]" />
          <span class="block mt-10">
            {{ review.rating === 0 ? 'N/A' : review.rating + '.0' }}
          </span>
        </div>
        <h3 class="mb-[4px]">Start a discussion</h3>
        <AppInput type="textarea" v-model="review.review" placeholder="Write a review" />
        <div
          class="inline-flex gap-[8px] my-[16px] cursor-pointer"
          @click="review.anon = !review.anon"
        >
          <div
            class="py-2 px-[11px] border dark:border-white/40 rounded"
            :class="{ 'bg-primary': review.anon }"
          />
          Post as Anonymous
        </div>
        <div class="flex gap-[24px] mt-5">
          <AppButton type="primary" mode="submit" size="small" class="w-full" :loading="loading"
            >SUBMIT REVIEW</AppButton
          >
        </div>
      </form>
    </div>
  </section>
</template>
