<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'

import { notify } from '@/components/AppNotification'
import { supabase } from '@/config/supabase'

const router = useRouter()

const loading = ref(false)
const auth = reactive({ email: '', password: '', username: '' })
const validate = reactive({ email: false, password: false, username: false })

const registerUser = async function () {
  if (!validate.email || !validate.password || !validate.username) return

  loading.value = true

  try {
    const { error } = await supabase.auth.signUp({
      email: auth.email,
      password: auth.password,
      options: {
        data: {
          display_name: auth.username
        }
      }
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
    notify({ content: error.message, position: 'top-center', type: 'error' })
  }

  loading.value = false
}
</script>
<template>
  <section class="bg-[#E5EDF5] dark:bg-black flex justify-center items-center h-screen">
    <section
      class="md:w-1/3 rounded bg-[#FBFCFE] dark:bg-black-light p-[24px] text-center text-text dark:text-text-dark"
    >
      <h1 class="text-[20px] font-[500]">Sign Up</h1>
      <form class="my-[24px]" @submit.prevent="registerUser()">
        <AppInput
          type="text"
          label="Username"
          v-model="auth.username"
          rules="required"
          regex="\b([A-Za-z]){1}(\w){7,29}\b"
          placeholder="Username"
          class="mb-5"
          @valid="validate.username = true"
          @invalid="validate.username = false"
        />
        <AppInput
          type="email"
          v-model="auth.email"
          rules="required|email"
          placeholder="E-mail address"
          @valid="validate.email = true"
          @invalid="validate.email = false"
        />
        <AppInput
          type="password"
          v-model="auth.password"
          rules="required"
          regex="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{7,}$"
          placeholder="Password"
          class="mt-5"
          @valid="validate.password = true"
          @invalid="validate.password = false"
        />
        <AppButton type="primary" mode="submit" class="w-full mt-5 uppercase" :loading="loading">
          Sign Up
        </AppButton>
        <div class="mt-10">
          Already have an account?
          <router-link to="login" class="text-primary font-[500] underline">Log In</router-link>
        </div>
      </form>
    </section>
  </section>
</template>
