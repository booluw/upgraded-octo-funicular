<script lang="ts" setup>
import { ref, computed, onMounted, reactive, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '@/stores/user'
import { isEmpty } from 'lodash'

import { supabase } from '@/config/supabase'
import { notify } from '@/components/AppNotification'
import { onClickOutside } from '@vueuse/core'

import AppLogo from '@/components/AppLogo.vue'
import AppButton from '@/components/AppButton.vue'
import AppError from '@/components/AppError.vue'
import AppLoader from '@/components/AppLoader.vue'
import AppDropdown from '@/components/AppDropdown.vue'
import IconProfile from '@/components/icons/IconProfile.vue'
import IconLike from '@/components/icons/IconLike.vue'
import IconBookmark from '@/components/icons/IconBookmark.vue'

import AddReviewModal from '@/views/areas/components/AddReviewModal.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import AppSelect from '@/components/AppSelect.vue'

const user = useUser().user
const userStore = useUser()
const addReview = ref(false)

const filterModal = ref(false)
const target = ref(null)

const loading = ref(false)
const reviewLoading = ref(false)
const error = ref(false)

const filter: Ref<null | string> = ref(null)
const counter = reactive({})

const reviews = ref([])
const params: Ref<{ sort_by: { label: string; val: string } | any; rating: number | undefined }> =
  ref({ sort_by: { label: 'Local Government Area', val: 'area_lga' }, rating: undefined })
const reviewCount = ref(0)
const comments: Ref<any> = ref({})

const _review = computed(() => {
  if (reviews.value.length === 0) return []
  if (filter.value === null) return reviews.value
  return reviews.value.filter((item: any) => {
    if (item.amenities.includes(filter.value)) {
      return item
    }
  })
})

const handleClick = function (review: any) {
  comments.value = review
}

const getAllReviews = async function () {
  reviewLoading.value = true
  error.value = false

  try {
    const query = params.value.rating ? `, rating.eq.${Number(params.value.rating)}` : ``

    const { data, error } = await supabase
      .rpc('get_reviews_and_profiles')
      .select('*')
      .or(`and(approved.eq.APPROVED${query}, profile_id.eq.${user.id})`)
      .order(params.value.sort_by.val, { ascending: false })

    if (error) throw Error(error.message ?? error)
    reviews.value = data.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  } catch (err) {
    error.value = true
    console.error(err)
  }

  reviewLoading.value = false
}

const getReviewsAmenities = async function () {
  loading.value = true
  error.value = false

  try {
    const { data, error: review_error } = await supabase
      .from('reviews')
      .select('*, area(*), profile(*)')
      .or(`and(approved.eq.APPROVED, profile_id.eq.${user.id})`)

    if (review_error) throw review_error
    data?.forEach((review: any) => {
      review.amenities.forEach((item: string) => {
        counter[item] = (counter[item] || 0) + 1
      })
    })

    reviewCount.value = data.length
  } catch (err) {
    console.log(err)
    error.value = true
  }

  loading.value = false
}

const getAllAmenities = async function () {
  loading.value = true
  error.value = false

  try {
    const { data, error } = await supabase.from('amenities').select('title')

    if (error) throw Error(error.message ?? error)

    data.forEach((item: { title: string }) => {
      counter[item.title] = counter[item.title] || 0
    })

    await getReviewsAmenities()
    await getAllReviews()
  } catch (err) {
    console.log(err)
    error.value = true
    notify({
      content: err ?? `We couldn't fetch Amenities, please reload`,
      type: 'error',
      position: 'top-center'
    })
  }

  loading.value = false
}

onClickOutside(target, () => {
  filterModal.value = false
})

onMounted(() => {
  getAllAmenities()
})
</script>
<template>
  <section
    class="h-[100vh] flex items-center justify-center bg-primary-light dark:bg-[#14161A] text-primary"
    v-if="loading"
  >
    <AppLoader />
  </section>
  <AppError v-else-if="error" />
  <section
    v-else
    class="min-h-[100vh] md:flex flex-col items-center bg-[#FBFCFE] dark:bg-[#14161A] text-text dark:text-text-dark"
  >
    <div class="w-full p-5 md:w-page md:px-0">
      <h1 class="text-[24px] capitalize">Submitted Reviews</h1>
      <h2 class="text-[12px] md:text-[16px]">
        <b>“{{ reviewCount }}” Reviews so far!</b>
      </h2>

      <div class="md:flex gap-10">
        <div class="w-full md:w-4/5">
          <section
            class="h-[100%] overflow-y-auto flex items-center justify-center bg-primary-light dark:bg-[#14161A] text-primary"
            v-if="reviewLoading"
          >
            <AppLoader />
          </section>
          <AppError v-else-if="error" />
          <div class="" v-else>
            <div class="mt-10" v-if="_review.length !== 0">
              <ReviewCard
                :class="{
                  'bg-primary/10 dark:bg-black/50 px-2': review.review_id! === comments.review_id
                }"
                :review
                @clicked="handleClick"
                :hide-comment="true"
                v-for="(review, index) in _review"
                :key="index"
              />
            </div>
            <div class="" v-else>
              <div class="text-xl opacity-75" v-if="filter !== null">
                No reviews under {{ filter }} yet.
              </div>
              <div class="text-xl opacity-75" v-else>No reviews yet, add one.</div>
            </div>
          </div>
        </div>
        <div class="hidden md:block md:w-1/2 relative">
          <div
            class="h-[80vh] px-5 scrollbar scrollbar-thumb-primary-light dark:scrollbar-thumb-[#14161A] sticky top-[160px] overflow-auto"
            v-if="!isEmpty(comments)"
          >
            <div
              class="flex items-center justify-between px-4 py-3 rounded shadow bg-light dark:bg-black sticky top-0 z-[99]"
            >
              <div class="flex items-center gap-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g opacity="0.6">
                    <path
                      d="M12.0029 1.5C8.05533 1.5 4.84376 4.71157 4.84376 8.65909C4.84376 11.2015 6.54479 13.8378 8.2145 15.8191H4.88198C4.18278 15.8191 3.52433 16.1914 3.16399 16.7914L1.84683 18.9866C1.4106 19.7126 1.39986 20.5867 1.817 21.3236C2.23461 22.06 2.9894 22.5 3.83608 22.5H20.1696C21.0168 22.5 21.7711 22.06 22.1887 21.3236C22.6058 20.5867 22.5946 19.713 22.1589 18.9866L20.8427 16.7904C20.4823 16.191 19.8239 15.8182 19.1247 15.8182H17.7031L15.9105 17.7273H19.1247C19.1576 17.7273 19.1891 17.7448 19.2058 17.7729L20.5229 19.9682C20.6303 20.1472 20.5715 20.3043 20.5276 20.3821C20.4832 20.4604 20.3782 20.5909 20.1696 20.5909H3.83608C3.62752 20.5909 3.52252 20.4604 3.47813 20.383C3.43422 20.3052 3.3754 20.1481 3.48279 19.9691L4.79995 17.7739C4.81665 17.7452 4.84812 17.7282 4.88105 17.7282H9.99216C10.7467 18.4681 11.3188 18.9598 11.3941 19.0221C11.5707 19.1681 11.7871 19.2411 12.0029 19.2411C12.2186 19.2411 12.435 19.1681 12.6116 19.0221C12.8793 18.8011 19.1619 13.5449 19.1619 8.65909C19.1619 4.71157 15.9504 1.5 12.0029 1.5ZM12.0029 3.40909C14.8975 3.40909 17.2529 5.76443 17.2529 8.65909C17.2529 11.6125 13.8857 15.2992 12.0029 17.0198C10.12 15.2992 6.75285 11.6125 6.75285 8.65909C6.75285 5.76443 9.10819 3.40909 12.0029 3.40909ZM12.0029 7.22727C11.212 7.22727 10.571 7.86825 10.571 8.65909C10.571 9.44993 11.212 10.0909 12.0029 10.0909C12.7937 10.0909 13.4347 9.44993 13.4347 8.65909C13.4347 7.86825 12.7937 7.22727 12.0029 7.22727Z"
                      class="fill-[#14161A] dark:fill-[#FBFCFE]"
                    />
                  </g>
                </svg>

                <h2 class="capitalize text-[18px] font-[600]">
                  {{ comments.area_name }}, {{ comments.area_lga }}
                </h2>
              </div>

              <router-link
                target="_blank"
                :to="`/areas/${comments.area_id}`"
                class="inline-flex items-center gap-3 py-2 px-3 border-[2px] rounded border-[#14161A]/10 dark:border-[#FBFCFE]/20"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    opacity="0.6"
                    d="M15 3.75C14.586 3.75 14.25 4.086 14.25 4.5C14.25 4.914 14.586 5.25 15 5.25H17.6895L11.4697 11.4697C11.1769 11.7626 11.1769 12.2374 11.4697 12.5303C11.6164 12.6769 11.808 12.75 12 12.75C12.192 12.75 12.3836 12.6769 12.5303 12.5303L18.75 6.31055V9C18.75 9.414 19.086 9.75 19.5 9.75C19.914 9.75 20.25 9.414 20.25 9V4.5C20.25 4.086 19.914 3.75 19.5 3.75H15ZM6.75 4.5C5.50912 4.5 4.5 5.50912 4.5 6.75V17.25C4.5 18.4909 5.50912 19.5 6.75 19.5H17.25C18.4909 19.5 19.5 18.4909 19.5 17.25V12.75C19.5 12.336 19.164 12 18.75 12C18.336 12 18 12.336 18 12.75V17.25C18 17.6636 17.6636 18 17.25 18H6.75C6.33637 18 6 17.6636 6 17.25V6.75C6 6.33637 6.33637 6 6.75 6H11.25C11.664 6 12 5.664 12 5.25C12 4.836 11.664 4.5 11.25 4.5H6.75Z"
                    class="fill-[#14161A] dark:fill-[#FBFCFE]"
                  />
                </svg>

                Explore
              </router-link>
            </div>
            <ReviewCard :review="comments" />
          </div>
        </div>
      </div>
    </div>
  </section>
  <div
    class="fixed z-[99] bottom-20 right-5 left-5 md:bottom-auto md:top-[125px] md:left-16 md:right-auto min-w-[341px] rounded shadow p-5 text-text dark:text-text-dark !bg-[#FBFCFE] dark:!bg-[#14161A] border !border-[#B2C1E6] dark:!border-[#383B43]"
    v-if="filterModal || error"
    ref="target"
  >
    <button
      class="bg-transparent border border-[#E5EDF5] dark:border-[#212327] rounded p-[4px] absolute right-[24px] md:hidden"
      @click="filterModal = !filterModal"
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
    <div class="mb-3 text-center md:hidden">Filter</div>
    <form @submit.prevent="getAllReviews()">
      <h3 class="text-sm">Location Ratings</h3>
      <div class="grid grid-cols-5 gap-1 md:gap-3 mt-2">
        <div
          class="flex items-center gap-2 text-center text-[14px] py-[6px] px-[12px] border-[1.5px] text-[#14161A] border-[#B2C1E6] dark:border-[#383B43] dark:text-[#FBFCFE] bg-transparent rounded-[4px] cursor-pointer hover:opacity-75"
          :class="{
            '!bg-[#14161A] !border-[#B2C1E6] text-[#E5EDF5] dark:!bg-[#FBFCFE] dark:!border-[#383B43] dark:!text-[#212327]':
              params.rating === i
          }"
          v-for="i in 5"
          @click="params.rating = i"
          :key="i"
        >
          <svg class="w-[12px]" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M6 0L7.875 3.975L12 4.575L9 7.65L9.675 12L6 9.975L2.325 12L3 7.65L0 4.575L4.125 3.975L6 0Z"
              fill="#FABB07"
            />
          </svg>
          <span> {{ i }} {{ i !== 5 ? '+' : '' }} </span>
        </div>
      </div>
      <h3 class="text-sm mt-5">Sort by</h3>
      <AppSelect
        class="mt-2"
        :options="[
          { label: 'Area Name', val: 'area_name' },
          { label: 'Local Government Area', val: 'area_lga' },
          { label: 'State', val: 'area_state' }
        ]"
        v-model="params.sort_by"
      />
      <div class="grid grid-cols-2 gap-5 mt-8">
        <AppButton size="small" type="outline" mode="button" @click="filterModal = !filterModal"
          >Cancel</AppButton
        >
        <AppButton size="small" type="primary">Apply</AppButton>
      </div>
    </form>
  </div>
  <AddReviewModal v-if="addReview" @close="addReview = false" />
</template>
