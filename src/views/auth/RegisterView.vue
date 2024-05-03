<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'

import { notify } from '@/components/AppNotification'
import { supabase } from '@/config/supabase'

const router = useRouter()

const loading = ref(false)
const auth = reactive({ email: '', password: '' })

const registerUser = async function () {
  loading.value = true

  try {
    const { error } = await supabase.auth.signUp({
      ...auth
    })

    if (error) {
      throw Error(error as any)
    }

    notify({ content: 'Account created', position: 'top-center', type: 'success' })

    setTimeout(() => {
      router.push('/login')
    }, 5000)
  } catch (error) {
    console.log(error)
    notify({ content: 'An error occured, please try again', position: 'top-center', type: 'error' })
  }

  loading.value = false
}
</script>
<template>
  <section class="bg-[#1D3045] dark:bg-black flex justify-center items-center h-screen">
    <section
      class="md:w-1/3 rounded bg-[#FBFCFE] dark:bg-black-light p-[24px] text-center text-text dark:text-text-dark"
    >
      <h1 class="text-[20px] font-[500]">Create An Account</h1>
      <form class="my-[24px]" @submit.prevent="registerUser()">
        <AppInput type="email" v-model="auth.email" placeholder="E-mail address" required />
        <AppInput
          type="password"
          v-model="auth.password"
          placeholder="Password"
          required
          class="mt-5"
        />
        <AppButton type="primary" mode="submit" class="w-full mt-5" :loading="loading">
          Register Account
        </AppButton>
        <div class="mt-10">
          Don't have an account?
          <router-link to="login" class="text-primary font-[500]">Log In</router-link>
        </div>
      </form>
    </section>
  </section>
</template>
