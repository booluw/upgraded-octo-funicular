<script lang="ts" setup>
import { reactive, onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/config/supabase'
import { useUser } from '@/stores/user'

import { AMENITIES } from '@/utils/constants'
import { notify } from '@/components/AppNotification'

import AppSelection from '@/components/AppSelection.vue'
import AppSelect from '@/components/AppSelect.vue'
import AppRating from '@/components/AppRating.vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'

const emit = defineEmits(['close', 'done'])
const route = useRoute()
const user = useUser()

const error = ref(false)
const loading = ref(false)

const area = reactive({ items: [] })
const review = reactive({
  area: '',
  amenities: [],
  review: '',
  rating: 0,
  profile_id: user.user.id
})

const areas = computed(() => {
  if (area.items.length === 0) return []
  return area.items.map((item) => {
    return { label: `${item.name} - ${item.lga}, ${item.state} state`, val: item.id }
  })
})

const saveArea = async function () {
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
    const { error } = await supabase
      .from('reviews')
      .insert({ ...review, area: review.area.val })
      .select('*, profile(*)')

    if (error) throw Error(error.message ?? error)

    emit('done')
    notify({ content: 'review Submitted', position: 'top-center', type: 'success' })
  } catch (error) {
    console.log(error.message)
    notify({ content: error, position: 'top-center', type: 'error' })
  }
}

const getAllArea = async function () {
  try {
    const { data, error } = await supabase.from('areas').select('*')

    if (error) throw Error(error.message ?? error)
    area.items = data
  } catch (err) {
    error.value = true
    console.log(err)
    notify({
      content: err ?? `We couldn't fetch Areas, please reload`,
      type: 'error',
      position: 'top-center'
    })
  }
}

onMounted(async () => {
  await getAllArea()
})
</script>
<template>
  <div class="md:w-2/3 text-left">
    <a href="#back" class="inline-flex gap-[5px] items-center" @click.prevent="emit('back')">
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
    <h1 class="text-icon dark:text-primary-light font-[500] text-2xl mt-5">Create a new Review</h1>
    <form
      class="md:w-2/3 rounded mt-5 p-3 bg-primary-light dark:bg-icon"
      @submit.prevent="saveArea()"
    >
      <AppSelect :options="areas" placeholder="Area Name" v-model="review.area" class="mb-5" />
      <AppSelection
        v-model="review.amenities"
        :options="AMENITIES"
        placeholder="Select Amenities"
        class="mb-5"
      />
      <AppRating v-model="review.rating" class="my-[16px]" />
      <AppInput
        type="textarea"
        v-model="review.review"
        placeholder="Write a review for this Area"
      />
      <AppButton type="primary" mode="submit" class="w-full mt-5" :loading="loading"
        >SAVE</AppButton
      >
    </form>
    {{ user.user }}
  </div>
</template>
