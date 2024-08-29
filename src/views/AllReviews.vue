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
import IconLock from '@/components/icons/IconLock.vue'

import AddReviewModal from '@/views/areas/components/AddReviewModal.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import AppSelect from '@/components/AppSelect.vue'

const router = useRouter()
const user = useUser().user
const userStore = useUser()
const addReview = ref(false)

const filterModal = ref(false)
const target = ref(null)

const loading = ref(false)
const reviewLoading = ref(false)
const error = ref(false)
const scroller = ref(null) as any

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

const menuItems = computed(() => {
  const response = [
    { text: 'my reviews', icon: IconLike },
    { text: 'bookmarks', icon: IconBookmark },
    { text: 'profile', icon: IconProfile },
    'logout'
  ]

  if (user.role === 'ADMIN') {
    response.unshift({
      icon: IconLock,
      text: 'dashboard'
    })
  }
  return response
})

const scroll = function () {
  scroller.value.scrollLeft += 430
}

const handleClick = function (review: any) {
  comments.value = review
}

const handleAction = async function (action: 'logout' | 'profile' | 'reviews'|'dashboard') {
  if (action === 'logout') {
    await supabase.auth.signOut()
    userStore.resetUser()
    router.push('/')
  } else if (action === 'profile') {
    router.push('/profile')
  } else if (action === 'dashboard') {
    router.push('/admin')
  } else {
    router.push('/profile/reviews')
  }
}

const getAllReviews = async function () {
  reviewLoading.value = true
  error.value = false

  console.log(params.value.rating)

  try {
    const query = params.value.rating ? `, rating.eq.${Number(params.value.rating)}` : ``

    const { data, error } = await supabase
      .rpc('get_reviews_and_profiles')
      .select('*')
      .or(`and(approved.eq.APPROVED${query})`)
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
                :menu="menuItems"
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

        <div class="pt-4 flex gap-10 justify-between md:justify-start items-start w-[90vw] relative">
          <div class="fixed bottom-5 right-0 left-0 z-[90] md:relative flex items-center md:mt-5">
            <div
              class="my-0 mx-auto !bg-primary-light dark:!bg-[#14161A] md:bg-transparent text-center text-[14px] px-6 py-3 md:py-[6px] md:px-[12px] border-[1.5px] text-[#14161A] border-[#B2C1E6] dark:border-[#383B43] dark:text-[#FBFCFE] rounded-[4px] cursor-pointer hover:opacity-75 flex items-center gap-3"
              :class="{
                '!bg-[#14161A] !border-[#B2C1E6] dark:!bg-[#FBFCFE] dark:!border-[#383B43]':
                  filterModal
              }"
              @click="filterModal = !filterModal"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.65834 9.47241e-05C4.45264 0.00331004 4.25663 0.0880026 4.11331 0.235585C3.96999 0.383167 3.89108 0.581581 3.8939 0.78728V1.43341C3.88004 1.51727 3.88004 1.60284 3.8939 1.6867V2.34042C3.89245 2.44332 3.91146 2.54549 3.94983 2.64098C3.9882 2.73648 4.04517 2.82339 4.11743 2.89667C4.18968 2.96996 4.27578 3.02815 4.37072 3.06787C4.46567 3.10759 4.56755 3.12805 4.67047 3.12805C4.77338 3.12805 4.87527 3.10759 4.97021 3.06787C5.06516 3.02815 5.15126 2.96996 5.22351 2.89667C5.29577 2.82339 5.35274 2.73648 5.39111 2.64098C5.42948 2.54549 5.44849 2.44332 5.44704 2.34042H13.2127C13.3156 2.34187 13.4178 2.32286 13.5133 2.28449C13.6088 2.24611 13.6957 2.18914 13.769 2.11689C13.8423 2.04463 13.9005 1.95853 13.9402 1.86359C13.9799 1.76865 14.0003 1.66676 14.0003 1.56385C14.0003 1.46093 13.9799 1.35905 13.9402 1.2641C13.9005 1.16916 13.8423 1.08306 13.769 1.01081C13.6957 0.938552 13.6088 0.881582 13.5133 0.843209C13.4178 0.804836 13.3156 0.785825 13.2127 0.78728H5.44704C5.44846 0.683383 5.42902 0.580258 5.38987 0.48401C5.35072 0.387761 5.29265 0.300348 5.21911 0.226946C5.14556 0.153544 5.05804 0.0956454 4.96172 0.0566794C4.86539 0.0177133 4.76223 -0.001528 4.65834 9.47241e-05ZM0.787628 0.78728C0.684724 0.785825 0.582556 0.804836 0.487063 0.843209C0.39157 0.881582 0.304655 0.938552 0.231371 1.01081C0.158086 1.08306 0.0998934 1.16916 0.0601737 1.2641C0.0204541 1.35905 0 1.46093 0 1.56385C0 1.66676 0.0204541 1.76865 0.0601737 1.86359C0.0998934 1.95853 0.158086 2.04463 0.231371 2.11689C0.304655 2.18914 0.39157 2.24611 0.487063 2.28449C0.582556 2.32286 0.684724 2.34187 0.787628 2.34042H1.59756C1.70047 2.34187 1.80264 2.32286 1.89813 2.28449C1.99362 2.24611 2.08054 2.18914 2.15382 2.11689C2.22711 2.04463 2.2853 1.95853 2.32502 1.86359C2.36474 1.76865 2.38519 1.66676 2.38519 1.56385C2.38519 1.46093 2.36474 1.35905 2.32502 1.2641C2.2853 1.16916 2.22711 1.08306 2.15382 1.01081C2.08054 0.938552 1.99362 0.881582 1.89813 0.843209C1.80264 0.804836 1.70047 0.785825 1.59756 0.78728H0.787628ZM10.8709 5.43607C10.6652 5.43929 10.4692 5.52398 10.3259 5.67156C10.1825 5.81914 10.1036 6.01756 10.1064 6.22326V6.86939C10.0926 6.95325 10.0926 7.03882 10.1064 7.12268V7.77639C10.105 7.8793 10.124 7.98147 10.1624 8.07696C10.2007 8.17245 10.2577 8.25937 10.33 8.33265C10.4022 8.40594 10.4883 8.46413 10.5833 8.50385C10.6782 8.54357 10.7801 8.56402 10.883 8.56402C10.9859 8.56402 11.0878 8.54357 11.1828 8.50385C11.2777 8.46413 11.3638 8.40594 11.4361 8.33265C11.5083 8.25937 11.5653 8.17245 11.6037 8.07696C11.642 7.98147 11.661 7.8793 11.6596 7.77639H13.2127C13.3156 7.77785 13.4178 7.75884 13.5133 7.72047C13.6088 7.68209 13.6957 7.62512 13.769 7.55287C13.8423 7.48061 13.9005 7.39451 13.9402 7.29957C13.9799 7.20463 14.0003 7.10274 14.0003 6.99983C14.0003 6.89691 13.9799 6.79502 13.9402 6.70008C13.9005 6.60514 13.8423 6.51904 13.769 6.44678C13.6957 6.37453 13.6088 6.31756 13.5133 6.27919C13.4178 6.24081 13.3156 6.2218 13.2127 6.22326H11.6596C11.661 6.11936 11.6416 6.01624 11.6024 5.91999C11.5633 5.82374 11.5052 5.73633 11.4317 5.66292C11.3581 5.58952 11.2706 5.53162 11.1743 5.49266C11.0779 5.45369 10.9748 5.43445 10.8709 5.43607ZM0.787628 6.22326C0.684724 6.2218 0.582556 6.24081 0.487063 6.27919C0.39157 6.31756 0.304655 6.37453 0.231371 6.44678C0.158086 6.51904 0.0998934 6.60514 0.0601737 6.70008C0.0204541 6.79502 0 6.89691 0 6.99983C0 7.10274 0.0204541 7.20463 0.0601737 7.29957C0.0998934 7.39451 0.158086 7.48061 0.231371 7.55287C0.304655 7.62512 0.39157 7.68209 0.487063 7.72047C0.582556 7.75884 0.684724 7.77785 0.787628 7.77639H7.77674C7.87965 7.77785 7.98181 7.75884 8.07731 7.72047C8.1728 7.68209 8.25972 7.62512 8.333 7.55287C8.40628 7.48061 8.46448 7.39451 8.5042 7.29957C8.54392 7.20463 8.56437 7.10274 8.56437 6.99983C8.56437 6.89691 8.54392 6.79502 8.5042 6.70008C8.46448 6.60514 8.40628 6.51904 8.333 6.44678C8.25972 6.37453 8.1728 6.31756 8.07731 6.27919C7.98181 6.24081 7.87965 6.2218 7.77674 6.22326H0.787628ZM7.76461 10.8721C7.55892 10.8753 7.3629 10.96 7.21958 11.1075C7.07627 11.2551 6.99736 11.4535 7.00017 11.6592V12.3054C6.98631 12.3892 6.98631 12.4748 7.00017 12.5587V13.2124C6.99872 13.3153 7.01773 13.4174 7.0561 13.5129C7.09448 13.6084 7.15145 13.6953 7.2237 13.7686C7.29596 13.8419 7.38206 13.9001 7.477 13.9398C7.57194 13.9795 7.67383 14 7.77674 14C7.87966 14 7.98155 13.9795 8.07649 13.9398C8.17143 13.9001 8.25753 13.8419 8.32978 13.7686C8.40204 13.6953 8.45901 13.6084 8.49738 13.5129C8.53576 13.4174 8.55477 13.3153 8.55331 13.2124H13.2127C13.3156 13.2138 13.4178 13.1948 13.5133 13.1564C13.6088 13.1181 13.6957 13.0611 13.769 12.9888C13.8423 12.9166 13.9005 12.8305 13.9402 12.7355C13.9799 12.6406 14.0003 12.5387 14.0003 12.4358C14.0003 12.3329 13.9799 12.231 13.9402 12.1361C13.9005 12.0411 13.8423 11.955 13.769 11.8828C13.6957 11.8105 13.6088 11.7535 13.5133 11.7152C13.4178 11.6768 13.3156 11.6578 13.2127 11.6592H8.55331C8.55473 11.5553 8.53529 11.4522 8.49614 11.356C8.45699 11.2597 8.39892 11.1723 8.32538 11.0989C8.25184 11.0255 8.16431 10.9676 8.06799 10.9286C7.97167 10.8897 7.8685 10.8704 7.76461 10.8721ZM0.787628 11.6592C0.684724 11.6578 0.582556 11.6768 0.487063 11.7152C0.39157 11.7535 0.304655 11.8105 0.231371 11.8828C0.158086 11.955 0.0998934 12.0411 0.0601737 12.1361C0.0204541 12.231 0 12.3329 0 12.4358C0 12.5387 0.0204541 12.6406 0.0601737 12.7355C0.0998934 12.8305 0.158086 12.9166 0.231371 12.9888C0.304655 13.0611 0.39157 13.1181 0.487063 13.1564C0.582556 13.1948 0.684724 13.2138 0.787628 13.2124H4.67047C4.77337 13.2138 4.87554 13.1948 4.97103 13.1564C5.06653 13.1181 5.15344 13.0611 5.22673 12.9888C5.30001 12.9166 5.3582 12.8305 5.39792 12.7355C5.43764 12.6406 5.4581 12.5387 5.4581 12.4358C5.4581 12.3329 5.43764 12.231 5.39792 12.1361C5.3582 12.0411 5.30001 11.955 5.22673 11.8828C5.15344 11.8105 5.06653 11.7535 4.97103 11.7152C4.87554 11.6768 4.77337 11.6578 4.67047 11.6592H0.787628Z"
                  fill="currentColor"
                />
              </svg>

              Filter
            </div>
          </div>

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
