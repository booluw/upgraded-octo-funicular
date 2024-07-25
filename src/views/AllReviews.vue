<script lang="ts" setup>
import { ref, computed, onMounted, reactive, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '@/stores/user'
import { isEmpty } from 'lodash'

import { supabase } from '@/config/supabase'
import { notify } from '@/components/AppNotification'

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

const router = useRouter()
const user = useUser().user
const userStore = useUser()
const addReview = ref(false)

const loading = ref(false)
const reviewLoading = ref(false)
const error = ref(false)
const scroller = ref(null) as any

const filter: Ref<null | string> = ref(null)
const counter = reactive({})

const reviews = ref([])
const params = ref({ lga: '', rating: undefined })
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

const scroll = function () {
  scroller.value.scrollLeft += 430
}

const handleClick = function (review: any) {
  comments.value = review
}

const handleAction = async function (action: 'logout' | 'profile' | 'my reviews') {
  if (action === 'logout') {
    await supabase.auth.signOut()
    userStore.resetUser()
    router.push('/')
  } else if (action === 'profile') {
    router.push('/profile')
  } else {
    router.push('/profile/reviews')
  }
}

const getAllReviews = async function () {
  reviewLoading.value = true
  error.value = false

  try {
    const query = params.value.rating
      ? `area_lga.eq.${params.value.lga}, rating.eq.${params.value.rating}`
      : `area_lga.eq.${params.value.lga}`

    const { data, error } = await supabase
      .rpc('get_reviews_and_profiles')
      .select('*')
      .or(`and(approved.eq.APPROVED), ${query}`)
      .order('likes', { ascending: false })

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
      .or(`and(approved.eq.APPROVED)`)

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
    <div
      class="md:w-[100vw] bg-light dark:bg-black flex flex-col items-center mb-[16px] md:mb-[32px] fixed right-0 left-0 z-10"
    >
      <div class="w-full md:w-page px-[16px] md:px-0">
        <header class="py-[10.5px] flex gap-[10px] md:gap-0 justify-between items-center">
          <div class="w-full flex gap-[10px] md:gap-[42px] items-center justify-between">
            <router-link to="/" class="text-text dark:text-text-dark">
              <AppLogo />
            </router-link>
            <div class="flex items-center justify-end gap-[16px]">
              <AppButton
                type="primary"
                class="uppercase font-[500]"
                size="small"
                @click="!isEmpty(user.id) ? (addReview = true) : router.push('?action=login')"
                >submit review</AppButton
              >

              <AppDropdown
                :menu="[
                  { text: 'my reviews', icon: IconLike },
                  { text: 'bookmarks', icon: IconBookmark },
                  { text: 'profile', icon: IconProfile },
                  'logout'
                ]"
                position="bottom"
                @action="handleAction"
                v-if="!isEmpty(user.id)"
              >
                <div class="flex items-center gap-[13px]">
                  <img
                    :src="user.img"
                    class="w-[40px] h-[40px] rounded-[8px] border-[2px] border-white dark:border-text"
                    v-if="user.img"
                  />
                  <img
                    src="@/assets/imgs/avataaars.png"
                    class="rounded-full w-[32px] h-[32px] border-[2px] border-white dark:border-text"
                    v-else
                  />
                </div>
              </AppDropdown>
              <AppButton
                type="outline"
                size="small"
                class="font-[700] uppercase"
                @click="router.push('?action=login')"
                v-else
              >
                Login
              </AppButton>
            </div>
          </div>
        </header>

        <div
          class="pt-4 md:py-[16px] flex justify-between items-start md:items-center w-[90vw] relative"
        >
          <div class="pb-2 flex gap-[10px] scrollbar overflow-auto" ref="scroller">
            <div
              class="text-center text-[14px] py-[6px] px-[12px] border-[1.5px] text-[#14161A] border-[#B2C1E6] dark:border-[#383B43] dark:text-[#FBFCFE] bg-transparent rounded-[4px] cursor-pointer hover:opacity-75"
              :class="{
                '!bg-[#14161A] !border-[#B2C1E6] text-[#E5EDF5] dark:!bg-[#FBFCFE] dark:!border-[#383B43] dark:!text-[#212327]':
                  filter === null
              }"
              @click="filter = null"
            >
              All
            </div>
            <div
              class="flex-shrink-0 text-center text-[14px] py-[6px] px-[12px] border-[1.5px] text-[#14161A] border-[#B2C1E6] dark:border-[#383B43] dark:text-[#FBFCFE] bg-transparent rounded-[4px] cursor-pointer hover:opacity-75"
              :class="{
                '!bg-[#14161A] !border-[#B2C1E6] text-[#E5EDF5] dark:!bg-[#FBFCFE] dark:!border-[#383B43] dark:!text-[#212327]':
                  filter === item
              }"
              v-for="(i, item) in counter"
              @click="filter === item ? (filter = null) : (filter = item)"
              :key="item"
            >
              {{ item }} &nbsp; {{ i }}
            </div>
          </div>
          <div
            class="mt-1 py-[6px] px-[9px] rounded-full bg-white dark:bg-black-light cursor-pointer hover:opacity-75 flex items-center justify-center"
            @click="scroll()"
          >
            <svg
              width="8"
              height="14"
              viewBox="0 0 8 14"
              fill="none"
              class="stroke-black dark:stroke-text-dark"
            >
              <path
                d="M1 13L7 7L1 1"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="pt-[120px] md:pt-[140px]"></div>
    <div class="w-full p-5 md:w-page md:px-0">
      <h1 class="text-[24px] capitalize">All Reviews</h1>
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
            <div class="" v-if="_review.length !== 0">
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
  <AddReviewModal v-if="addReview" @close="addReview = false" />
</template>
