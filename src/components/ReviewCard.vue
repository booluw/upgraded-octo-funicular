<script lang="ts" setup>
import { ref, computed, type Ref } from 'vue'
import { useTimeAgo } from '@vueuse/core'
import { useUser } from '@/stores/user'
import { isEmpty } from 'lodash'

import { onClickOutside } from '@vueuse/core'

import { notify } from '@/components/AppNotification'
import { supabase } from '@/config/supabase'

import AppButton from '@/components/AppButton.vue'
import AppConfirm from '@/components/AppConfirm.vue'

const props = defineProps<{
  review: any
  type?: 'full' | 'minimized'
  hideComment?: boolean
}>()

const emit = defineEmits(['clicked', 'reload'])
const user = useUser().user

const comment = ref(false)
const replyComment = ref(false)
const commentToReply: Ref<number | null> = ref(null)
const newComment = ref('')
const toDelete = ref(false)
const seeReplies = ref(false)
const loading = ref(false)

const target = ref(null)

const commentImages = computed(() => {
  if (props.review.comments_count === 0) return []
  else
    return props.review.comments
      .map((item: any) => {
        if (item.profile_img) {
          return item.profile_img
        } else
          return 'https://res.cloudinary.com/domingo-bucket/image/upload/v1720696031/AreaFinder/u7xe8hxb4ci93qhoz7xd.png'
      })
      .splice(0, 4)
})

const addNewComment = async function () {
  loading.value = true

  try {
    const { error } = await supabase
      .from('comments')
      .insert({ profile_id: user.id, text: newComment.value, reviews_id: props.review.review_id })

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

const replyCommentFunction = function (item: any, index: number) {
  replyComment.value = true
  commentToReply.value = index
  newComment.value = '@' + item.profile_username.replace(/''/g, '')
}

const showNotification = function () {
  notify({
    content: 'You cannot edit an already approved review',
    position: 'top-center',
    type: 'warning'
  })
}

const deleteReview = async function () {
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', props.review.review_id)

    if (error) throw Error(error.message)

    toDelete.value = false
    notify({ content: 'Review Deleted', position: 'top-center', type: 'success' })
    emit('reload')
  } catch (err) {
    console.log(err)
    notify({ content: err, position: 'top-center', type: 'top-center' })
  }
}

const like = async function (review: typeof props.review) {
  if (isEmpty(user.id)) {
    notify({ content: 'You need to login', type: 'info', position: 'top-center' })
    return
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
        .eq('id', review.review_id)
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
        .eq('id', review.review_id)
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
      .eq('id', review.review_id)
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
        .eq('id', review.review_id)
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
        .eq('id', review.review_id)
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
      .eq('id', review.review_id)
      .select('dislikes')

    if (error) throw Error(error.message as any)

    notify({ content: 'Comment disliked', type: 'success', position: 'top-center' })

    review.dislikes = [...data[0].dislikes]
  } catch (error) {
    console.log(error)
    notify({ content: 'Please try again', type: 'error', position: 'top-center' })
  }
}

const likeComment = async function (item: any) {
  if (isEmpty(user.id)) {
    notify({ content: 'You need to login', type: 'info', position: 'top-center' })
    return
  }

  if (item.dislikes.includes(user.id)) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({
          dislikes: item.dislikes.filter((id: string) => {
            if (id !== user.id) {
              return id
            }
          })
        })
        .eq('id', item.id)
        .select('dislikes')

      if (error) throw Error(error.message as any)

      item.dislikes = [...data[0].dislikes]
    } catch (error) {
      console.log(error)
      notify({ content: 'Please try again', type: 'error', position: 'top-center' })
      return
    }
  }

  if (item.likes.includes(user.id)) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({
          likes: item.likes.filter((id: string) => {
            if (id !== user.id) {
              return id
            }
          })
        })
        .eq('id', item.id)
        .select('likes')

      if (error) throw Error(error.message as any)

      notify({ content: 'Comment unliked', type: 'success', position: 'top-center' })
      item.likes = [...data[0].likes]
    } catch (error) {
      console.log(error)
      notify({ content: 'Please try again', type: 'error', position: 'top-center' })
    }
    return
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .update({ likes: [...item.likes, user.id] })
      .eq('id', item.id)
      .select('likes')

    if (error) throw Error(error.message as any)

    notify({ content: 'Comment liked', type: 'success', position: 'top-center' })

    console.log(item.likes)
    item.likes = [...data[0].likes]
  } catch (error) {
    console.log(error)
    notify({ content: 'Please try again', type: 'error', position: 'top-center' })
  }
}

const dislikeComment = async function (item: any) {
  if (isEmpty(user.id)) {
    notify({ content: 'You need to login', type: 'info', position: 'top-center' })
    return
  }

  if (item.likes.includes(user.id)) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({
          likes: item.likes.filter((id: string) => {
            if (id !== user.id) {
              return id
            }
          })
        })
        .eq('id', item.id)
        .select('likes')

      if (error) throw Error(error.message as any)

      item.likes = [...data[0].likes]
    } catch (error) {
      console.log(error)
      notify({ content: 'Please try again', type: 'error', position: 'top-center' })
      return
    }
  }

  if (item.dislikes.includes(user.id)) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({
          dislikes: item.dislikes.filter((id: string) => {
            if (id !== user.id) {
              return id
            }
          })
        })
        .eq('id', item.id)
        .select('dislikes')

      if (error) throw Error(error.message as any)

      notify({ content: 'Comment undisliked', type: 'success', position: 'top-center' })
      item.dislikes = [...data[0].dislikes]
    } catch (error) {
      console.log(error)
      notify({ content: 'Please try again', type: 'error', position: 'top-center' })
    }
    return
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .update({ dislikes: [...item.dislikes, user.id] })
      .eq('id', item.id)
      .select('dislikes')

    if (error) throw Error(error.message as any)

    notify({ content: 'Comment disliked', type: 'success', position: 'top-center' })

    item.dislikes = [...data[0].dislikes]
  } catch (error) {
    console.log(error)
    notify({ content: 'Please try again', type: 'error', position: 'top-center' })
  }
}
onClickOutside(target, (event) => {
  if (event.target instanceof HTMLElement) {
    if (isEmpty((event.target!.parentNode!).parentNode!.id!)) {
      comment.value = false
    }
  }
})
</script>
<template>
  <div
    class="mb-[10px] py-[16px]"
    :class="hideComment ? 'cursor-pointer' : ''"
    @click="hideComment ? emit('clicked', review) : ''"
  >
    <div class="mb-2" v-if="hideComment">
      <h1 class="text-xl capitalize">
        {{ review.area_name }}, {{ review.area_lga }}
      </h1>
    </div>
    <div class="flex justify-between">
      <div class="flex md:items-center gap-[8px]">
        <img
          :src="review.profile_img"
          class="w-[42px] h-[42px] border-4 border-[#E5EDF5] dark:border-[#212327] rounded"
          :class="{ '!w-[32px] !h-[32px]' : hideComment }"
          v-if="review.profile_img && !review.anon"
        />
        <img
          src="@/assets/imgs/avataaars.png"
          class="w-[42px] h-[42px] border-4 border-[#E5EDF5] dark:border-[#212327] rounded"
          :class="{ '!w-[32px] !h-[32px]' : hideComment }"
          v-else
        />
        <div class="flex flex-col gap-1" :class="{ '!flex-row !items-center !gap-4' : hideComment }">
          <div class="flex gap-4">
            {{ review.anon ? 'Annon User' : review.profile_username.replace(/"/g, '') }}
            <b
              class="text-[12px] text-[#3366FF] bg-[#3366FF]/10 border-2 border-[#3366FF] rounded py-[3px] px-[8px]"
              v-if="review.profile_role === 'ADMIN'"
            >
              Admin
            </b>
          </div>
          <div class="flex items-start md:gap-[8px] text-[14px]">
            <div class="">
              <div class="flex flex-col md:flex-row md:gap-3">
                <span class="block text-[14px] opacity-60 capitalize">{{
                  formatTime(review.review_created_at)
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
      {{ review.review_text }}
    </p>
    <div class="flex gap-5" v-if="!hideComment">
      <div
        class="rounded border border-[#B2C1E6] dark:border-[#383B43] p-2 flex items-center gap-3"
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
            fill="#D14343"
          />
        </svg>
      </div>

      <button
        class="rounded border border-[#B2C1E6] dark:border-[#383B43] p-2 pr-3 text-sm flex gap-3 items-center cursor-pointer"
        @click="comment = !comment"
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

      <button
        class="border border-[#D14343] p-3 group hover:bg-[#D14343] opacity-65 hover:opacity-100 rounded"
        @click="toDelete = true"
        :disabled="review.approved"
        v-if="review.profile_id === user.id"
      >
        <svg
          width="15"
          height="16"
          viewBox="0 0 15 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M14.026 4H0.51948C0.228571 4 0 4.22 0 4.5C0 4.78 0.228571 5 0.51948 5H1.03896V15C1.03896 15.55 1.50649 16 2.07792 16H12.4675C13.039 16 13.5065 15.55 13.5065 15V5H14.026C14.3169 5 14.5455 4.78 14.5455 4.5C14.5455 4.22 14.3169 4 14.026 4ZM5.19488 13C5.19488 13.55 4.72735 14 4.15592 14C3.58449 14 3.11696 13.55 3.11696 13V7C3.11696 6.45 3.58449 6 4.15592 6C4.72735 6 5.19488 6.45 5.19488 7V13ZM8.31184 13C8.31184 13.55 7.84431 14 7.27288 14C6.70145 14 6.23392 13.55 6.23392 13V7C6.23392 6.45 6.70145 6 7.27288 6C7.84431 6 8.31184 6.45 8.31184 7V13ZM11.4286 13C11.4286 13.55 10.961 14 10.3896 14C9.81818 14 9.35064 13.55 9.35064 13V7C9.35064 6.45 9.81818 6 10.3896 6C10.961 6 11.4286 6.45 11.4286 7V13ZM13.5065 1H9.35065C9.35065 0.45 8.88312 0 8.31169 0H6.23377C5.66234 0 5.19481 0.45 5.19481 1H1.03896C0.467532 1 0 1.45 0 2V3H14.5455V2C14.5455 1.45 14.0779 1 13.5065 1Z"
            class="fill-[#D14343] group-hover:fill-white"
          />
        </svg>
      </button>
    </div>

    <div class="w-full" v-show="comment" :id="'review_'+review.review_id" ref="target">
      <form @submit.prevent="addNewComment()" class="pt-5 w-full" v-if="!isEmpty(user.id)">
        <textarea
          class="text-black dark:text-white bg-primary/10 dark:bg-primary-light/5 border border-primary focus:outline-none rounded p-5 w-full"
          v-model="newComment"
          placeholder="Leave a reply"
          required
        />
        <div class="flex gap-5 justify-end">
          <AppButton
            type="outline"
            size="small"
            class="uppercase"
            mode="button"
            @click="comment = false"
            >cancel</AppButton
          >
          <AppButton type="primary" size="small" class="uppercase" :loading="loading"
            >Reply</AppButton
          >
        </div>
      </form>
    </div>

    <template v-if="review.comments_count > 0">
      <div class="my-2 flex items-center gap-10">
        <div
          class="flex items-center text-primary cursor-pointer"
          @click="hideComment ? '' : (seeReplies = !seeReplies)"
        >
          <svg
            class="transition ease-in-out"
            :class="{ 'rotate-90': seeReplies }"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <g opacity="0.6">
              <path
                d="M9.77266 17.2316C9.54155 17.2316 9.31066 17.142 9.13644 16.9634C8.79377 16.612 8.80044 16.0491 9.15177 15.7065L12.9547 11.9958L9.16044 8.29359C8.8091 7.95093 8.80244 7.38804 9.1451 7.0367C9.48822 6.68515 10.0509 6.67848 10.4022 7.02137L14.8484 11.3596C15.0198 11.5267 15.1164 11.7563 15.1164 11.9958C15.1164 12.2354 15.0198 12.4647 14.8484 12.632L10.3935 16.9787C10.2204 17.1476 9.99644 17.2316 9.77266 17.2316Z"
                class="fill-[#14161A] dark:fill-text-dark"
              />
            </g>
          </svg>
          {{ seeReplies ? 'Hide' : 'Show' }} Replies
        </div>
        <div class="transition ease-in-out" v-show="!seeReplies">
          <img
            :src="img"
            class="w-[26px] h-[26px] inline-block -ml-2 border border-[#E5EDF5] dark:border-[#212327] rounded"
            v-for="(img, index) in commentImages"
            :key="index"
          />
        </div>
      </div>

      <div
        class="flex flex-col gap-5 border-l border-[#B2C1E6] dark:border-[#383B43] ml-3 p-3 transition-all ease-in-out"
        v-show="seeReplies"
      >
        <div
          class="border-b border-[#B2C1E6] dark:border-[#383B43] pb-2"
          v-for="(item, index) in review.comments"
          :key="index"
        >
          <div class="flex items-center justify-between">
            <div class="flex md:items-center gap-[8px]">
              <img
                :src="item.profile_img"
                class="w-[24px] h-[24px] p-1 bg-[#E5EDF5] dark:bg-[#212327] rounded"
                v-if="item.profile_img && !review.anon"
              />
              <img
                src="@/assets/imgs/avataaars.png"
                class="w-[24px] h-[24px] p-1 bg-[#E5EDF5] dark:bg-[#212327] rounded"
                v-else
              />
              <div class="flex flex-col gap-1">
                <div class="flex gap-4">
                  {{ item.profile_username.replace(/"/g, '') }}
                </div>
              </div>
            </div>

            <div class="flex items-start md:gap-[8px] text-[14px]">
              <div class="">
                <div class="flex flex-col md:flex-row md:gap-3">
                  <span class="block text-[14px] opacity-60 capitalize">{{
                    formatTime(item.created_at)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
          <p class="my-2">{{ item.text }}</p>

          <div class="flex gap-5">
            <div
              class="rounded border border-[#B2C1E6] dark:border-[#383B43] p-1 flex items-center gap-3"
              :class="{ 'bg-primary/10 dark:bg-[#212327]': item.likes.includes(user.id) }"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                v-if="item.likes.includes(user.id)"
                @click="likeComment(item)"
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
                @click="likeComment(item)"
                v-else
              >
                <g opacity="0.6">
                  <path
                    d="M12 2C6.47727 2 2 6.47727 2 12C2 17.5227 6.47727 22 12 22C17.5227 22 22 17.5227 22 12C22 6.47727 17.5227 2 12 2ZM12 3.81818C16.5186 3.81818 20.1818 7.48136 20.1818 12C20.1818 16.5186 16.5186 20.1818 12 20.1818C7.48136 20.1818 3.81818 16.5186 3.81818 12C3.81818 7.48136 7.48136 3.81818 12 3.81818ZM12 6.83754C11.7719 6.83754 11.544 6.92254 11.3679 7.09322L8.18608 10.1738C8.00199 10.352 7.90909 10.59 7.90909 10.8272C7.90909 11.055 7.99386 11.2834 8.16477 11.4602C8.51386 11.8207 9.08983 11.8302 9.45028 11.4806L11.0909 9.8924V16.2534C11.0909 16.7556 11.4982 17.1625 12 17.1625C12.5018 17.1625 12.9091 16.7552 12.9091 16.2534V9.89151L14.5497 11.4798C14.9102 11.8288 15.4857 11.8198 15.8352 11.4593C16.1843 11.098 16.1748 10.5225 15.8139 10.1738L12.6321 7.09322C12.456 6.92254 12.2281 6.83754 12 6.83754Z"
                    fill="currentColor"
                  />
                </g>
              </svg>

              {{ item.likes.length }}

              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                class="cursor-pointer"
                @click="dislikeComment(item)"
                v-if="!item.dislikes.includes(user.id)"
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
                @click="dislikeComment(item)"
                class="cursor-pointer rotate-180"
              >
                <path
                  d="M22 12C22 17.5227 17.5227 22 12 22C6.47727 22 2 17.5227 2 12C2 6.47727 6.47727 2 12 2C17.5227 2 22 6.47727 22 12ZM11.0909 16.2536C11.0909 16.7555 11.4982 17.1627 12 17.1627C12.5018 17.1627 12.9091 16.7555 12.9091 16.2536V9.89182L14.5495 11.48C14.91 11.8295 15.4859 11.82 15.835 11.4595C16.1845 11.0982 16.1755 10.5223 15.8141 10.1741L12.6323 7.09318C12.28 6.75182 11.72 6.75182 11.3677 7.09318L8.18591 10.1741C8.00182 10.3523 7.90909 10.5895 7.90909 10.8273C7.90909 11.055 7.99409 11.2832 8.165 11.46C8.51455 11.8205 9.09 11.8295 9.45046 11.4805L11.0909 9.89182V16.2536Z"
                  fill="#D14343"
                />
              </svg>
            </div>

            <button
              class="rounded border border-[#B2C1E6] dark:border-[#383B43] p-1 pr-3 text-sm flex gap-3 items-center cursor-pointer"
              @click="replyCommentFunction(item, index)"
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

          <div class="w-full" :id="'id_'+index" v-show="replyComment && commentToReply === index" ref="target">
            <form @submit.prevent="addNewComment()" class="pt-5 w-full" v-if="!isEmpty(user.id)">
              <textarea
                class="text-black dark:text-white bg-primary/10 dark:bg-primary-light/5 border border-primary focus:outline-none rounded p-5 w-full"
                v-model="newComment"
                placeholder="Leave a reply"
                required
              />
              <div class="flex gap-5 justify-end">
                <AppButton
                  type="outline"
                  size="small"
                  class="uppercase"
                  mode="button"
                  @click="
                    replyComment = false;
                    newComment = ''
                  "
                  >cancel</AppButton
                >
                <AppButton type="primary" size="small" class="uppercase" :loading="loading"
                  >Reply</AppButton
                >
              </div>
            </form>
          </div>
        </div>
      </div>
    </template>
  </div>

  <AppConfirm
    :text="`Delete your review on ${review.area_name} - ${toDelete}`"
    heading="Delete Reviews?"
    confirm-button-text="Delete Review"
    type="error"
    @close="toDelete = false"
    v-if="toDelete"
    @done="deleteReview"
  />
</template>
