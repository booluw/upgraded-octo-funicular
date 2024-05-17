<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import { useRoute } from 'vue-router'

import AppError from '@/components/AppError.vue'
import AppLoader from '@/components/AppLoader.vue'
import ReviewCard from '@/components/ReviewCard.vue'

defineProps<{
  type?: 'full' | 'minimized'
}>()
const emit = defineEmits(['clicked'])

const route = useRoute()

const loading = ref(false)
const error = ref(false)
const reviews = ref([])

defineExpose({ reviews })

const getAllReviews = async function () {
  loading.value = true
  error.value = false

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profile(*)')
      .eq('area', route.params.name)
      .order('id', { ascending: true })

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
      class="h-[100vh] flex items-center justify-center bg-primary-light dark:bg-[#14161A] text-primary"
      v-if="loading"
    >
      <AppLoader />
    </section>
    <AppError v-else-if="error" />
    <div class="md:w-full" v-else>
      <template v-if="reviews.length !== 0">
        <ReviewCard
          :type="type"
          :review="review"
          v-for="(review, i) in reviews.flat()"
          :key="i"
          @clicked="handleClick"
          @reload="getAllReviews()"
        />
      </template>
      <div class="text-xl opacity-75" v-else>No reviews yet, add one.</div>
    </div>
  </div>
</template>
