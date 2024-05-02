<script lang="ts" setup>
import AppInput from '@/components/AppInput.vue'
import { ref, reactive } from 'vue'
import AppButton from '@/components/AppButton.vue'

const loading = ref(false)
const auth = reactive({ email: '', password: '' })
</script>
<template>
  <section
    class="md:w-1/3 rounded bg-[#FBFCFE] dark:bg-black-light p-[24px] text-center text-text dark:text-text-dark"
  >
    <h1 class="text-[20px] font-[500]">Welcome Back</h1>
    <form class="my-[24px]" @submit.prevent="">
      <AppInput
        type="email"
        v-model="auth.email"
        placeholder="E-mail address"
        required
      />
      <AppInput
        type="password"
        v-model="auth.password"
        placeholder="Password"
        required
        class="mt-5"
      />
      <AppButton
        type="primary"
        mode="submit"
        class="w-full mt-5"
        :loading="loading"
      >
        LOGIN
      </AppButton>
      <div class="mt-10">
        Don't have an account?
        <router-link to="/sign-up" class="text-primary font-[500]">Sign Up</router-link>
      </div>
    </form>
  </section>
</template>
