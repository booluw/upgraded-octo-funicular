<script lang="" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'
import { notify } from '@/components/AppNotification'

import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'

const router = useRouter()
const loading = ref(false)
const auth = reactive({
  password: '',
  password2: ''
})
const validate = reactive({
  password: false,
  password2: false
})

const resetPassword = async function () {
  if (!validate.password || !validate.password2) return

  loading.value = true

  try {
    const { error } = await supabase.auth.updateUser({
      password: auth.password
    })

    if (error) {
      throw Error(error.message ?? error)
    }

    notify({
      content: 'Password updated',
      position: 'top-center',
      type: 'success'
    })

    router.push('/login')
  } catch (error) {
    notify({
      content: error,
      position: 'top-center',
      type: 'error'
    })
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
      <form class="" @submit.prevent="resetPassword()">
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
        <AppInput
          type="password"
          v-model="auth.password2"
          rules="required"
          placeholder="Password"
          :same-as="auth.password"
          class="mt-5"
          @valid="validate.password2 = true"
          @invalid="validate.password2 = false"
        />
        <AppButton type="primary" mode="submit" class="w-full mt-5 uppercase" :loading="loading">
          reset password
        </AppButton>
      </form>
    </section>
  </section>
</template>
