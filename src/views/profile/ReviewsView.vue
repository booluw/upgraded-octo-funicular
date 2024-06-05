<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { isEmpty } from 'lodash'
import { supabase } from '@/config/supabase'

import { useUser } from '@/stores/user'
import { notify } from '@/components/AppNotification'
import { formatDate } from '@/utils/functions'

import AppConfirm from '@/components/AppConfirm.vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import AppLoader from '@/components/AppLoader.vue'

import EditReview from './components/EditReview.vue'

const user = useUser().user

const loading = ref(false)
const error = ref(false)

const query = ref('')
const reviews = ref([])
const toDelete = ref({})
const toEdit = ref({})

const showNotification = function () {
  notify({ content: 'You cannot edit an already approved review', position: 'top-center', type: 'warning' })
}

const getReviews = async function () {
  loading.value = true
  error.value = false
  toEdit.value = {}

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profile!inner(*), areas(*)')
      .eq('profile.id', `${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw Error(error.message)

    reviews.value = data as unknown as any
  } catch (err) {
    console.log(err)
    notify({ content: err, position: 'top-center', type: 'error' })
  }

  loading.value = false
}

const deleteReview = async function () {
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', toDelete.value.id)

    if (error) throw Error(error.message)

    toDelete.value = {}
    notify({ content: 'Review Deleted', position: 'top-center', type: 'success' })
    getReviews()
  } catch (err) {
    console.log(err)
    notify({ content: err, position: 'top-center', type: 'top-center' })
  }
}

const searchReview = async function () {
  loading.value = true
  error.value = false

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profile!inner(*), areas!inner(*)')
      .like('areas.name', `%${query.value}%`)
      .eq('profile.id', `${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw Error(error.message)
    reviews.value = data as unknown as any
    
  } catch (err) {
    console.log(err)
    notify({ content: err, type: 'error', position: 'top-center' })
  }

  loading.value = false
}

onMounted(() => {
  getReviews()
})
</script>
<template>
  <section class="md:w-2/3">
    <h1 class="text-icon dark:text-primary-light font-[600] text-2xl">All Reviews Created</h1>

    <div class="my-10">
      <form class="flex flex-col md:flex-row md:gap-5" @submit.prevent="searchReview()">
        <AppInput
          type="search"
          size="small"
          class="w-full"
          placeholder="Enter area name"
          v-model="query"
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
        <AppButton type="primary" size="small" class="!px-14">Search</AppButton>
      </form>
    </div>

    <div class="h-full w-full flex items-center justify-center" v-if="loading">
      <AppLoader />
    </div>
    <div class="h-[70vh] overflow-auto scrollbar md:pr-5" v-else-if="reviews.length !== 0">
      <div
        class="mb-5 pb-3 border-b dark:border-black"
        v-for="(review, index) in reviews"
        :key="index"
      >
        <div class="flex md:justify-between">
          <div class="w-full">
            <div class="flex items-center justify-between md:justify-start gap-5">
              <h3 class="font-semibold text-xl capitalize">{{ review.areas!.name }}</h3>
              <div class="flex gap-1 items-center text-sm">
                <svg
                  class="w-[18px] h-[18px]"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6 0L7.875 3.975L12 4.575L9 7.65L9.675 12L6 9.975L2.325 12L3 7.65L0 4.575L4.125 3.975L6 0Z"
                    fill="#FABB07"
                  />
                </svg>

                {{ review.rating }}.0
              </div>
            </div>
            <div class="flex items-center justify-between md:justify-start gap-10 w-full">
              <p class="opacity-75">{{ formatDate(review.created_at!) }}</p>
              <div
                class="text-[10px] inline-block border dark:border-black p-1 rounded-sm"
                :class="review.approved === 'APPROVED' ? 'text-green-500' : 'text-orange-500'"
              >
                {{ review.approved }}
              </div>
            </div>
          </div>
          <div class="hidden md:flex items-center gap-4">
            <button
              class="border border-primary p-2 group hover:bg-primary opacity-65 hover:opacity-100"
              @click="review.approved === 'APPROVED' ? showNotification() : toEdit = review"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2.46163 10.5942L5.15197 13.417L12.4388 5.77133L9.75931 2.93704L2.46163 10.5942ZM0 16.0001L4.20433 14.4115L1.52489 11.6229L0 16.0001ZM13.343 0C12.8202 0 12.3409 0.228571 11.9924 0.582857L10.4239 2.22857L13.1143 5.05143L14.6827 3.40571C15.0313 3.04 15.2382 2.54857 15.2382 1.98857C15.2491 0.902857 14.3995 0 13.343 0Z"
                  class="fill-[#3366FF] group-hover:fill-white"
                />
              </svg>
            </button>
            <button
              class="border border-[#D14343] p-2 group hover:bg-[#D14343] opacity-65 hover:opacity-100"
              @click="toDelete = review"
            >
              <svg
                width="15"
                height="16"
                viewBox="0 0 15 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M14.026 4H0.51948C0.228571 4 0 4.22 0 4.5C0 4.78 0.228571 5 0.51948 5H1.03896V15C1.03896 15.55 1.50649 16 2.07792 16H12.4675C13.039 16 13.5065 15.55 13.5065 15V5H14.026C14.3169 5 14.5455 4.78 14.5455 4.5C14.5455 4.22 14.3169 4 14.026 4ZM5.19488 13C5.19488 13.55 4.72735 14 4.15592 14C3.58449 14 3.11696 13.55 3.11696 13V7C3.11696 6.45 3.58449 6 4.15592 6C4.72735 6 5.19488 6.45 5.19488 7V13ZM8.31184 13C8.31184 13.55 7.84431 14 7.27288 14C6.70145 14 6.23392 13.55 6.23392 13V7C6.23392 6.45 6.70145 6 7.27288 6C7.84431 6 8.31184 6.45 8.31184 7V13ZM11.4286 13C11.4286 13.55 10.961 14 10.3896 14C9.81818 14 9.35064 13.55 9.35064 13V7C9.35064 6.45 9.81818 6 10.3896 6C10.961 6 11.4286 6.45 11.4286 7V13ZM13.5065 1H9.35065C9.35065 0.45 8.88312 0 8.31169 0H6.23377C5.66234 0 5.19481 0.45 5.19481 1H1.03896C0.467532 1 0 1.45 0 2V3H14.5455V2C14.5455 1.45 14.0779 1 13.5065 1Z"
                  class="fill-[#D14343] group-hover:fill-white"
                />
              </svg>
            </button>
          </div>
        </div>
        <p class="pt-3">{{ review.review! }}</p>
        
          <div class="flex items-center gap-4 md:hidden">
            <button
              class="border border-primary p-2 group hover:bg-primary opacity-65 hover:opacity-100"
              @click="review.approved === 'APPROVED' ? showNotification() : toEdit = review"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2.46163 10.5942L5.15197 13.417L12.4388 5.77133L9.75931 2.93704L2.46163 10.5942ZM0 16.0001L4.20433 14.4115L1.52489 11.6229L0 16.0001ZM13.343 0C12.8202 0 12.3409 0.228571 11.9924 0.582857L10.4239 2.22857L13.1143 5.05143L14.6827 3.40571C15.0313 3.04 15.2382 2.54857 15.2382 1.98857C15.2491 0.902857 14.3995 0 13.343 0Z"
                  class="fill-[#3366FF] group-hover:fill-white"
                />
              </svg>
            </button>
            <button
              class="border border-[#D14343] p-2 group hover:bg-[#D14343] opacity-65 hover:opacity-100"
              @click="toDelete = review"
            >
              <svg
                width="15"
                height="16"
                viewBox="0 0 15 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M14.026 4H0.51948C0.228571 4 0 4.22 0 4.5C0 4.78 0.228571 5 0.51948 5H1.03896V15C1.03896 15.55 1.50649 16 2.07792 16H12.4675C13.039 16 13.5065 15.55 13.5065 15V5H14.026C14.3169 5 14.5455 4.78 14.5455 4.5C14.5455 4.22 14.3169 4 14.026 4ZM5.19488 13C5.19488 13.55 4.72735 14 4.15592 14C3.58449 14 3.11696 13.55 3.11696 13V7C3.11696 6.45 3.58449 6 4.15592 6C4.72735 6 5.19488 6.45 5.19488 7V13ZM8.31184 13C8.31184 13.55 7.84431 14 7.27288 14C6.70145 14 6.23392 13.55 6.23392 13V7C6.23392 6.45 6.70145 6 7.27288 6C7.84431 6 8.31184 6.45 8.31184 7V13ZM11.4286 13C11.4286 13.55 10.961 14 10.3896 14C9.81818 14 9.35064 13.55 9.35064 13V7C9.35064 6.45 9.81818 6 10.3896 6C10.961 6 11.4286 6.45 11.4286 7V13ZM13.5065 1H9.35065C9.35065 0.45 8.88312 0 8.31169 0H6.23377C5.66234 0 5.19481 0.45 5.19481 1H1.03896C0.467532 1 0 1.45 0 2V3H14.5455V2C14.5455 1.45 14.0779 1 13.5065 1Z"
                  class="fill-[#D14343] group-hover:fill-white"
                />
              </svg>
            </button>
          </div>
      </div>
    </div>
    <div class="text-xl opacity-75" v-else>You have not added any review yet</div>
  </section>

  <AppConfirm
    :text="`Delete your review about '${toDelete.areas.name.toUpperCase()}, ${toDelete.areas.state}'`"
    heading="Delete Reviews?"
    confirm-button-text="Delete Review"
    type="error"
    @close="toDelete = {}"
    v-if="!isEmpty(toDelete)"
    @done="deleteReview"
  />

  <EditReview v-if="!isEmpty(toEdit)" :data="toEdit" @close="toEdit = {}" @done="getReviews()" />
</template>
