<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'
import { formatDate } from '@/utils/functions'
import { onClickOutside } from '@vueuse/core'
import { notify } from '@/components/AppNotification'

import AppLoader from '@/components/AppLoader.vue'
import AppButton from '@/components/AppButton.vue'

const emits = defineEmits(['done', 'close'])

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const area = ref({}) as any
const reviews = ref([]) as any
const target = ref(null)
onClickOutside(target, () => emits('close'))

const amenities = computed(() => {
  const result = {} as any
  if (reviews.value.length == 0) return {}

  reviews.value.forEach((review: any) => {
    review.amenities.forEach((amenity: any[]) => {
      result[amenity as unknown as string] = (result[amenity as unknown as string] || 0) + 1
    })
  })

  return result
})

const getArea = async function () {
  loading.value = true

  try {
    const { data, error } = await supabase.from('areas').select('*').eq('id', route.query.view)
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*')
      .eq('area', route.query.view)

    if (error) throw Error(error as any)
    if (reviewError) throw Error(reviewError as any)

    area.value = data[0]
    reviews.value = review
  } catch (error: any) {
    console.log(error)
    notify({ content: error, type: 'error', position: 'top-center' })
    router.push(route.path)
  }

  loading.value = false
}

onMounted(async () => {
  await getArea()
})
</script>
<template>
  <section
    class="fixed top-0 right-0 bottom-0 left-0 bg-[#FBFCFE]/50 dark:bg-black/50 flex justify-center items-center backdrop-blur"
  >
    <div
      class="mx-5 w-full md:mx-0 md:!w-[500px] rounded-[6px] p-[24px] bg-[#FBFCFE] dark:bg-black text-black dark:text-text-dark overflow-x-auto"
      ref="target"
    >
      <div class="flex justify-center items-center" v-if="loading">
        <AppLoader />
      </div>
      <template v-else>
        <div class="flex justify-between items-center">
          <div class="flex items-end gap-3">
            <h2 class="capitalize text-2xl">{{ area.name }}, {{ area.state }}</h2>
            <h3 class="text-sm">({{ area.lga }})</h3>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="cursor-pointer"
            @click="emits('close')"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M9.41 8L12.7 4.71C12.89 4.53 13 4.28 13 4C13 3.45 12.55 3 12 3C11.72 3 11.47 3.11 11.29 3.29L8 6.59L4.71 3.29C4.53 3.11 4.28 3 4 3C3.45 3 3 3.45 3 4C3 4.28 3.11 4.53 3.29 4.71L6.59 8L3.3 11.29C3.11 11.47 3 11.72 3 12C3 12.55 3.45 13 4 13C4.28 13 4.53 12.89 4.71 12.71L8 9.41L11.29 12.7C11.47 12.89 11.72 13 12 13C12.55 13 13 12.55 13 12C13 11.72 12.89 11.47 12.71 11.29L9.41 8Z"
              fill="#3366FF"
            />
          </svg>
        </div>
        <div class="text-[12px]">Created {{ formatDate(area.created_at) }}</div>
        <div class="flex gap-3 text-[12px]">
          <div class="">
            <b>{{ area.views }}</b> Views
          </div>
          <div class="">
            <b>{{ reviews.length }}</b> Reviews
          </div>
        </div>
        <div class="flex items-center flex-wrap gap-3 my-5">
          <div
            class="flex-shrink-0 text-sm text-center py-[3px] px-[10px] border-[1.5px] border-black dark:border-[#383B43] bg-transparent rounded-[4px] cursor-pointer hover:opacity-75 flex gap-5 justify-between items-center"
            v-for="(amenity, key) of amenities"
            :key="key"
          >
            {{ key }}
            <div
              class="bg-primary/10 text-primary text-sm h-[25px] w-[25px] flex justify-center items-center rounded-full"
            >
              {{ amenity }}
            </div>
          </div>
        </div>
        <div class="flex gap-[10px] overflow-auto mt-5 pb-3" v-if="area?.imgs?.length !== 0">
          <div
            class="w-[80px] flex-shrink-0 relative"
            v-for="(img, index) in area.imgs"
            :key="index"
          >
            <img :src="img" class="w-full h-auto rounded" />
          </div>
        </div>
        <div class="flex gap-5">
          <router-link :to="`/admin/areas/${area.id}`" class="w-full">
            <AppButton type="primary" size="small" class="uppercase w-full font-semibold">
              View reviews
            </AppButton>
          </router-link>
          <router-link :to="`?action=edit?id=${area.id}`" class="w-full">
            <AppButton type="outline" size="small" class="uppercase w-full font-semibold">
              Edit
            </AppButton>
          </router-link>
        </div>
      </template>
    </div>
  </section>
</template>
