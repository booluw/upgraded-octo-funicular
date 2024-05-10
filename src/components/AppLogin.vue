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
const validate = reactive({ email: false, password: false })

const logUserIn = async function () {
  if (!validate.email || !validate.password) return

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

    notify({
      content: `Welcome back, ${profile[0].username}`,
      position: 'top-center',
      type: 'success'
    })

    useUser().setUser(profile[0] as User)

    if (profile[0].role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch (error: any) {
    console.log(error)
    notify({
      content: error ?? `An error occurred, that's all we know`,
      position: 'top-center',
      type: 'error'
    })
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
      <AppInput
        type="email"
        v-model="auth.email"
        placeholder="E-mail address"
        rules="required|email"
        @valid="validate.email = true"
        @invalid="validate.email = false"
      />
      <AppInput
        type="password"
        v-model="auth.password"
        placeholder="Password"
        rules="required"
        class="mt-5"
        @valid="validate.password = true"
        @invalid="validate.password = false"
      />
      <AppButton type="primary" mode="submit" class="w-full mt-5" :loading="loading">
        LOGIN
      </AppButton>
      <div class="mt-10">
        Don't have an account?
        <router-link to="/sign-up" class="text-primary font-[500] underline">Sign Up</router-link>
      </div>
      <div class="mt-3">
        Forgot your password?
        <router-link to="recover-pw" class="text-primary font-[500] underline">Reset it</router-link>
      </div>
    </form>
  </section>
</template>
