<script lang="ts" setup>
import { ref } from 'vue'

import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import { supabase } from '@/config/supabase'
import { notify } from '@/components/AppNotification'

const loading = ref(false)
const email = ref('')
const validate = ref(false)
const submitted = ref(false)

const recoverPassword = async function () {
  if (!validate.value) return

  loading.value = true

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: 'https://spotta-ng.netlify.app//update-pw'
    })

    if (error) {
      notify({
        content: error,
        position: 'top-center',
        type: 'error'
      })

      loading.value = false
      return
    }

    submitted.value = true
  } catch (error) {
    console.log(error)
  }

  loading.value = false
}
</script>
<template>
  <section class="bg-[#E5EDF5] dark:bg-black flex justify-center items-center h-screen">
    <section
      class="md:w-1/3 rounded bg-[#FBFCFE] dark:bg-black-light p-[24px] text-center text-text dark:text-text-dark"
    >
      <h1 class="text-[20px] font-[500]">Reset Password</h1>
      <template v-if="!submitted">
        <p class="my-5">Please, enter your valid e-mail address</p>
        <form class="my-[12px]" @submit.prevent="recoverPassword()">
          <AppInput
            type="email"
            v-model="email"
            placeholder="E-mail address"
            rules="required|email"
            @valid="validate = true"
            @invalid="validate = false"
          />
          <AppButton type="primary" mode="submit" class="w-full mt-5" :loading="loading">
            GET RECOVERY LINK
          </AppButton>
          <div class="mt-5">
            Already have an account?
            <router-link to="login" class="text-primary font-[500] underline">Log In</router-link>
          </div>
        </form>
      </template>
      <template v-else>
        <p class="my-5 opacity-75">
          We have sent a link to {{ email }}, please click on that link to reset your password
        </p>
      </template>
    </section>
  </section>
</template>
