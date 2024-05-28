<script lang="ts" setup>
import { ref, onMounted, type Ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { supabase } from '@/config/supabase'
import { useTimeAgo } from '@vueuse/core'
import { useUser } from '@/stores/user'

import AppLoader from '@/components/AppLoader.vue'
import AppButton from '@/components/AppButton.vue'
import { notify } from '@/components/AppNotification'

const route = useRoute()
const user = useUser().user

const loading = ref(false)
const load = ref(false)
const error = ref(false)
const comments: Ref<any[]> = ref([])
const newComment = ref('')

const addNewComment = async function () {
  load.value = true

  try {
    const { error } = await supabase
      .from('comments')
      .insert({ profile_id: user.id, text: newComment.value, reviews_id: route.query.review })

    if (error) throw Error(error.message as any)

    newComment.value = ''
    await getComments()
  } catch (error) {
    console.log(error)
    notify({
      content: `We could not add your comment, please try again`,
      type: 'error',
      position: 'top-center'
    })
  }

  load.value = false
}

const getComments = async function () {
  loading.value = true
  error.value = false

  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profile(*)')
      .eq('reviews_id', route.query.review)

    if (error) throw Error(error.message as any)
    comments.value = data
  } catch (err) {
    console.log(err)
    error.value = true
  }

  loading.value = false
}

onMounted(async () => {
  await getComments()
})

watch(
  route,
  async () => {
    await getComments()
  },
  { deep: true }
)
</script>
<template>
  <section class="h-[80vh] overflow-auto scrollbar">
    <section
      class="h-full flex items-center justify-center bg-transparent text-primary"
      v-if="loading"
    >
      <AppLoader />
    </section>
    <AppError v-else-if="error" />
    <section class="h-full relative" v-else>
      <h2 class="mb-3 text-xl">Comments</h2>
      <div class="h-[78%] overflow-auto scrollbar pr-3">
        <template v-if="comments.length !== 0">
          <div
            class="mb-4 py-2 border-y border-y-primary-light dark:border-y-black"
            v-for="(comment, index) in comments"
            :key="index"
          >
            <div class="flex items-center gap-[8px]">
              <img
                :src="comment.profile.img"
                class="w-[32px] h-[32px] rounded-full border-[2px] border-white dark:border-text"
                v-if="comment.profile.img"
              />
              <img
                src="@/assets/imgs/avataaars.png"
                class="rounded-full w-[32px] h-[32px] border-[2px] border-white dark:border-text"
                v-else
              />
              <div class="flex gap-[8px] text-[14px]">
                {{ comment.anon ? 'Annon User' : comment.profile.username.replace(/"/g, '') }}
                <span class="opacity-60">{{ useTimeAgo(comment.created_at) }}</span>
              </div>
            </div>
            <p class="text-justify my-[8px]">
              {{ comment.text }}
            </p>
          </div>
        </template>
        <div class="text-xl mt-5 opacity-55" v-else>No comments yet, add one</div>
      </div>
      <form
        @submit.prevent="addNewComment()"
        class="py-3 flex gap-5 bg-primary-light dark:bg-black-light border-y border-y-primary-light dark:border-y-black sticky top-0 shadow"
      >
        <input
          class="text-black dark:text-white bg-primary-light/5 focus:outline-none rounded text-lg py-2 px-5 w-2/3"
          type="text"
          v-model="newComment"
          placeholder="Add a comment"
          required
        />
        <AppButton type="primary" size="small" class="w-1/3" :loading="load">Post</AppButton>
      </form>
    </section>
  </section>
</template>
