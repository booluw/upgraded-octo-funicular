<script lang="ts" setup>
import { reactive, onMounted, ref, computed } from 'vue'
import { supabase } from '@/config/supabase'

import { pick } from 'lodash';
import { notify } from '@/components/AppNotification'
import { onClickOutside } from '@vueuse/core'

import AppSelection from '@/components/AppSelection.vue'
import AppSelect from '@/components/AppSelect.vue'
import AppRating from '@/components/AppRating.vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'

const props = defineProps<{
  data: any
}>()

const emit = defineEmits(['close', 'done'])

const loading = ref(false)

const amenity = ref([])
const target = ref(null)
const review = reactive({
 ...pick(props.data, ['area', 'id', 'ameninities', 'rating', 'review'])
})

const amenities = computed(() => {
  if (amenity.value.length === 0) return []

  return amenity.value.map((item) => {
    return item.title
  })
})


const saveArea = async function () {
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
      .update({ ...pick(review, ['area', 'amenities', 'rating', 'review']) })
      .eq('id', review.id)

    if (error) throw Error(error.message ?? error)

    emit('done')
    notify({ content: 'Review Updated', position: 'top-center', type: 'success' })
  } catch (err: any) {
    console.log(err.message)
    notify({ content: err, position: 'top-center', type: 'error' })
  }
}

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

onClickOutside(target, () => emit('close'))

onMounted(async () => {
  await getAllAmenities()
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
      <h1 class="text-icon dark:text-primary-light font-[500] text-2xl mt-5">Edit Review</h1>
      <form
        class="rounded mt-5 p-3"
        @submit.prevent="saveArea()"
      >
        <AppSelect :options="[]" placeholder="Area Name" v-model="review.area" class="mb-5" />
        <AppSelection
          v-model="review.amenities"
          :options="amenities"
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
          >UPDATE REVIEW</AppButton
        >
      </form>
    </div>
  </section>
</template>
