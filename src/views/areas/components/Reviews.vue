<script lang="ts" setup>
import { ref, onMounted, toRef, computed } from 'vue'
import { supabase } from '@/config/supabase'
import { useTimeAgo } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { useUser } from '@/stores/user'

import AppError from '@/components/AppError.vue'
import AppLoader from '@/components/AppLoader.vue'
import ReviewCard from '@/components/ReviewCard.vue'

const props = defineProps<{
  type?: 'full' | 'minimized'
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

const formatTime = function (time: string) {
  const formatted = useTimeAgo(time)

  return formatted.value.replace(/"/g, '')
}

const getAllReviews = async function () {
  loading.value = true
  error.value = false

  try {
    // const { data, error } = await supabase
    //   .from('reviews')
    //   .select('*, profile(*)')
    //   .or(`and(area.eq.${route.params.name}, approved.eq.APPROVED)`)
    //   .order('likes', { ascending: false })

    const { data, error } = await supabase
      .rpc('get_reviews_and_profiles')
      .select('*')
      .or(`and(area_id.eq.${route.params.name}, approved.eq.APPROVED)`)
      .order('likes', { ascending: false })

    if (error) throw Error(error.message ?? error)

    reviews.value = data as unknown as any

    if (user.id !== '') {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profile(*)')
        .or(`and(area.eq.${route.params.name}, profile_id.eq.${user.id}, approved.eq.PENDING)`)

      if (error) throw Error(error.message)

      reviews.value = [...(data as unknown as any), ...reviews.value] as unknown as any

      // See here: https://stackoverflow.com/a/10124053/5454933
      reviews.value.sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at)
      })
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
    <div class="md:w-full md:pr-5" v-else>
      <template v-if="_review.length !== 0">
        <template v-for="(review, i) in _review.flat()" :key="i">
          <ReviewCard
            :type="type"
            :review="review"
            @clicked="handleClick"
            @reload="getAllReviews()"
            v-if="review.approved !== 'PENDING'"
          />

          <div class="mb-[10px] py-[16px]" :class="{ 'rounded-none': type === 'full' }" v-else>
            <div class="flex justify-between">
              <div class="flex md:items-center gap-[8px]">
                <img
                  :src="review.profile.img"
                  class="w-[42px] h-[42px] border-4 border-[#E5EDF5] dark:border-[#212327] rounded"
                  v-if="review.profile.img && !review.anon"
                />
                <img
                  src="@/assets/imgs/avataaars.png"
                  class="w-[42px] h-[42px] border-4 border-[#E5EDF5] dark:border-[#212327] rounded"
                  v-else
                />
                <div class="flex flex-col gap-1">
                  <div class="flex gap-4">
                    {{ review.anon ? 'Annon User' : review.profile.username.replace(/"/g, '') }}
                    <b
                      class="text-[12px] text-[#3366FF] bg-[#3366FF]/10 border-2 border-[#3366FF] rounded py-[3px] px-[8px]"
                      v-if="review.profile.role === 'ADMIN'"
                    >
                      Admin
                    </b>
                  </div>
                  <div class="flex items-start md:gap-[8px] text-[14px]">
                    <div class="">
                      <div class="flex flex-col md:flex-row md:gap-3">
                        <span class="block text-[14px] opacity-60">{{
                          formatTime(review.created_at)
                        }}</span>
                        <div
                          class="text-[#E95F5F] text-sm flex items-center gap-1"
                          v-if="review.approved === 'PENDING'"
                        >
                          <svg
                            class="w-[14px]"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8.0005 5.33333V7.99999M8.0005 10.6667H8.00717M6.8605 1.90666L1.21384 11.3333C1.09741 11.5349 1.03581 11.7635 1.03516 11.9963C1.03451 12.2292 1.09483 12.4581 1.21012 12.6603C1.32541 12.8626 1.49165 13.0312 1.69231 13.1492C1.89296 13.2673 2.12104 13.3308 2.35384 13.3333H13.6472C13.88 13.3308 14.108 13.2673 14.3087 13.1492C14.5094 13.0312 14.6756 12.8626 14.7909 12.6603C14.9062 12.4581 14.9665 12.2292 14.9658 11.9963C14.9652 11.7635 14.9036 11.5349 14.7872 11.3333L9.1405 1.90666C9.02166 1.71073 8.85432 1.54874 8.65463 1.43632C8.45495 1.32389 8.22966 1.26483 8.0005 1.26483C7.77135 1.26483 7.54606 1.32389 7.34637 1.43632C7.14669 1.54874 6.97935 1.71073 6.8605 1.90666Z"
                              stroke="#E95F5F"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                          Pending Approval
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-[4px] text-[14px]">
                <svg
                  class="w-[12px]"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6 0L7.875 3.975L12 4.575L9 7.65L9.675 12L6 9.975L2.325 12L3 7.65L0 4.575L4.125 3.975L6 0Z"
                    fill="#FABB07"
                  />
                </svg>
                {{ review.rating }}.0
              </div>
            </div>
            <p class="text-justify my-[8px] line-clamp-4">
              {{ review.review }}
            </p>

            <div class="flex gap-5">
              <div
                class="rounded border border-[#B2C1E6] dark:border-[#383B43] p-1 flex items-center gap-3 cursor-not-allowed"
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <g opacity="0.6">
                    <path
                      d="M12 2C6.47727 2 2 6.47727 2 12C2 17.5227 6.47727 22 12 22C17.5227 22 22 17.5227 22 12C22 6.47727 17.5227 2 12 2ZM12 3.81818C16.5186 3.81818 20.1818 7.48136 20.1818 12C20.1818 16.5186 16.5186 20.1818 12 20.1818C7.48136 20.1818 3.81818 16.5186 3.81818 12C3.81818 7.48136 7.48136 3.81818 12 3.81818ZM12 6.83754C11.7719 6.83754 11.544 6.92254 11.3679 7.09322L8.18608 10.1738C8.00199 10.352 7.90909 10.59 7.90909 10.8272C7.90909 11.055 7.99386 11.2834 8.16477 11.4602C8.51386 11.8207 9.08983 11.8302 9.45028 11.4806L11.0909 9.8924V16.2534C11.0909 16.7556 11.4982 17.1625 12 17.1625C12.5018 17.1625 12.9091 16.7552 12.9091 16.2534V9.89151L14.5497 11.4798C14.9102 11.8288 15.4857 11.8198 15.8352 11.4593C16.1843 11.098 16.1748 10.5225 15.8139 10.1738L12.6321 7.09322C12.456 6.92254 12.2281 6.83754 12 6.83754Z"
                      fill="currentColor"
                    />
                  </g>
                </svg>

                0
                <svg class="rotate-180" width="24" height="24" viewBox="0 0 24 24">
                  <g opacity="0.6">
                    <path
                      d="M12 2C6.47727 2 2 6.47727 2 12C2 17.5227 6.47727 22 12 22C17.5227 22 22 17.5227 22 12C22 6.47727 17.5227 2 12 2ZM12 3.81818C16.5186 3.81818 20.1818 7.48136 20.1818 12C20.1818 16.5186 16.5186 20.1818 12 20.1818C7.48136 20.1818 3.81818 16.5186 3.81818 12C3.81818 7.48136 7.48136 3.81818 12 3.81818ZM12 6.83754C11.7719 6.83754 11.544 6.92254 11.3679 7.09322L8.18608 10.1738C8.00199 10.352 7.90909 10.59 7.90909 10.8272C7.90909 11.055 7.99386 11.2834 8.16477 11.4602C8.51386 11.8207 9.08983 11.8302 9.45028 11.4806L11.0909 9.8924V16.2534C11.0909 16.7556 11.4982 17.1625 12 17.1625C12.5018 17.1625 12.9091 16.7552 12.9091 16.2534V9.89151L14.5497 11.4798C14.9102 11.8288 15.4857 11.8198 15.8352 11.4593C16.1843 11.098 16.1748 10.5225 15.8139 10.1738L12.6321 7.09322C12.456 6.92254 12.2281 6.83754 12 6.83754Z"
                      fill="currentColor"
                    />
                  </g>
                </svg>
              </div>

              <button
                class="rounded border border-[#B2C1E6] dark:border-[#383B43] p-1 pr-3 text-sm flex gap-3 items-center cursor-not-allowed"
                disabled
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g opacity="0.6">
                    <path
                      d="M11.9038 7.22424C16.927 7.88049 20.9038 11.7644 20.9038 16.1556C20.9038 19.1207 20.2727 20.6241 19.0288 20.6241C16.492 20.6241 19.315 14.7021 11.9038 13.945C11.9038 13.945 11.9038 15.2312 11.9038 15.9182C11.9038 17.4681 10.0551 18.1514 9.0336 17.1299C8.0121 16.1084 4.3056 12.4019 3.5916 11.6879C2.8776 10.9739 2.99085 9.91074 3.5916 9.30999C4.1331 8.76849 8.00497 4.89699 9.0336 3.86836C10.0622 2.83974 11.9038 3.51211 11.9038 5.05749C11.9038 6.53911 11.9038 7.22424 11.9038 7.22424ZM19.1485 18.6396C19.2298 18.6396 19.4038 17.407 19.4038 16.1552C19.4038 12.4067 15.8335 9.09924 11.2877 8.66499C10.7871 8.61774 10.4038 8.38036 10.4038 7.71961C10.4038 7.38961 10.4038 5.23261 10.4038 5.05711C10.4038 4.88161 10.1998 4.82274 10.0941 4.92886C9.98835 5.03461 4.73985 10.2831 4.6521 10.3705C4.56435 10.4582 4.59922 10.5741 4.65247 10.6274C4.70572 10.6806 9.97672 15.952 10.0941 16.069C10.2115 16.186 10.4038 16.1061 10.4038 15.9407C10.4038 15.7949 10.4038 13.6994 10.4038 13.1282C10.4038 12.5571 10.6937 12.3764 11.1861 12.3921C18.94 12.6385 18.9591 18.6396 19.1485 18.6396Z"
                      fill="currentColor"
                    />
                  </g>
                </svg>

                Reply
              </button>
            </div>
          </div>
        </template>
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
