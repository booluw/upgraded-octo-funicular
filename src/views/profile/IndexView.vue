<script lang="ts" setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { supabase } from '@/config/supabase'
import { useUser } from '@/stores/user'
import { isEmpty, pick } from 'lodash'
import { notify } from '@/components/AppNotification'

import type { User } from '@/interfaces/user'

import AppLoader from '@/components/AppLoader.vue'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AppError from '@/components/AppError.vue'
import AppUpload from '@/components/AppUpload.vue'
import { uploadToCloudinary } from '@/utils/functions'

const user = useUser()

const loading = ref(false)
const formLoading = ref(false)
const err = ref(false)

const userData = ref({
  ...pick(user.user, ['firstName', 'lastName', 'username', 'location', 'phone_number', 'img'])
})
const userImage = reactive({
  img: [] as any[]
})

const img = computed(() => {
  return (
    userImage.img.map((img) => {
      return URL.createObjectURL(img)
    })[0] || userData.value.img
  )
})

const addImage = function (file: File) {
  userImage.img = [file]
}

const getProfile = async function () {
  loading.value = true

  try {
    const { data, error } = await supabase.from('profile').select('*').eq('id', user.user.id)

    if (error) throw Error(error.message as any)

    user.setUser(data[0])
  } catch (error) {
    console.log(error)
    err.value = true
  }

  loading.value = false
}

const saveProfile = async function () {
  formLoading.value = true

  try {
    if (userImage.img.length !== 0) {
      await uploadToCloudinary(userImage.img[0]).then(async (response) => {
        const { data, error } = await supabase
          .from('profile')
          .update({ ...userData.value, img: response })
          .eq('id', user.user.id)
          .select()

        if (error) throw Error(error.message as any)

        user.setUser(data[0] as User)
      })
    } else {
      const { data, error } = await supabase
        .from('profile')
        .update({ ...userData.value })
        .eq('id', user.user.id)
        .select()

      if (error) throw Error(error.message as any)

      user.setUser(data[0] as User)
    }

    notify({ content: 'Profile updated', type: 'success', position: 'top-center' })
  } catch (error: any) {
    console.log(error)
    notify({ content: error.message ?? error, type: 'error', position: 'top-center' })
  }

  formLoading.value = false
}

onMounted(() => {
  getProfile()
})
</script>
<template>
  <section
    class="h-full flex items-center justify-center bg-transparent text-primary"
    v-if="loading"
  >
    <AppLoader />
  </section>
  <AppError v-else-if="err" />
  <section class="h-full flex flex-col items-center" v-else>
    <div class="md:w-3/5">
      <h1 class="text-icon dark:text-primary-light font-[600] text-2xl">User Profile</h1>
      <p class="">Update your personal details here</p>
      <form
        class="mt-5 shadow p-5 bg-primary-light dark:bg-black rounded mb-10"
        @submit.prevent="saveProfile()"
      >
        <div class="flex justify-between items-start gap-5">
          <img :src="img" class="w-[64px] md:w-[80px] h-auto rounded-full" v-if="!isEmpty(img)" />
          <AppUpload accept="image/*" @file="addImage" />
        </div>
        <div class="md:flex gap-5 my-5">
          <AppInput
            type="text"
            v-model="userData.firstName"
            size="large"
            placeholder="First Name"
            class="w-full"
          />
          <AppInput
            type="text"
            v-model="userData.lastName"
            size="large"
            placeholder="Last Name"
            class="w-full"
          />
        </div>
        <AppInput
          type="text"
          v-model="userData.username"
          size="large"
          placeholder="Username"
          class="w-full"
        />
        <AppInput
          type="text"
          v-model="userData.phone_number"
          size="large"
          placeholder="Phone Number"
          class="w-full my-5"
        />
        <AppInput
          type="text"
          v-model="userData.location"
          size="large"
          placeholder="Location"
          class="w-full"
        />
        <AppButton
          type="primary"
          size="small"
          class="uppercase w-full mt-5"
          mode="submit"
          :loading="formLoading"
        >
          save changes
        </AppButton>
      </form>
    </div>
  </section>
</template>
