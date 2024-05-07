<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import AppLoader from '@/components/AppLoader.vue';
import AppError from '@/components/AppError.vue';
import AppButton from '@/components/AppButton.vue';
import { supabase } from '@/config/supabase';

const router = useRouter();
const route = useRoute()

const loading = ref(true)
const err = ref(false)

const verifyEmail = async function () {
  try {
    await supabase.auth.verifyOtp({ token_hash: route.query?.token as string, type: 'email' })
  } catch (error) {
    console.log(error)
    err.value = true
  }

  loading.value = false
}


onMounted(() => {
  verifyEmail()
})
</script>
<template>
  <section class="bg-[#E5EDF5] dark:bg-black flex justify-center items-center h-screen">
    <section class="md:w-1/3 flex flex-col items-center justify-center rounded bg-[#FBFCFE] dark:bg-black-light p-[24px] text-center text-text dark:text-text-dark">
      <AppLoader v-if="loading" />
      <AppError v-else-if="err" />
      <template v-else>
        <svg width="88" height="64" viewBox="0 0 88 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M81.5 0.75C79.75 0.75 78.1875 1.4375 77.0625 2.5625L31.5 48.1875L10.9375 27.5625C9.8125 26.4375 8.25 25.75 6.5 25.75C3.0625 25.75 0.25 28.5625 0.25 32C0.25 33.75 0.9375 35.3125 2.0625 36.4375L27.0625 61.4375C28.1875 62.5625 29.75 63.25 31.5 63.25C33.25 63.25 34.8125 62.5625 35.9375 61.4375L85.9375 11.4375C87.0625 10.3125 87.75 8.75 87.75 7C87.75 3.5625 84.9375 0.75 81.5 0.75Z" fill="#3366FF"/>
        </svg>

        <h2 class="font-[500] text-primary">Your email has been verified</h2>
        <p class="my-5">You can now log in</p>
        <AppButton type="primary" @click="router.push('/login')">LOGIN</AppButton>
      </template>
    </section>
  </section>
</template>