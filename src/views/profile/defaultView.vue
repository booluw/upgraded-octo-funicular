<script lang="ts" setup>
import { computed, ref, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'
import { isEmpty } from 'lodash'
import { onClickOutside, useTitle } from '@vueuse/core'

import { USER_ROUTES } from '@/utils/constants'
import { useUser } from '@/stores/user'

import AppLogo from '@/components/AppLogo.vue'
import AppDropdown from '@/components/AppDropdown.vue'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AppLoader from '@/components/AppLoader.vue'

import IconProfile from '@/components/icons/IconProfile.vue'
import IconLike from '@/components/icons/IconLike.vue'
import IconBookmark from '@/components/icons/IconBookmark.vue'

import AddReview from '@/views/areas/components/AddReviewModal.vue'

const userStore = useUser()
const route = useRoute()
const router = useRouter()

const closeSuggestion = ref(false)
const target = ref(null)
const query = ref({ query: '', name: '', id: '' })
const areas = reactive({ items: [] })
const searchLoading = ref(false)
const newReview = ref(false)

const user = computed(() => {
  return userStore.user
})

const param = computed({
  set(newVal: string) {
    query.value.query = newVal
    if (newVal !== '') closeSuggestion.value = true
  },
  get() {
    return query.value.name || query.value.query
  }
})

const addReview = function () {
  router.go(0)
}

const setPath = function (item: any) {
  query.value.id = item.area_id
  query.value.name = item.area_name
  query.value.query = ''
  closeSuggestion.value = false

  router.push(`/areas/${query.value.id}`)
}

const search = async function () {
  // error.value = false
  if (param.value === '') {
    areas.items = []
    // error.value = true
    return
  }

  searchLoading.value = true

  try {
    const { data, error } = await supabase
      .rpc('search_areas', { search_name: query.value.query })
      .order('area_created_at', { ascending: false })

    if (error) throw Error(error.message ?? error)
    areas.items = data
  } catch (error) {
    console.log(error)
  }

  searchLoading.value = false
}

const handleAction = async function (action: 'logout' | 'profile' | 'reviews') {
  if (action === 'logout') {
    await supabase.auth.signOut()
    userStore.resetUser()

    router.push('/')
  } else if (action === 'reviews') {
    router.push('/profile/reviews')
  } else {
    router.push('/profile')
  }
}

watch(
  query,
  async () => {
    await search()
  },
  { deep: true }
)

onClickOutside(target, () => (closeSuggestion.value = false))
</script>
<template>
  <section class="bg-light dark:bg-black text-text dark:text-text-dark min-h-screen">
    <div
      class="md:w-[100vw] bg-light dark:bg-black flex flex-col items-center mb-[16px] md:mb-[32px] fixed right-0 left-0 z-10 border-b dark:border-gray-700"
    >
      <div class="w-full md:w-page px-[16px] md:px-0">
        <header class="py-[10.5px] flex gap-[10px] md:gap-0 justify-between items-center">
          <div class="flex gap-[10px] md:gap-[42px] items-center">
            <router-link to="/" class="text-text dark:text-text-dark">
              <AppLogo />
            </router-link>
            <form @submit.prevent class="md:w-[770px] block">
              <div class="group relative">
                <AppInput
                  ref="target"
                  v-model="param"
                  type="search"
                  placeholder="Search for a place"
                  class="!bg-white dark:!bg-black-light rounded"
                  required
                >
                  <template #icon>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      class="fill-none text-[#0D2159] dark:text-[#BACAF5]"
                    >
                      <path
                        d="M7.4074 12.1482C10.0256 12.1482 12.1481 10.0257 12.1481 7.40749C12.1481 4.78925 10.0256 2.66675 7.4074 2.66675C4.78916 2.66675 2.66666 4.78925 2.66666 7.40749C2.66666 10.0257 4.78916 12.1482 7.4074 12.1482Z"
                        stroke="currentColor"
                        stroke-width="1.18519"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M13.333 13.3331L10.7552 10.7554"
                        stroke="currentColor"
                        stroke-width="1.18519"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </template>
                </AppInput>

                <div
                  class="absolute top-16 left-0 right-0 z-50 p-1 bg-light dark:bg-icon text-text dark:text-text-dark rounded h-[25vh] overflow-y-auto"
                  v-if="closeSuggestion"
                >
                  <template v-if="areas.items.length !== 0">
                    <button
                      type="none"
                      class="block w-full text-left p-3 cursor-pointer hover:opacity-75 capitalize"
                      :class="item.area_name === query.name ? 'bg-primary rounded' : ''"
                      v-for="(item, index) in areas.items"
                      :key="index"
                      @click.prevent="setPath(item)"
                    >
                      {{ item.area_name }} {{ item.area_lga }}, {{ item.area_state }} state
                    </button>
                  </template>
                  <template v-else>
                    <div
                      class="h-full w-full flex items-center justify-center"
                      v-if="searchLoading"
                    >
                      <AppLoader />
                    </div>
                    <div class="w-full text-center text-sm mt-5" v-else>
                      Your query did not return any result
                    </div>
                  </template>
                </div>
              </div>
            </form>
            <div class="hidden md:flex items-center gap-[16px]">
              <div
                class="flex gap-[8px] pr-[16px] border-r-[2px] !border-[#B2C1E6] dark:!border-[#383B43]"
              >
                <AppButton
                  type="outline"
                  size="small"
                  class="!border-[#B2C1E6] dark:!border-[#383B43] !border-[2px] !rounded-[10px]"
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
              </div>
              <AppButton
                type="primary"
                class="uppercase font-[500]"
                size="small"
                @click="newReview = true"
                :disabled="isEmpty(user.username)"
                >submit review</AppButton
              >
            </div>
          </div>
          <AppDropdown
            :menu="[
              { text: 'my reviews', icon: IconLike },
              { text: 'bookmarks', icon: IconBookmark },
              { text: 'profile', icon: IconProfile },
              'logout'
            ]"
            position="bottom"
            @action="handleAction"
            v-if="!isEmpty(user.id)"
          >
            <div class="flex items-center gap-[13px]">
              <img
                :src="user.img"
                class="w-[40px] h-[40px] rounded-[8px] border-[2px] border-white dark:border-text"
                v-if="user.img"
              />
              <img
                src="@/assets/imgs/avataaars.png"
                class="rounded-full w-[32px] h-[32px] border-[2px] border-white dark:border-text"
                v-else
              />
            </div>
          </AppDropdown>
          <AppButton
            type="outline"
            size="small"
            class="font-[700] uppercase"
            @click="router.push('?action=login')"
            v-else
          >
            Login
          </AppButton>
        </header>
      </div>
      <div class="w-full md:w-page px-5 md:px-0 flex gap-5">
        <router-link
          :to="'/profile/' + link.path"
          exact-active-class="border-b-4 text-text-dark"
          :class="
            route.path.includes(link.path)
              ? link.path === ''
                ? '!border-primary font-[600]'
                : '!border-primary font-[600]'
              : ''
          "
          class="!text-icon dark:!text-primary-light flex items-center gap-3 p-2   transition-colors ease-in-out"
          v-for="(link, index) in USER_ROUTES"
          :key="index"
        >
          {{ link.title }}
        </router-link>
      </div>
    </div>

    <div class="w-full h-full">
      <div
        class="w-full h-full bg-white dark:bg-[#14161A] py-10 pt-36 px-5 md:px-10"
      >
        <router-view />
      </div>
    </div>
    <AddReview v-if="newReview" @close="newReview = false" @done="addReview" />
  </section>
</template>
