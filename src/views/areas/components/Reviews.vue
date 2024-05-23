<script lang="ts" setup>
import { ref, onMounted, toRef, computed } from 'vue'
import { supabase } from '@/config/supabase'
import { useRoute } from 'vue-router'

import { isEmpty } from 'lodash'

import AppError from '@/components/AppError.vue'
import AppLoader from '@/components/AppLoader.vue'
import ReviewCard from '@/components/ReviewCard.vue'

const props = defineProps<{
  type?: 'full' | 'minimized',
  filter?: any
}>()
const emit = defineEmits(['clicked'])

const route = useRoute()

const loading = ref(false)
const error = ref(false)
const reviews = ref([])

defineExpose({ reviews })

const _review = computed(() => {
  if (reviews.value.length === 0) return []
  else if (toRef(props.filter).value === '') return reviews.value
  return reviews.value.filter((item: any) => {
    if (item.amenities.includes(toRef(props.filter).value)) {
      return item
    }
  })
})

const getAllReviews = async function () {
  loading.value = true
  error.value = false

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profile(*)')
      .eq('area', route.params.name)
      .order('id', { ascending: false })

    if (error) throw Error(error.message ?? error)
    reviews.value = data
  } catch (err) {
    error.value = true
    console.log(err)
  }

  loading.value = false
}

const handleClick = function (id) {
  emit('clicked', id)
}

onMounted(() => {
  getAllReviews()
})
</script>
<template>
  <div class="md:w-full">
    <section
      class="h-[100%] overflow-y-auto flex items-center justify-center bg-primary-light dark:bg-[#14161A] text-primary"
      v-if="loading"
    >
      <AppLoader />
    </section>
    <AppError v-else-if="error" />
    <div class="md:w-full md:h-[380px] overflow-y-auto scrollbar pr-5" v-else>
      <template v-if="_review.length !== 0">
        <ReviewCard
          :type="type"
          :review="review"
          v-for="(review, i) in _review.flat()"
          :key="i"
          @clicked="handleClick"
          @reload="getAllReviews()"
        />
      </template>
      <template v-else>
        <div class="text-xl opacity-75" v-if="!isEmpty(toRef(filter))">
          No reviews under {{ toRef(filter) }} yet.
        </div>
        <div class="text-xl opacity-75" v-else>No reviews yet, add one.</div>
      </template>
    </div>
  </div>
</template>
