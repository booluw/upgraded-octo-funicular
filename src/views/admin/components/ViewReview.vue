<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'
import { formatDate } from '@/utils/functions'
import { onClickOutside } from '@vueuse/core'
import { notify } from '@/components/AppNotification'

import AppLoader from '@/components/AppLoader.vue'
import AppButton from '@/components/AppButton.vue'
import { isEmpty } from 'lodash'

const emits = defineEmits(['done', 'close'])

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const review = ref({}) as any
const target = ref(null)
onClickOutside(target, () => emits('close'))


const getArea = async function () {
  loading.value = true

  try {
    const { data, error } = await supabase.from('reviews').select('*, area(*), profile(*)').eq('id', route.query.id)

    if (error) throw Error(error.message as any)

    review.value = data[0]
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
      class="mx-5 w-full md:mx-0 md:!w-[500px] rounded-[6px] p-[24px] bg-[#FBFCFE] dark:bg-black text-black dark:text-text-dark overflow-x-auto shadow"
      ref="target"
    >
      <div class="flex justify-center items-center" v-if="loading">
        <AppLoader />
      </div>
      <template v-if="!isEmpty(review)">
        <div class="flex justify-between items-start mb-2">
          <div class="flex gap-x-3 flex-wrap">
            <img :src="review.profile.img" class="h-[64px] w-auto rounded-full" v-if="review.profile.img" />
            <img src="@/assets/imgs/avataaars.png" class="rounded-full h-[64px] w-auto" v-else />
            <div>
              <h2 class="capitalize text-2xl">{{ review.profile.username.replace(/"/g, "") }}</h2>
              {{  formatDate(review.created_at) }}
            </div>
          </div>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="cursor-pointer w-[16px] flex-shrink-0"
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
        <p class="my-5">{{ review.review }}</p>
        <div class="flex items-center flex-wrap gap-3 my-5 opacity-75">
          <div
            class="flex-shrink-0 text-sm text-center py-[3px] px-[10px] border-[1.5px] border-black dark:border-[#383B43] bg-transparent rounded-[4px] cursor-default flex gap-5 justify-between items-center"
            v-for="(amenity, key) of review.amenities"
            :key="key"
          >
            {{ amenity }}
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
