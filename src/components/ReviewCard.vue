<script lang="ts" setup>
import { ref } from 'vue'
import { useTimeAgo } from '@vueuse/core'
import { useUser } from '@/stores/user'
import { isEmpty } from 'lodash'

import { onClickOutside } from '@vueuse/core'

import { notify } from '@/components/AppNotification'
import { supabase } from '@/config/supabase'

import AppButton from '@/components/AppButton.vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  review: any
  type?: 'full' | 'minimized'
}>()

const emit = defineEmits(['clicked', 'reload'])
const user = useUser().user
const route = useRoute()

const comment = ref(false)
const newComment = ref('')
const loading = ref(false)

const target = ref(null)

const addNewComment = async function () {
  loading.value = true

  try {
    const { error } = await supabase
      .from('comments')
      .insert({ profile_id: user.id, text: newComment.value, reviews_id: props.review.id })

    if (error) throw Error(error.message as any)

    emit('reload')
  } catch (error) {
    console.log(error)
    notify({
      content: `We could not add your comment, please try again`,
      type: 'error',
      position: 'top-center'
    })
  }

  loading.value = false
}

const formatTime = function (time: string) {
  const formatted = useTimeAgo(time)

  return formatted.value.replace(/"/g, '')
}

const like = async function (review: typeof props.review) {
  if (isEmpty(user.id)) {
    notify({ content: 'You need to login', type: 'info', position: 'top-center' })
    return
  }

  if (review.dislikes.includes(user.id)) {
    notify({ content: 'Disliked already', type: 'info', position: 'top-center' })
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          dislikes: review.dislikes.filter((id: string) => {
            if (id !== user.id) {
              return id
            }
          })
        })
        .eq('id', review.id)
        .select('dislikes')

      if (error) throw Error(error.message as any)

      review.dislikes = [...data[0].dislikes]
    } catch (error) {
      console.log(error)
      notify({ content: 'Please try again', type: 'error', position: 'top-center' })
      return
    }
  }

  if (review.likes.includes(user.id)) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          likes: review.likes.filter((id: string) => {
            if (id !== user.id) {
              return id
            }
          })
        })
        .eq('id', review.id)
        .select('likes')

      if (error) throw Error(error.message as any)

      notify({ content: 'Comment unliked', type: 'success', position: 'top-center' })
      review.likes = [...data[0].likes]
    } catch (error) {
      console.log(error)
      notify({ content: 'Please try again', type: 'error', position: 'top-center' })
    }
    return
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({ likes: [...review.likes, user.id] })
      .eq('id', review.id)
      .select('likes')

    if (error) throw Error(error.message as any)

    notify({ content: 'Comment liked', type: 'success', position: 'top-center' })

    review.likes = [...data[0].likes]
  } catch (error) {
    console.log(error)
    notify({ content: 'Please try again', type: 'error', position: 'top-center' })
  }
}
const dislike = async function (review: typeof props.review) {
  if (isEmpty(user.id)) {
    notify({ content: 'You need to login', type: 'info', position: 'top-center' })
    return
  }

  if (review.likes.includes(user.id)) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          likes: review.likes.filter((id: string) => {
            if (id !== user.id) {
              return id
            }
          })
        })
        .eq('id', review.id)
        .select('likes')

      if (error) throw Error(error.message as any)

      review.likes = [...data[0].likes]
    } catch (error) {
      console.log(error)
      notify({ content: 'Please try again', type: 'error', position: 'top-center' })
      return
    }
  }

  if (review.dislikes.includes(user.id)) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          dislikes: review.dislikes.filter((id: string) => {
            if (id !== user.id) {
              return id
            }
          })
        })
        .eq('id', review.id)
        .select('dislikes')

      if (error) throw Error(error.message as any)

      notify({ content: 'Comment undisliked', type: 'success', position: 'top-center' })
      review.dislikes = [...data[0].dislikes]
    } catch (error) {
      console.log(error)
      notify({ content: 'Please try again', type: 'error', position: 'top-center' })
    }
    return
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({ dislikes: [...review.dislikes, user.id] })
      .eq('id', review.id)
      .select('dislikes')

    if (error) throw Error(error.message as any)

    notify({ content: 'Comment disliked', type: 'success', position: 'top-center' })

    review.dislikes = [...data[0].dislikes]
  } catch (error) {
    console.log(error)
    notify({ content: 'Please try again', type: 'error', position: 'top-center' })
  }
}

onClickOutside(target, () => {
  comment.value = false
})
</script>
<template>
  <div
    class="mb-[10px] p-[16px] hover:bg-[#E5EDF5] dark:hover:bg-[#212327] border-b-[1px] dark:border-black/50"
    :class="
      ({ 'border-b border-primary/20 dark:border-[#212327] rounded-none': type === 'full' },
      { 'bg-[#212327]': Number(route.query.review) === review.id })
    "
  >
    <div class="flex justify-between">
      <div class="flex md:items-center gap-[8px]">
        <img
          :src="review.profile.img"
          class="w-[42px] h-[42px] rounded"
          v-if="review.profile.img && !review.anon"
        />
        <img src="@/assets/imgs/avataaars.png" class="rounded w-[42px] h-[42px]" v-else />
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
        <svg class="w-[12px]" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        class="rounded border border-[#B2C1E6] dark:border-[#383B43] p-1 flex items-center gap-3"
        :class="{ 'bg-primary/10 dark:bg-[#212327]': review.likes.includes(user.id) }"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          v-if="review.likes.includes(user.id)"
          @click="like(review)"
          class="cursor-pointer"
        >
          <path
            d="M22 12C22 17.5227 17.5227 22 12 22C6.47727 22 2 17.5227 2 12C2 6.47727 6.47727 2 12 2C17.5227 2 22 6.47727 22 12ZM11.0909 16.2536C11.0909 16.7555 11.4982 17.1627 12 17.1627C12.5018 17.1627 12.9091 16.7555 12.9091 16.2536V9.89182L14.5495 11.48C14.91 11.8295 15.4859 11.82 15.835 11.4595C16.1845 11.0982 16.1755 10.5223 15.8141 10.1741L12.6323 7.09318C12.28 6.75182 11.72 6.75182 11.3677 7.09318L8.18591 10.1741C8.00182 10.3523 7.90909 10.5895 7.90909 10.8273C7.90909 11.055 7.99409 11.2832 8.165 11.46C8.51455 11.8205 9.09 11.8295 9.45046 11.4805L11.0909 9.89182V16.2536Z"
            fill="#3366FF"
          />
        </svg>

        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="cursor-pointer"
          @click="like(review)"
          v-else
        >
          <g opacity="0.6">
            <path
              d="M12 2C6.47727 2 2 6.47727 2 12C2 17.5227 6.47727 22 12 22C17.5227 22 22 17.5227 22 12C22 6.47727 17.5227 2 12 2ZM12 3.81818C16.5186 3.81818 20.1818 7.48136 20.1818 12C20.1818 16.5186 16.5186 20.1818 12 20.1818C7.48136 20.1818 3.81818 16.5186 3.81818 12C3.81818 7.48136 7.48136 3.81818 12 3.81818ZM12 6.83754C11.7719 6.83754 11.544 6.92254 11.3679 7.09322L8.18608 10.1738C8.00199 10.352 7.90909 10.59 7.90909 10.8272C7.90909 11.055 7.99386 11.2834 8.16477 11.4602C8.51386 11.8207 9.08983 11.8302 9.45028 11.4806L11.0909 9.8924V16.2534C11.0909 16.7556 11.4982 17.1625 12 17.1625C12.5018 17.1625 12.9091 16.7552 12.9091 16.2534V9.89151L14.5497 11.4798C14.9102 11.8288 15.4857 11.8198 15.8352 11.4593C16.1843 11.098 16.1748 10.5225 15.8139 10.1738L12.6321 7.09322C12.456 6.92254 12.2281 6.83754 12 6.83754Z"
              fill="currentColor"
            />
          </g>
        </svg>

        {{ review.likes.length }}

        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="cursor-pointer"
          @click="dislike(review)"
          v-if="!review.dislikes.includes(user.id)"
        >
          <g opacity="0.6">
            <path
              d="M12 2C6.47727 2 2 6.47727 2 12C2 17.5227 6.47727 22 12 22C17.5227 22 22 17.5227 22 12C22 6.47727 17.5227 2 12 2ZM12 3.81818C16.5186 3.81818 20.1818 7.48136 20.1818 12C20.1818 16.5186 16.5186 20.1818 12 20.1818C7.48136 20.1818 3.81818 16.5186 3.81818 12C3.81818 7.48136 7.48136 3.81818 12 3.81818ZM12 6.83754C11.4982 6.83754 11.0909 7.24481 11.0909 7.74663V14.1085L9.45028 12.5202C9.08983 12.1712 8.51432 12.1802 8.16477 12.5407C7.81568 12.902 7.82517 13.4775 8.18608 13.8262L11.3679 16.9068C11.7202 17.2481 12.2798 17.2481 12.6321 16.9068L15.8139 13.8262C15.998 13.648 16.0909 13.41 16.0909 13.1728C16.0909 12.945 16.0061 12.7166 15.8352 12.5398C15.4861 12.1793 14.9102 12.1698 14.5497 12.5194L12.9091 14.1076V7.74663C12.9091 7.24435 12.5023 6.83754 12 6.83754Z"
              fill="currentColor"
            />
          </g>
        </svg>

        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          v-else
          @click="dislike(review)"
          class="cursor-pointer rotate-180"
        >
          <path
            d="M22 12C22 17.5227 17.5227 22 12 22C6.47727 22 2 17.5227 2 12C2 6.47727 6.47727 2 12 2C17.5227 2 22 6.47727 22 12ZM11.0909 16.2536C11.0909 16.7555 11.4982 17.1627 12 17.1627C12.5018 17.1627 12.9091 16.7555 12.9091 16.2536V9.89182L14.5495 11.48C14.91 11.8295 15.4859 11.82 15.835 11.4595C16.1845 11.0982 16.1755 10.5223 15.8141 10.1741L12.6323 7.09318C12.28 6.75182 11.72 6.75182 11.3677 7.09318L8.18591 10.1741C8.00182 10.3523 7.90909 10.5895 7.90909 10.8273C7.90909 11.055 7.99409 11.2832 8.165 11.46C8.51455 11.8205 9.09 11.8295 9.45046 11.4805L11.0909 9.89182V16.2536Z"
            fill="#3366FF"
          />
        </svg>
      </div>

      <div
        class="rounded border border-[#B2C1E6] dark:border-[#383B43] p-1 pr-3 text-sm flex gap-3 items-center cursor-pointer"
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
              fill="#FBFCFE"
            />
          </g>
        </svg>

        Reply
      </div>
    </div>

    <!-- <div class="mt-4" v-if="type === 'full'">
      <div class="flex items-center justify-start gap-5 mt-4 opacity-60">
        <div class="flex items-center gap-1 cursor-pointer" @click="like(review)">     
        review.likes.includes(user.id)
          ? 'fill-primary'
          : 'fill-[#0D2159] dark:fill-primary-light'
      
          {{ review.likes.length }}
        </div>
        <div class="flex items-center gap-1" @click="dislike(review)">
            
          :class="
            review.dislikes.includes(user.id)
              ? 'fill-primary'
              : 'fill-[#0D2159] dark:fill-primary-light'
          "
        </div>
        <div class="flex items-center gap-1" @click="comment = !comment">
          <svg
            width="24"
            height="25"
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.6 16.7H7.1V16.2H6.6V16.7ZM8.652 21.152L9.00555 21.5056L9.00603 21.5051L8.652 21.152ZM13.092 16.7V16.2H12.8845L12.738 16.3469L13.092 16.7ZM19.8 3H4.2V4H19.8V3ZM4.2 3C3.26386 3 2.5 3.76386 2.5 4.7H3.5C3.5 4.31614 3.81614 4 4.2 4V3ZM2.5 4.7V15.5H3.5V4.7H2.5ZM2.5 15.5C2.5 16.4361 3.26386 17.2 4.2 17.2V16.2C3.81614 16.2 3.5 15.8839 3.5 15.5H2.5ZM4.2 17.2H6.6V16.2H4.2V17.2ZM6.1 16.7V20.3H7.1V16.7H6.1ZM6.1 20.3C6.1 21.2361 6.86386 22 7.8 22V21C7.41614 21 7.1 20.6839 7.1 20.3H6.1ZM7.8 22C8.27011 22 8.69686 21.8143 9.00555 21.5056L8.29845 20.7984C8.17515 20.9217 8.00189 21 7.8 21V22ZM9.00603 21.5051L13.446 17.0531L12.738 16.3469L8.29797 20.7989L9.00603 21.5051ZM13.092 17.2H19.8V16.2H13.092V17.2ZM19.8 17.2C20.7361 17.2 21.5 16.4361 21.5 15.5H20.5C20.5 15.8839 20.1839 16.2 19.8 16.2V17.2ZM21.5 15.5V4.7H20.5V15.5H21.5ZM21.5 4.7C21.5 3.76386 20.7361 3 19.8 3V4C20.1839 4 20.5 4.31614 20.5 4.7H21.5Z"
              class="fill-[#0D2159] dark:fill-primary-light"
            />
          </svg>
          {{ review.comments }}
        </div> -->
    <!-- </div> -->
    <!-- </div> -->
    <!-- <div class="w-full" v-if="comment" ref="target">
      <form
        @submit.prevent="addNewComment()"
        class="flex gap-5 pt-5 w-full"
        v-if="!isEmpty(user.id)"
      >
        <input
          class="text-black dark:text-white bg-primary-light/5 focus:outline-none rounded px-5 w-2/3"
          type="text"
          v-model="newComment"
          placeholder="Add a comment"
          required
        />
        <AppButton type="primary" size="small" :loading="loading">Post</AppButton>
      </form>
    </div> -->
  </div>
</template>
