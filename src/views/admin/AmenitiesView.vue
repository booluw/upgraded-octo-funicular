<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'
import { formatDate } from '@/utils/functions'

import AppLoader from '@/components/AppLoader.vue'
import AppError from '@/components/AppError.vue'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AppPagination from '@/components/AppPagination.vue'
import AppTable from '@/components/AppTable/Index.vue'

import AddNewAmenity from './components/AddNewAmenity.vue'
import EditAmenity from './components/EditAmenity.vue'

const route = useRoute()
const router = useRouter()

const error = ref(false)
const loading = ref(false)

const query = ref('')
const amenity = reactive({
  currentPage: 0,
  itemsPerPage: 20,
  count: 0 as number | null,
  items: [] as any[]
})

const amenities = computed(() => {
  if (amenity.items.length === 0) return []

  return amenity.items.map((item) => {
    item.created_at = formatDate(item.created_at)
    item.category = item.category[0]
    return item
  })
})

const action = function (e: any) {
  if (e.action === 'edit') {
    router.push(`?action=edit&id=${e.data.id}`)
  }
}

const amenityAdded = function () {
  router.go(-1)
  getAllAmenities()
}

const getAllAmenities = async function () {
  error.value = false
  loading.value = true

  try {
    const { data, error } = await supabase
      .rpc('get_amenities_with_review_count')
      .order('created_at', { ascending: false })
      .range(
        amenity.currentPage === 0 ? 0 : amenity.currentPage * amenity.itemsPerPage,
        amenity.itemsPerPage + amenity.currentPage * amenity.itemsPerPage
      )
      .limit(amenity.itemsPerPage)

    const { count } = await supabase.from('amenities').select('', { count: 'exact', head: true })
    if (error) throw Error(error.message as any)

    amenity.items = data
    amenity.count = count
  } catch (err) {
    console.log(err)
    error.value = true
  }

  loading.value = false
}

const searchAmenity = async function () {
  error.value = false
  loading.value = true

  try {
    const { data, error } = await supabase
      .rpc('search_amenities', { search_text: query.value })
      .order('created_at', { ascending: false })

    if (error) throw Error(error.message as any)

    amenity.items = data
  } catch (err) {
    console.log(err)
    error.value = true
  }

  loading.value = false
}

onMounted(() => {
  getAllAmenities()
})

watch(query, () => {
  searchAmenity()
})
</script>
<template>
  <section class="">
    <AppError v-if="error" />
    <section class="" v-else>
      <section class="flex justify-center" v-if="route.query.action === 'add'">
        <AddNewAmenity @done="amenityAdded()" />
      </section>
      <section class="flex justify-center" v-else-if="route.query.action === 'edit'">
        <EditAmenity @done="amenityAdded()" />
      </section>
      <section class="" v-else>
        <div class="flex items-center justify-between">
          <h1 class="text-icon dark:text-primary-light font-[600] text-2xl">All Amenities</h1>
          <div class="flex items-center gap-[20px]">
            <AppButton type="primary" size="small" @click="router.push('?action=add')">
              CREATE AMENITY
            </AppButton>
            <form class="flex items-center gap-[5px]" @submit.prevent="searchAmenity()">
              <AppInput v-model="query" type="search" placeholder="Amenity" size="small" required>
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
              { title: 'Date Created', field: 'created_at', status: false },
              { title: 'Amenities', field: 'title', status: false },
              { title: 'Categories', field: 'category', status: false },
              { title: 'No of Reviews', field: 'review_count', status: false }
            ]"
            :data="amenities"
            :actions="['edit']"
            @on="action"
          />
          <AppPagination
            :totalItems="amenity.count!"
            :currentPage="amenity.currentPage"
            :itemsPerPage="amenity.itemsPerPage"
            @next="goToPage"
          />
        </template>
      </section>
    </section>
  </section>
</template>
