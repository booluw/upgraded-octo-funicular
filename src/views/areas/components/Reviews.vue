<script lang="ts" setup>
import { ref, onMounted, toRef, computed } from 'vue'
import { supabase } from '@/config/supabase'
import { useRoute } from 'vue-router'
import { useUser } from '@/stores/user'

import AppError from '@/components/AppError.vue'
import AppLoader from '@/components/AppLoader.vue'
import ReviewCard from '@/components/ReviewCard.vue'

const props = defineProps<{
  type?: 'full' | 'minimized',
  filter?: any
}>()
const emit = defineEmits(['clicked'])

const route = useRoute()
const user = useUser().user

const loading = ref(false)
const error = ref(false)
const reviews = ref([])

const _review = computed(() => {
  if (reviews.value.length === 0) return []
  if (toRef(props.filter).value === null) return reviews.value
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
      .or(`and(area.eq.${route.params.name}, approved.eq.APPROVED)`)
      .order('likes', { ascending: false })

    if (error) throw Error(error.message ?? error)

    reviews.value = data as unknown as any

    if (user.id !== '') {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profile(*)')
        .or(`and(area.eq.${route.params.name}, profile_id.eq.${user.id}, approved.eq.PENDING)`)

      if (error) throw Error(error.message)

      reviews.value = [...data as unknown as any, ...reviews.value] as unknown as any

      // See here: https://stackoverflow.com/a/10124053/5454933
      reviews.value.sort(function(a,b){
        return new Date(b.created_at) - new Date(a.created_at);
      });
    }
  } catch (err) {
    error.value = true
    console.log(err)
  }

  loading.value = false
}

const handleClick = function (id: string) {
  emit('clicked', id)
}

defineExpose({ getAllReviews })

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
    <div class="md:w-full pr-5" v-else>
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
        <div class="text-xl opacity-75" v-if="toRef(filter).value !== null">
          No reviews under {{ toRef(filter) }} yet.
        </div>
        <div class="text-xl opacity-75" v-else>No reviews yet, add one.</div>
      </template>
    </div>
  </div>
</template>
