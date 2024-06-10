<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'

import { notify } from '@/components/AppNotification'
import { supabase } from '@/config/supabase'

const router = useRouter()
const loading = ref(false)
const registered = ref(false)
const auth = reactive({ email: '', password: '', username: '', firstName: '', lastName: '' })
const validate = reactive({
  email: false,
  password: false,
  username: false,
  firstName: false,
  lastName: false
})

const usernames = ref([])

const registerUser = async function () {
  if (!validate.email || !validate.password || !validate.username) return
  const allUsers: string[] = usernames.value.filter((user: any) => {
    if (user.username.replace(/"/g, '') === auth.username) {
      notify({
        content: `${auth.username} is already taken, choose another`,
        position: 'top-center',
        type: 'error'
      })

      return user.username
    }
  })

  if (allUsers.length !== 0) {
    return
  }

  loading.value = true

  try {
    const { data, error } = await supabase.auth.signUp({
      email: auth.email,
      password: auth.password,
      options: {
        data: {
          display_name: auth.username
        }
      }
    })

    if (error) {
      throw Error(error.message as any)
    }

    if (data?.user?.id) {
      const { error } = await supabase
        .from('profile')
        .update({ firstName: auth.firstName, lastName: auth.lastName, username: auth.username })
        .eq('id', data.user.id)

      if (error) throw Error(error.message)
      router.push('/login')
      registered.value = true
    } else {
      throw Error('No user data available')
    }
  } catch (error: any) {
    console.log(error)
    notify({
      content: error ?? 'An error occurred',
      position: 'top-center',
      type: 'error'
    })
  }

  loading.value = false
}

const getAllUserNames = async function () {
  loading.value = true

  try {
    const { data, error } = await supabase.from('profile').select('username')

    if (error) throw Error(error.message)

    usernames.value = data as unknown as any
  } catch (err) {
    console.log(err)
  }

  loading.value = false
}

onMounted(() => {
  getAllUserNames()
})
</script>
<template>
  <section class="bg-[#E5EDF5] dark:bg-black flex justify-center items-center min-h-[100vh]">
    <section
      v-if="!registered"
      class="md:w-1/3 rounded bg-[#FBFCFE] dark:bg-black-light py-[14px] px-[24px] text-center text-text dark:text-text-dark"
    >
      <h1 class="text-[20px] font-[500]">Sign Up</h1>
      <form class="my-[24px]" @submit.prevent="registerUser()">
        <div class="flex flex-col md:flex-row md:gap-5">
          <AppInput
            type="text"
            label="First Name"
            v-model="auth.firstName"
            rules="required"
            placeholder="First Name"
            class="mb-5"
            @valid="validate.lastName = true"
            @invalid="validate.firstName = false"
          />
          <AppInput
            type="text"
            label="Last Name"
            v-model="auth.lastName"
            rules="required"
            placeholder="Last Name"
            class="mb-5"
            @valid="validate.lastName = true"
            @invalid="validate.lastName = false"
          />
        </div>
        <AppInput
          type="text"
          label="Username"
          v-model="auth.username"
          rules="required"
          regex="\b([A-Za-z]){1}(\w){5,29}\b"
          placeholder="Username (Minimum of 6 Characters)"
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
          label="Password"
          v-model="auth.password"
          rules="required"
          regex="(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7}"
          placeholder="Minimum of 7 characters(uppercase, number and symbol)"
          class="mt-5"
          @valid="validate.password = true"
          @invalid="validate.password = false"
        />
        <AppButton type="primary" mode="submit" class="w-full mt-5 uppercase" :loading="loading">
          Sign Up
        </AppButton>
        <div class="mt-5">
          Already have an account?
          <router-link to="login" class="text-primary font-[500] underline">Log In</router-link>
        </div>
        <div class="mt-3">
          Forgot your password?
          <router-link to="recover-pw" class="text-primary font-[500] underline"
            >Reset it</router-link
          >
        </div>
      </form>
    </section>
    <section
      v-else
      class="md:w-1/3 flex flex-col items-center justify-center rounded bg-[#FBFCFE] dark:bg-black-light p-[24px] text-center text-text dark:text-text-dark"
    >
      <svg
        width="108"
        height="108"
        viewBox="0 0 108 108"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_6405_26977)">
          <path
            d="M0.791123 40.9481L105.094 40.2295L108 108L0 107.042L0.791123 40.9481Z"
            fill="#3366FF"
          />
          <path d="M0.791016 40.9482L53.7414 0L105.094 40.2296" fill="#3366FF" />
          <g opacity="0.3">
            <path opacity="0.3" d="M0.791016 40.9482L53.7414 0L105.094 40.2296" fill="black" />
          </g>
          <path
            d="M-0.000382353 107.042C-0.133542 106.93 8.21633 98.2159 18.6497 87.5783C29.0832 76.9408 37.6367 68.4218 37.7699 68.5415C37.903 68.6613 29.5531 77.3675 19.1197 88.005C8.6863 98.6426 0.132777 107.162 -0.000382353 107.042Z"
            fill="white"
          />
          <path
            d="M107.999 108C107.866 108.112 99.7356 99.5784 89.8426 88.9333C79.9497 78.2883 72.0306 69.5671 72.1638 69.4698C72.2969 69.3725 80.4275 77.8915 90.3204 88.5366C100.213 99.1816 108.132 107.888 107.999 108Z"
            fill="white"
          />
          <g opacity="0.5">
            <path
              opacity="0.5"
              d="M105.094 40.2295L52.7153 80.2195L0.791016 40.9481"
              fill="black"
            />
          </g>
          <path
            d="M6.04728 44.6537L5.89062 15.6605L97.2457 13.5195L98.2405 45.245L52.7157 79.6955L6.04728 44.6537Z"
            fill="#F3F3F3"
          />
          <path
            d="M53.9929 69.2751C41.4524 69.305 31.254 59.6107 31.2227 47.6257C31.2227 46.7872 31.2697 45.9488 31.3715 45.1104C32.7814 33.1927 44.0373 24.6213 56.5151 25.9688C68.9851 27.3162 77.9537 38.0736 76.536 49.9987C75.2357 60.9656 65.5386 69.2601 53.9929 69.2751ZM53.9302 26.6051C41.8206 26.62 32.0059 36.0149 32.0216 47.5882C32.0373 59.1615 41.8676 68.5414 53.9772 68.5265C65.1234 68.5115 74.4837 60.5165 75.7448 49.9388C77.1156 38.4404 68.4759 28.0499 56.4446 26.7323C56.4368 26.7323 56.4289 26.7323 56.4132 26.7323C55.5908 26.6275 54.7605 26.5751 53.9302 26.5602V26.6051Z"
            fill="#3366FF"
          />
          <path
            d="M38.498 50.5676L42.297 46.1209L51.1795 52.2519L65.6155 35.9924L69.9706 39.6531L51.3988 60.1047L38.498 50.5676Z"
            fill="#3366FF"
          />
        </g>
        <defs>
          <clipPath id="clip0_6405_26977">
            <rect width="108" height="108" fill="white" />
          </clipPath>
        </defs>
      </svg>
      <h2 class="text-primary mt-4">Verify E-Mail Address</h2>
      <p class="my-5">
        Thank you for signing up on AreaFinder. In order to keep your account safe and secure, we'll
        need you to verify your e-mail address by clicking the verification link sent to your mail
        box. Thank you!
      </p>
      <a :href="'//' + auth.email.replace(/.*@/, '')" target="_blank">
        <AppButton type="primary" class="uppercase">Go to your mailbox</AppButton>
      </a>
    </section>
  </section>
</template>
