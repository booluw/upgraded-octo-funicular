<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue';
import { supabase } from '@/config/supabase';
import { formatDate } from '@/utils/functions'

import IconArea from '@/components/icons/IconArea.vue';
import IconReviews from '@/components/icons/IconReviews.vue';
import IconUser from '@/components/icons/IconUser.vue';
import AppLoader from '@/components/AppLoader.vue';
import AppButton from '@/components/AppButton.vue';
import AppError from '@/components/AppError.vue';

const loading = ref(false)
const err = ref(false)

const area = ref(0)
const users = ref(0)
const reviews = reactive({
  count: 0,
  items: []
})

const fetchAreaCount = async function () {
  try {
    const { count, error } = await supabase.from('areas').select('', { count: 'exact', head: true })
    if (error as any) throw Error(error as any)
    area.value = count as number
  } catch (error) {
    err.value = true
    console.log(error)
  }
}

const fetchUserCount = async function () {
  try {
    const { count, error } = await supabase.from('profile').select('', { count: 'exact', head: true })
    if (error as any) throw Error(error as any)
    users.value = count as number
  } catch (error) {
    err.value = true
    console.log(error)
  }
}

const fetchReviews = async function () {
  try {
    const { data, count, error } = await supabase.from('reviews').select('*', { count: 'exact', head: true })
    if (error as any) throw Error(error as any)
    reviews.count = count as number
    reviews.items = data as any
  } catch (error) {
    err.value = true
    console.log(error)
  }
}

onMounted(async () => {
  loading.value = true
  await fetchAreaCount()
  await fetchUserCount()
  await fetchReviews()
  loading.value = false
})

</script>
<template>
  <section class="h-full flex items-center justify-center bg-white" v-if="loading">
    <AppLoader />
  </section>
  <AppError v-else-if="err" />
  <section class="" v-else>
    <div class="flex items-center justify-between">
      <h1 class="text-icon font-[600] text-2xl">Admin Dashboard</h1>
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
        <div class="text-5xl flex justify-end font-[500]">
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
        <div class="text-5xl flex justify-end font-[500]">
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
        <div class="text-5xl flex justify-end font-[500]">
          {{ users }}
        </div>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-[500]">Recent Reviews</h2>
    </div>

    <div class="my-5">
      <div class="border border-primary-light flex">
        
      </div>
    </div>
  </section>
</template>