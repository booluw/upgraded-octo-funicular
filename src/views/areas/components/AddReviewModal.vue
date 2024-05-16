<script lang="ts" setup>
import { reactive } from 'vue'
import { useRoute } from 'vue-router'
import { AMENITIES } from '@/utils/constants'
import { supabase } from '@/config/supabase'

import { useUser } from '@/stores/user'

import AppSelection from '@/components/AppSelection.vue'
import AppModal from '@/components/AppModal.vue'
import AppRating from '@/components/AppRating.vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'

const emit = defineEmits(['close'])
const route = useRoute()
const user = useUser()

const review = reactive({
  amenities: [] as string[],
  rating: 0,
  review: '',
  anon: false,
  area: route.params.name,
  profile_id: user.user.id
})

const submitReview = async function () {
  if (review.amenities.length === 0) {
    notify({
      content: 'Select Amenities relating to this review',
      position: 'top-center',
      type: 'warning'
    })
    return
  }

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
    const { data, error } = await supabase
      .from('reviews')
      .insert({ ...review })
      .select('*, profile(*)')

    if (error) throw Error(error)

    emit('done', data)
    notify({ content: 'review Submitted', position: 'top-center', type: 'success' })
  } catch (error) {
    console.log(error)
    notify({ content: error, position: 'top-center', type: 'success' })
  }
}
</script>
<template>
  <AppModal>
    <h1 class="text-center">Review Location</h1>
    <h2 class="text-[24px] font-semibold my-[24px] text-center md:text-left">{{ query }}</h2>
    <form @submit.prevent="submitReview()">
      <AppSelection
        v-model="review.amenities"
        :options="AMENITIES"
        placeholder="Select Amenities"
      />
      <AppRating v-model="review.rating" class="my-[16px]" />
      <h3 class="mb-[4px]">Write Review</h3>
      <AppInput type="textarea" v-model="review.review" placeholder="Write a review" />
      <div
        class="inline-flex gap-[8px] my-[16px] cursor-pointer"
        @click="review.annon = !review.annon"
      >
        <div class="py-2 px-[10px] border rounded" :class="{ 'bg-primary': review.annon }" />
        Post as Anonymous
      </div>
      <div class="flex gap-[24px]">
        <AppButton type="primary" mode="submit" class="w-full">SUBMIT</AppButton>
        <AppButton type="outline" class="w-full" @click="emit('close')">CANCEL</AppButton>
      </div>
    </form>
  </AppModal>
</template>
