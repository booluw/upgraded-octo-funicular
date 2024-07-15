<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { isEmpty } from 'lodash'
import { supabase } from '@/config/supabase'
import { useUser } from '@/stores/user'
import { storeToRefs } from 'pinia'

import { onClickOutside } from '@vueuse/core'

import AppLogo from '@/components/AppLogo.vue'
import AppDropdown from '@/components/AppDropdown.vue'
import IconProfile from '@/components/icons/IconProfile.vue'
import IconLike from '@/components/icons/IconLike.vue'
import IconBookmark from '@/components/icons/IconBookmark.vue'
import AppLogin from './components/AppLogin.vue'
import AppButton from './components/AppButton.vue'
import AddReviewModal from '@/views/areas/components/AddReviewModal.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUser()
const target = ref(null)
const addReview = ref(false)
const { theme } = storeToRefs(userStore)

const user = computed(() => {
  return userStore.user
})

onClickOutside(target, () => {
  router.push(route.path)
})

const handleAction = async function (action: 'logout' | 'profile' | 'reviews') {
  if (action === 'logout') {
    await supabase.auth.signOut()
    userStore.resetUser()
    router.push('/')
  } else if (action === 'profile') {
    router.push('/profile')
  } else {
    router.push('/profile/reviews')
  }
}

onMounted(() => {
  // Handle dark theme based on system preference
  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark') // fix: when ready for prod
  } else {
    document.documentElement.classList.remove('dark')
  }
})

watch(
  theme,
  () => {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark') // fix: when ready for prod
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  { deep: true }
)
</script>

<template>
  <section class="!transition-all !ease-in-out">
    <section
      class="min-h-[100vh] flex justify-center bg-light dark:bg-black text-text dark:text-text-dark"
      v-if="route.name === 'home'"
    >
      <div class="md:w-page px-[16px] md:px-0">
        <header class="py-[10.5px] flex justify-between items-center">
          <router-link to="/" class="text-text dark:text-text-dark">
            <AppLogo />
          </router-link>
          <div class="flex gap-[16px]">
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
                    <rect
                      width="16"
                      height="16"
                      fill="white"
                      transform="translate(3.83203 3.66675)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </AppButton>

            <div
              class="pr-1 border-r-[2px] !border-[#B2C1E6] dark:!border-[#383B43] text-transparent"
            >
              .
            </div>

            <div class="hidden md:block" v-if="!isEmpty(user.id)" @click="addReview = true">
              <AppButton
                type="outline"
                size="small"
                class="font-semibold uppercase border-[2px] mr-2"
                >Submit Review</AppButton
              >
            </div>
            <AppDropdown
              :menu="[
                { text: 'profile', icon: IconProfile },
                { text: 'bookmarks', icon: IconBookmark },
                { text: 'reviews', icon: IconLike },
                'logout'
              ]"
              position="bottom"
              @action="handleAction"
              v-if="!isEmpty(user.id)"
            >
              <div class="mt-2 flex items-center gap-[13px]">
                <span class="hidden md:block">{{ user.username ?? user.email }}</span>
                <img
                  :src="user.img"
                  class="w-[40px] rounded-[8px] border-[2px] border-white dark:border-text"
                  v-if="user.img"
                />
                <img
                  src="@/assets/imgs/avataaars.png"
                  class="rounded-full w-[32px] border-[2px] border-white dark:border-text"
                  v-else
                />
              </div>
            </AppDropdown>
            <div
              class="flex items-center font-[700] text-primary uppercase cursor-pointer hover:opacity-75"
              @click="router.push('?action=login')"
              v-else
            >
              Login
            </div>
          </div>
        </header>
        <RouterView />
      </div>
    </section>
    <RouterView v-else />
    <div
      class="fixed z-[999] top-0 right-0 bottom-0 left-0 bg-[#1D3045]/90 dark:bg-black/90 flex justify-center items-center"
      v-if="route.query.action === 'login'"
    >
      <AppLogin ref="target" @close="router.push(route.path)" />
    </div>
    <AddReviewModal v-if="addReview" @close="addReview = false" />
  </section>
</template>
