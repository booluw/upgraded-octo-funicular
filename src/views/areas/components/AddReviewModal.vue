<script lang="ts" setup>
import { reactive, ref, computed, onMounted, type Ref } from 'vue';
import { useRoute } from 'vue-router'
import { supabase } from '@/config/supabase'
import { onClickOutside } from '@vueuse/core'

import { useUser } from '@/stores/user'
import { notify } from '@/components/AppNotification'

import AppSelection from '@/components/AppSelection.vue'
import AppRating from '@/components/AppRating.vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'

const emit = defineEmits(['close', 'done'])
const target = ref(null)
const route = useRoute()
const user = useUser()
const loading = ref(false)

const amenity: Ref<{ title: string }[]> = ref([])
const review = reactive({
  amenities: [] as string[],
  rating: 0,
  review: '',
  anon: false,
  area: route.params.name,
  profile_id: user.user.id
})

const amenities = computed(() => {
  if (amenity.value.length === 0) return []

  return amenity.value.map((item) => {
    return item.title
  })
})

const getAllAmenities = async function () {
  try {
    const { data, error } = await supabase.from('amenities').select('title')

    if (error) throw Error(error.message ?? error)
    amenity.value = data
  } catch (err) {
    console.log(err)
    notify({
      content: err ?? `We couldn't fetch Amenities, please reload`,
      type: 'error',
      position: 'top-center'
    })
  }
}

const submitReview = async function () {
  if (review.rating === 0) {
    notify({
      content: 'How many stars will you rate this location?',
      position: 'top-center',
      type: 'warning'
    })
    return
  }

  if (review.review === '') {
    notify({
      content: 'Write something about this location',
      position: 'top-center',
      type: 'warning'
    })
    return
  }

  try {
    loading.value = true

    const { data, error } = await supabase
      .from('reviews')
      .insert({ ...review })
      .select('*, profile(*)')

    if (error) throw Error(error.message ?? error)

    notify({ content: 'review Submitted', position: 'top-center', type: 'success' })
    emit('done', data)
  } catch (error) {
    console.log(error)
    notify({ content: error, position: 'top-center', type: 'error' })
  }

  loading.value = false
}

onClickOutside(target, () => {
  emit('close')
})

onMounted(() => {
  getAllAmenities()
})
</script>
<template>
  <section
    class="fixed top-0 right-0 bottom-0 left-0 bg-[#FBFCFE]/50 dark:bg-black/50 flex justify-center items-center backdrop-blur"
  >
    <div
      class="mx-5 h-5/6 w-full md:mx-0 md:!w-[500px] rounded-[6px] p-[24px] bg-[#FBFCFE] dark:bg-black text-black dark:text-text-dark overflow-x-auto shadow scrollbar-none"
      ref="target"
      id="modal"
    >
      <h1 class="text-center mb-4">Review Location</h1>
      <!-- <h2 class="text-[24px] font-semibold my-[24px] text-center md:text-left">{{ query }}</h2> -->
      <form @submit.prevent="submitReview()">
        <AppSelection
          v-model="review.amenities"
          :options="amenities"
          placeholder="Select Amenities"
        />
        <AppRating v-model="review.rating" class="my-[16px]" />
        <h3 class="mb-[4px]">Write Review</h3>
        <AppInput type="textarea" v-model="review.review" placeholder="Write a review" />
        <div
          class="inline-flex gap-[8px] my-[16px] cursor-pointer"
          @click="review.anon = !review.anon"
        >
          <div class="py-2 px-[11px] border dark:border-white/40 rounded" :class="{ 'bg-primary': review.anon }" />
          Post as Anonymous
        </div>
        <div class="flex gap-[24px] mt-5">
          <AppButton type="primary" mode="submit" size="small" class="w-full" :loading="loading">SUBMIT REVIEW</AppButton>
        </div>
      </form>
    </div>
  </section>
</template>
