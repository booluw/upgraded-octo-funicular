<script lang="ts" setup>
import { ref } from 'vue'
import { useUser } from '@/stores/user'

import { supabase } from '@/config/supabase'
import { notify } from '@/components/AppNotification'

import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import AppLogo from '@/components/AppLogo.vue'

const userStore = useUser()

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
  <section class="h-screen bg-[#E5EDF5] dark:bg-black-light">
    <header class="py-[10.5px] flex justify-center items-center">
      <div class="md:w-page flex justify-between items-center">
        <router-link to="/" class="text-text dark:text-text-dark">
          <AppLogo />
        </router-link>
        <AppButton
          type="outline"
          size="small"
          class="p-[8px] !border-[#B2C1E6] dark:!border-[#383B43] !border-[2px] !rounded-[10px] cursor-pointer"
          @click="userStore.setTheme(userStore.theme === 'light' ? 'dark' : 'light')"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.6">
              <g clip-path="url(#clip0_8434_2968)">
                <mask id="path-1-inside-1_8434_2968" fill="white">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M11.832 18.1667L11.832 11.6667L11.832 5.16675C8.24218 5.16675 5.33203 8.0769 5.33203 11.6667C5.33203 15.2566 8.24218 18.1667 11.832 18.1667ZM11.832 3.66675C16.2503 3.66675 19.832 7.24847 19.832 11.6667C19.832 13.8759 18.9366 15.8759 17.4889 17.3236C16.0412 18.7713 14.0412 19.6667 11.832 19.6667C7.41375 19.6667 3.83203 16.085 3.83203 11.6667C3.83203 7.24847 7.41375 3.66675 11.832 3.66675Z"
                  />
                </mask>
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M11.832 18.1667L11.832 11.6667L11.832 5.16675C8.24218 5.16675 5.33203 8.0769 5.33203 11.6667C5.33203 15.2566 8.24218 18.1667 11.832 18.1667ZM11.832 3.66675C16.2503 3.66675 19.832 7.24847 19.832 11.6667C19.832 13.8759 18.9366 15.8759 17.4889 17.3236C16.0412 18.7713 14.0412 19.6667 11.832 19.6667C7.41375 19.6667 3.83203 16.085 3.83203 11.6667C3.83203 7.24847 7.41375 3.66675 11.832 3.66675Z"
                  class="fill-[#212327] dark:fill-[#E5EDF5]"
                />
                <path
                  d="M11.832 11.6667H10.332H11.832ZM11.832 18.1667V19.6667H13.332V18.1667H11.832ZM11.832 5.16675L13.332 5.16675V3.66675H11.832V5.16675ZM17.4889 17.3236L18.5495 18.3843L17.4889 17.3236ZM10.332 11.6667L10.332 18.1667H13.332L13.332 11.6667H10.332ZM10.332 5.16675L10.332 11.6667H13.332L13.332 5.16675L10.332 5.16675ZM11.832 3.66675C7.41375 3.66675 3.83203 7.24847 3.83203 11.6667H6.83203C6.83203 8.90532 9.07061 6.66675 11.832 6.66675V3.66675ZM3.83203 11.6667C3.83203 16.085 7.41375 19.6667 11.832 19.6667V16.6667C9.07061 16.6667 6.83203 14.4282 6.83203 11.6667H3.83203ZM21.332 11.6667C21.332 6.42004 17.0787 2.16675 11.832 2.16675V5.16675C15.4219 5.16675 18.332 8.0769 18.332 11.6667H21.332ZM18.5495 18.3843C20.2671 16.6667 21.332 14.2897 21.332 11.6667H18.332C18.332 13.4621 17.6061 15.085 16.4282 16.2629L18.5495 18.3843ZM11.832 21.1667C14.455 21.1667 16.832 20.1018 18.5495 18.3843L16.4282 16.2629C15.2503 17.4409 13.6274 18.1667 11.832 18.1667V21.1667ZM2.33203 11.6667C2.33203 16.9135 6.58533 21.1667 11.832 21.1667V18.1667C8.24218 18.1667 5.33203 15.2566 5.33203 11.6667H2.33203ZM11.832 2.16675C6.58533 2.16675 2.33203 6.42004 2.33203 11.6667H5.33203C5.33203 8.0769 8.24218 5.16675 11.832 5.16675V2.16675Z"
                  mask="url(#path-1-inside-1_8434_2968)"
                  class="fill-[#212327] dark:fill-[#E5EDF5]"
                />
              </g>
            </g>
            <defs>
              <clipPath id="clip0_8434_2968">
                <rect width="16" height="16" fill="white" transform="translate(3.83203 3.66675)" />
              </clipPath>
            </defs>
          </svg>
        </AppButton>
      </div>
    </header>
    <section class="flex justify-center items-center h-[88vh]">
      <section class="md:w-1/3 rounded p-[24px] text-center text-text dark:text-text-dark">
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
  </section>
</template>
