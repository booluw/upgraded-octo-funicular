<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isEmpty } from 'lodash'
import { supabase } from '@/config/supabase'
import { formatDate } from '@/utils/functions'

import { notify } from '@/components/AppNotification'

import AppLoader from '@/components/AppLoader.vue'
import AppError from '@/components/AppError.vue'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AppTable from '@/components/AppTable/Index.vue'
import AppPagination from '@/components/AppPagination.vue'

import AddNewReview from './components/AddNewReview.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref(false)
const query = ref('')
const review = reactive({ items: [] as any[], count: 0, currentPage: 0, itemsPerPage: 20 })

const reviews = computed(() => {
  if (review.items.length === 0) return []

  return review.items.map((item) => {
    item.created_at = formatDate(item.created_at)
    item.area_name = item.area.name
    item.user_name = item.profile.username.replace(/"/g, '')
    item.short_text = item.review.slice(0, 30)
    item.short_text += '...'

    return item
  })
})

const goToPage = async function (pageNumber: number) {
  review.currentPage = pageNumber
  getReviews()
}

const fetchReviews = async function () {
  try {
    const { count, error } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
    if (error as any) throw Error(error.message as any)
    review.count = count as number
    // reviews.items = data as any
  } catch (err) {
    error.value = true
    console.log(err)
  }
}

const getReviews = async function () {
  loading.value = true
  error.value = false

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profile(*), area(*)')
      .order('created_at', { ascending: false })
      .range(
        review.currentPage === 0 ? 0 : review.currentPage * review.itemsPerPage,
        review.itemsPerPage + review.currentPage * review.itemsPerPage
      )
      .limit(review.itemsPerPage)

    if (error) throw Error(error.message ?? error)
    review.items = data
  } catch (err) {
    console.log(err)
    error.value = true
  }

  loading.value = false
}

const searchReview = async function () {
  loading.value = true

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select('*, area!inner(*), profile!inner(*)')
      .like('area.id', `%${query.value.toLowerCase()}%`)

    if (error) throw Error(error.message)

    console.log(data)
    review.items = data
  } catch (error) {
    console.log(error)
  }

  loading.value = false
}

const savedReview = function () {
  router.push(route.path)
  getReviews()
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
  } catch (err) {
    console.log(err)
    notify({
      content: err ?? 'An Error occurred, try again',
      type: 'error',
      position: 'top-center'
    })
  }

  loading.value = false
}

onMounted(() => {
  fetchReviews()
  getReviews()
})

// watch(query, () => {
//   searchReview()
// })
</script>
<template>
  <AppError v-if="error" />
  <section class="" v-else>
    <section class="" v-if="isEmpty(route.query)">
      <section class="" v-if="isEmpty(route.query)">
        <div class="flex items-center justify-between">
          <h1 class="text-icon dark:text-primary-light font-[600] text-2xl">All Reviews Created</h1>
          <div class="flex items-center gap-[20px]">
            <AppButton type="primary" size="small" @click="router.push('?action=add')">
              CREATE REVIEW
            </AppButton>
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
              <AppButton type="outline" mode="submit" size="small"
                >Search</AppButton
              >
            </form>
          </div>
        </div>

        <section class="h-[50vh] flex items-center justify-center text-primary" v-if="loading">
          <AppLoader />
        </section>
        <template v-else>
          <AppTable
            :columns="[
              { title: 'Date Created', field: 'created_at', status: false },
              { title: 'Areas', field: 'area_name', status: false },
              { title: 'Name', field: 'user_name', status: false },
              { title: 'Review', field: 'short_text', status: false },
              { title: 'Views', field: 'views', status: false },
              { title: 'Status', field: 'approved', status: true }
            ]"
            :data="reviews"
            :actions="['approve', 'decline', 'delete']"
            @on="action"
          />

          <AppPagination
            :totalItems="review.count"
            :currentPage="review.currentPage"
            :itemsPerPage="review.itemsPerPage"
            @next="goToPage"
          />
        </template>
      </section>
    </section>
    <section class="flex justify-center" v-else-if="route.query.action === 'add'">
      <AddNewReview @close="router.push(route.path)" @done="savedReview()" />
    </section>
  </section>
</template>
