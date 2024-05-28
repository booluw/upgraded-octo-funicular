<script lang="ts" setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { supabase } from '@/config/supabase'
import { formatDate } from '@/utils/functions'
import { notify } from '@/components/AppNotification'

import IconArea from '@/components/icons/IconArea.vue'
import IconReviews from '@/components/icons/IconReviews.vue'
import IconUser from '@/components/icons/IconUser.vue'
import AppLoader from '@/components/AppLoader.vue'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AppError from '@/components/AppError.vue'
import AppTable from '@/components/AppTable/Index.vue'
import AppPagination from '@/components/AppPagination.vue'

const loading = ref(false)
const reviewLoading = ref(false)
const err = ref(false)
const query = ref('')

const area = ref(0)
const users = ref(0)
const reviews = reactive({
  count: 0,
  currentPage: 0,
  itemsPerPage: 20,
  items: [] as any
})

const review = computed(() => {
  if (reviews.items.length === 0) return []

  return reviews.items.map((item: any) => {
    item.created_at = formatDate(item.created_at)
    item.area_name = item.area.name
    item.user_name = item.profile.username.replace(/"/g, '')
    item.short_text = item.review.slice(0, 20)
    item.short_text += '...'

    return item
  })
})

const goToPage = async function (pageNumber: number) {
  reviews.currentPage = pageNumber
  getReviews()
}

const fetchAreaCount = async function () {
  try {
    const { count, error } = await supabase.from('areas').select('', { count: 'exact', head: true })
    if (error as any) throw Error(error.message as any)
    area.value = count as number
  } catch (error) {
    err.value = true
    console.log(error)
  }
}

const fetchUserCount = async function () {
  try {
    const { count, error } = await supabase
      .from('profile')
      .select('', { count: 'exact', head: true })
    if (error as any) throw Error(error.message as any)
    users.value = count as number
  } catch (error) {
    err.value = true
    console.log(error)
  }
}

const fetchReviews = async function () {
  try {
    const { count, error } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
    if (error as any) throw Error(error.message as any)
    reviews.count = count as number
    // reviews.items = data as any
  } catch (error) {
    err.value = true
    console.log(error)
  }
}

const getReviews = async function () {
  loading.value = true
  err.value = false

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profile(*), area(*)')
      .order('created_at', { ascending: false })
      .range(
        reviews.currentPage === 0 ? 0 : reviews.currentPage * reviews.itemsPerPage,
        reviews.itemsPerPage + reviews.currentPage * reviews.itemsPerPage
      )
      .limit(reviews.itemsPerPage)

    if (error) throw Error(error.message ?? error)
    reviews.items = data
  } catch (err) {
    console.log(err)
    error.value = true
  }

  loading.value = false
}

const searchReview = async function () {
  reviewLoading.value = true

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select('*, areas(*), profile(*)')
      .textSearch('areas.name', `%${query.value}%`, {
        type: 'websearch',
        config: 'english'
      })

    if (error) throw Error(error.message)

    reviews.items = data
  } catch (error) {
    console.log(error)
  }

  reviewLoading.value = false
}


const action = async function (option: { action: 'approve' | 'decline' | 'delete'; data: any }) {
  try {
    loading.value = true

    switch (option.action) {
      case 'approve':
        await supabase.from('reviews').update({ approved: 'APPROVED' }).eq('id', option.data.id)
        notify({ content: 'Review approved', type: 'success', position: 'top-center' })
        break

      case 'decline':
        await supabase.from('reviews').update({ approved: 'DECLINED' }).eq('id', option.data.id)
        notify({ content: 'Review declinded', type: 'success', position: 'top-center' })
        break

      case 'delete':
        await supabase.from('reviews').delete().eq('id', option.data.id)
        notify({ content: 'Review deleted', type: 'success', position: 'top-center' })
        break
    }

    await getReviews()
  } catch (error) {
    console.log(error)
    notify({
      content: error ?? 'An Error occurred, try again',
      type: 'error',
      position: 'top-center'
    })
  }

  loading.value = false
}

onMounted(async () => {
  loading.value = true
  await fetchAreaCount()
  await fetchUserCount()
  await fetchReviews()
  await getReviews()
  loading.value = false
})
</script>
<template>
  <section
    class="h-full flex items-center justify-center bg-transparent text-primary"
    v-if="loading"
  >
    <AppLoader />
  </section>
  <AppError v-else-if="err" />
  <section class="" v-else>
    <div class="flex items-center justify-between">
      <h1 class="text-icon dark:text-primary-light font-[600] text-2xl">Admin Dashboard</h1>
      <div class="">{{ formatDate(Date()) }}</div>
    </div>
    <div class="flex justify-between gap-5 my-10">
      <div class="border border-l-[6px] border-primary bg-primary-light rounded w-1/3 p-5">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-black text-primary-light rounded-full">
            <IconArea />
          </div>
          <h3 class="text-black uppercase text-2xl">areas</h3>
        </div>
        <div class="text-5xl flex justify-end font-[500] text-black">
          {{ area }}
        </div>
      </div>

      <div class="border border-l-[6px] border-black bg-primary-light rounded w-1/3 p-5">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-black text-primary-light rounded-full">
            <IconReviews />
          </div>
          <h3 class="text-black uppercase text-2xl">reviews</h3>
        </div>
        <div class="text-5xl flex justify-end font-[500] text-black">
          {{ reviews.count }}
        </div>
      </div>

      <div class="border border-l-[6px] border-[#52BD94] bg-primary-light rounded w-1/3 p-5">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-black text-primary-light rounded-full">
            <IconUser />
          </div>
          <h3 class="text-black uppercase text-2xl">users</h3>
        </div>
        <div class="text-5xl flex justify-end font-[500] text-black">
          {{ users }}
        </div>
      </div>
    </div>
    <div class="h-[50vh] flex items-center justify-center" v-if="reviewLoading">
      <AppLoader />
    </div>
    <template v-else>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-[500]">Recent Reviews</h2>
        <form class="flex items-center gap-[5px]" @submit.prevent="searchReview()">
          <AppInput v-model="query" type="search" placeholder="User Name" size="small" required>
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
          <AppButton type="outline" mode="submit" size="small" class="uppercase">Search</AppButton>
        </form>
      </div>
      <AppTable
        :columns="[
          { title: 'Date Created', field: 'created_at', status: false },
          { title: 'Area', field: 'area_name', status: false },
          { title: 'Name', field: 'user_name', status: false },
          { title: 'Review', field: 'short_text', status: false },
          { title: 'Views', field: 'views', status: false },
          { title: 'Status', field: 'approved', status: true }
        ]"
        :data="review"
        :actions="['approve', 'decline', 'delete']"
        @on="action"
      />
      <AppPagination
        :totalItems="reviews.count"
        :currentPage="reviews.currentPage"
        :itemsPerPage="reviews.itemsPerPage"
        @next="goToPage"
      />
    </template>
  </section>
</template>
