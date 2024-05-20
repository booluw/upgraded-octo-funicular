<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isEmpty } from 'lodash'
import { supabase } from '@/config/supabase'
import { formatDate } from '@/utils/functions'

import AppLoader from '@/components/AppLoader.vue'
import AppError from '@/components/AppError.vue'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AppPagination from '@/components/AppPagination.vue'

import AppTable from '@/components/AppTable/Index.vue'
import AddNewArea from './components/AddNewArea.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref(false)
const area = reactive({
  items: [] as any[],
  currentPage: 0,
  itemsPerPage: 20,
  count: 0 as number | null
})

const query = ref('')

const areas = computed(() => {
  if (area.items.length === 0) return []
  return area.items.map((item) => {
    item.area_created_at = formatDate(item.area_created_at)

    return item
  })
})

const goToPage = async function (pageNumber: number) {
  area.currentPage = pageNumber
  getAllAreas()
}

const savedArea = function () {
  router.push(route.path)
  getAllAreas()
}

const action = function (e) {
  if (e.action === 'view') {
    router.push(`/admin/areas/${e.data.area_id}`)
  }
}

const searchArea = async function () {
  error.value = false
  loading.value = true
  try {
    const { data, error } = await supabase
      .rpc('search_areas', { search_name: query.value })
      .order('area_created_at', { ascending: false })

    const { count } = await supabase.from('areas').select('*', { count: 'exact', head: true })

    if (error) throw Error(error as any)
    area.items = data
    area.count = count
  } catch (err) {
    console.log(err)
    error.value = true
  }
  loading.value = false
}

const getAllAreas = async function () {
  error.value = false
  loading.value = true
  try {
    const { data, error } = await supabase
      .rpc('get_areas_with_review_count')
      .order('area_created_at', { ascending: false })
      .range(
        area.currentPage === 0 ? 0 : area.currentPage * area.itemsPerPage,
        area.itemsPerPage + area.currentPage * area.itemsPerPage
      )
      .limit(area.itemsPerPage)

    const { count } = await supabase.from('areas').select('*', { count: 'exact', head: true })

    if (error) throw Error(error as any)
    area.items = data
    area.count = count
  } catch (err) {
    console.log(err)
    error.value = true
  }

  loading.value = false
}

onMounted(() => {
  getAllAreas()
})

watch(query, () => {
  searchArea()
})
</script>
<template>
  <AppError v-if="error" />
  <section class="" v-else>
    <section class="" v-if="isEmpty(route.query)">
      <div class="flex items-center justify-between">
        <h1 class="text-icon dark:text-primary-light font-[600] text-2xl">All Areas Created</h1>
        <div class="flex items-center gap-[20px]">
          <AppButton type="primary" size="small" @click="router.push('?action=add')">
            CREATE AREA
          </AppButton>
          <form class="flex items-center gap-[5px]" @submit.prevent="searchArea()">
            <AppInput v-model="query" type="search" placeholder="Area Name" size="small" required>
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
            <AppButton type="outline" mode="submit" size="small" class="uppercase"
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
            { title: 'Date Created', field: 'area_created_at', status: false },
            { title: 'Areas', field: 'area_name', status: false },
            { title: 'Views', field: 'area_views', status: false },
            { title: 'Reviews', field: 'review_count', status: false }
          ]"
          :data="areas"
          :actions="['view']"
          @on="action"
        />
        <AppPagination
          :totalItems="area.count!"
          :currentPage="area.currentPage"
          :itemsPerPage="area.itemsPerPage"
          @next="goToPage"
        />
      </template>
    </section>
    <section class="flex justify-center" v-else-if="route.query.action === 'add'">
      <AddNewArea @back="router.push(route.path)" @done="savedArea()" />
    </section>
    <section class="" v-else-if="route.query.action === 'edit'"></section>
  </section>
  <section class=""></section>
</template>
