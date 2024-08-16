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
    <div class="md:w-page">
      <h1 class="text-icon dark:text-primary-light font-[600] text-2xl">Profile Information</h1>
      <form
        class="mt-5 rounded mb-10"
        @submit.prevent="saveProfile()"
      >
        <div class="flex flex-col md:flex-row md:justify-between gap-10 border-b-2 border-[#F3F7FE] dark:border-light/20 pb-5">
          <div class="">
            <h3 class="font-[500]">Your Photo*</h3>
            <p class="">This will be displayed on your profile.</p>
          </div>
          <div class="flex justify-between gap-5 md:w-2/3">
            <div class="border-2 border-[#F3F7FE] dark:border-black-light bg-[#F3F7FE] dark:bg-light/10 flex items-center justify-center text-center px-7 rounded">
              <img :src="img" class="w-[64px] h-auto rounded" v-if="isEmpty(img)" />
              <div class="w-[64px] text-3xl font-[500]" v-else>
                {{ userData.firstName.split('')[0] }} {{ userData.lastName.split('')[0] }}
              </div>
            </div>
            <AppUpload accept="image/*" @file="addImage" />
          </div>
        </div>

        <div class="flex flex-col md:flex-row md:justify-between gap-10 border-b-2 border-[#F3F7FE] dark:border-light/20 py-5">
          <div class="">
            <h3 class="font-[500]">Name</h3>
          </div>
          <div class="flex flex-col md:flex-row gap-3 md:gap-5 my-5 md:w-2/3">
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
        </div>
        
        <div class="flex flex-col md:flex-row md:justify-between gap-10 border-b-2 border-[#F3F7FE] dark:border-light/20 py-5">
          <div class="">
            <h3 class="font-[500]">Username</h3>
          </div>
          <AppInput
            type="text"
            v-model="userData.username"
            size="large"
            class="md:w-2/3"
          />
        </div>

        <div class="flex flex-col md:flex-row md:justify-between gap-10 border-b-2 border-[#F3F7FE] dark:border-light/20 py-5">
          <div class="">
            <h3 class="font-[500]">Phone Number</h3>
          </div>
          <AppInput
            type="text"
            v-model="userData.phone_number"
            size="large"
            class="md:w-2/3"
          />
        </div>

        <div class="flex flex-col md:flex-row md:justify-between gap-10 border-b-2 border-[#F3F7FE] dark:border-light/20 py-5">
          <div class="">
            <h3 class="font-[500]">Location</h3>
          </div>
          <AppInput
            type="text"
            v-model="userData.location"
            size="large"
            class="md:w-2/3"
          />
        </div>

        <div class="flex gap-5 justify-end mt-5">
          <AppButton
            type="outline"
            size="small"
            class="uppercase"
            mode="button"
            :loading="formLoading"
          >
            cancel
          </AppButton>
          <AppButton
            type="primary"
            size="small"
            class="uppercase"
            mode="submit"
            :loading="formLoading"
          >
            save changes
          </AppButton>
        </div>
      </form>
    </div>
  </section>
</template>
