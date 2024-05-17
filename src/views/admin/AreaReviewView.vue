<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'


import { notify } from '@/components/AppNotification'
import { supabase } from '@/config/supabase'

import AppError from '@/components/AppError.vue'
import AppLoader from '@/components/AppLoader.vue'
import AppButton from '@/components/AppButton.vue'

import Reviews from '@/views/areas/components/Reviews.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const error = ref(false)

const area = ref({})

const getArea = async function () {
  loading.value = true
  try {
    const { data, error } = await supabase.from('areas').select('*').eq('id', route.params.name)

    if (error) throw Error(error)

    area.value = data[0]
  } catch (err) {
    console.log(err)
    notify({ content: err, type: 'error', position: 'top-center' })
  }
  loading.value = false
}

const handleClick = function (id) {
  console.log('Review Clicked', id)
}

onMounted(() => {
  getArea()
})
</script>
<template>
  <section
    class="h-full flex items-center justify-center bg-transparent text-primary"
    v-if="loading"
  >
    <AppLoader />
  </section>
  <AppError v-else-if="error" />
  <section class="md:w-2/3 text-left" v-else>
    <a href="#back" class="inline-flex gap-[5px] items-center" @click.prevent="router.go(-1)">
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_6405_25616)">
          <path
            d="M1.25 7.5L3.75 10V8.125H13.125V6.875H3.75V5L1.25 7.5Z"
            fill="#636366"
            fill-opacity="0.8"
          />
        </g>
        <defs>
          <clipPath id="clip0_6405_25616">
            <rect width="15" height="15" fill="white" transform="matrix(-1 0 0 -1 15 15)" />
          </clipPath>
        </defs>
      </svg>
      <span class="underline">Back</span>
    </a>
    <div class="flex justify-between items-center mt-5">
      <h1 class="text-icon dark:text-primary-light font-[500] text-2xl capitalize">
        {{ area.name }}, {{ area.lga }}
      </h1>
      <AppButton
        type="primary"
        class="uppercase text-sm"
        size="small"
        @click.prevent="router.push('/admin/reviews?action=add')"
      >
        leave a review
      </AppButton>
    </div>
    <div class="mt-10 w-full overflow-y-auto scrollbar-none">
      <Reviews ref="reviews" type="full" @clicked="handleClick" />
    </div>
  </section>
</template>
