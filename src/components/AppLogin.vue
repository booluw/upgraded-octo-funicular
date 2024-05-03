<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'

import { notify } from './AppNotification'
import { supabase } from '@/config/supabase'
import { useUser } from '@/stores/user'
import type { User } from '@/interfaces/user'

const router = useRouter()
const loading = ref(false)
const auth = reactive({ email: '', password: '' })

const logUserIn = async function () {
  loading.value = true
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ ...auth })

    if (error) {
      throw Error(error as any)
    }

    useUser().setUserId(data.user.id)
    const { data: profile, error: err } = await supabase
      .from('profile')
      .select()
      .eq('id', data.user.id)

    if (err) {
      notify({
        content: 'Sorry, we could not fetch your profile, log in again',
        position: 'top-center',
        type: 'error'
      })
      loading.value = false
      return
    }

    useUser().setUser(profile[0] as User)

    router.push('/')
  } catch (error) {
    console.log(error)
    notify({ content: 'An error occurred', position: 'top-center', type: 'error' })
  }
  loading.value = false
}
</script>
<template>
  <section
    class="md:w-1/3 rounded bg-[#FBFCFE] dark:bg-black-light p-[24px] text-center text-text dark:text-text-dark"
  >
    <h1 class="text-[20px] font-[500]">Welcome Back</h1>
    <form class="my-[24px]" @submit.prevent="logUserIn()">
      <AppInput type="email" v-model="auth.email" placeholder="E-mail address" required />
      <AppInput
        type="password"
        v-model="auth.password"
        placeholder="Password"
        required
        class="mt-5"
      />
      <AppButton type="primary" mode="submit" class="w-full mt-5" :loading="loading">
        LOGIN
      </AppButton>
      <div class="mt-10">
        Don't have an account?
        <router-link to="/sign-up" class="text-primary font-[500]">Sign Up</router-link>
      </div>
    </form>
  </section>
</template>
