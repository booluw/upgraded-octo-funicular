<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { supabase } from '@/config/supabase'
import { formatDate } from '@/utils/functions'

import AppLoader from '@/components/AppLoader.vue'
import AppError from '@/components/AppError.vue'
import AppPagination from '@/components/AppPagination.vue'
import AppTable from '@/components/AppTable/Index.vue'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'

const error = ref(false)
const loading = ref(false)
const query = ref('')

const profiles = reactive({
  items: [] as any[],
  currentPage: 0,
  itemsPerPage: 20,
  count: 0 as number | null
})

const users = computed(() => {
  if (profiles.items.length === 0) return []

  return profiles.items.map((user) => {
    user.date = formatDate(user.created_at)
    user.username = user.username.replace(/"/g, '')
    user.fullname = `${user.firstName ?? 'Not'} ${user.lastName ?? 'Available'}`

    return user
  })
})

const goToPage = async function (pageNumber: number) {
  profiles.currentPage = pageNumber
  getAllProfiles()
}

const action = async function (profile: any) {
  loading.value = true

  try {
    const { error } = await supabase.from('profile').update({ role: 'ADMIN' }).eq('id', profile.data.id)
    
    if (error) throw Error(error.message)

    await getAllProfiles()
  } catch (err) {
    console.log(err)
    error.value = true
  }

  loading.value = false
}

const getAllProfiles = async function () {
  loading.value = true
  error.value = false

  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .order('created_at', { ascending: false })
      .range(
        profiles.currentPage === 0 ? 0 : profiles.currentPage * profiles.itemsPerPage,
        profiles.itemsPerPage + profiles.currentPage * profiles.itemsPerPage
      )
      .limit(profiles.itemsPerPage)

    if (error) throw Error(error.message)
    const { count } = await supabase.from('profile').select('*', { count: 'exact', head: true })

    profiles.items = data
    profiles.count = count
  } catch (err) {
    error.value = true
    console.log(err)
  }

  loading.value = false
}

const searchProfile = async function () {
  loading.value = true
  error.value = false

  try {
    const { data, error, count } = await supabase
      .from('profile')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .like('email', `%${query.value}%`)

    if (error) throw Error(error.message)

    profiles.count = count
    profiles.items = data
  } catch (err) {
    console.log(err)
    error.value = true
  }

  loading.value = false
}

onMounted(() => {
  getAllProfiles()
})
</script>
<template>
  <AppError v-if="error" />
  <section class="flex items-center justify-center h-screen" v-else-if="loading">
    <AppLoader />
  </section>
  <section class="" v-else>
    <div class="flex items-center justify-between">
      <h1 class="text-icon dark:text-primary-light font-[600] text-2xl">All Users</h1>
      <div class="flex items-center gap-[20px]">
        <form class="flex items-center gap-[5px]" @submit.prevent="searchProfile()">
          <AppInput v-model="query" type="search" placeholder="User email" size="small" required>
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
    </div>
    <AppTable
      :columns="[
        { title: 'Date Joined', field: 'date', status: false },
        { title: 'Full Name', field: 'fullname', status: false },
        { title: 'Email', field: 'email', status: false },
        { title: 'Phone Number', field: 'phone_number', status: false },
        { title: 'Role', field: 'role', status: false }
      ]"
      :data="users"
      :actions="['make admin']"
      @on="action"
    />
    <AppPagination
      :totalItems="profiles.count!"
      :currentPage="profiles.currentPage"
      :itemsPerPage="profiles.itemsPerPage"
      @next="goToPage"
    />
  </section>
</template>
