<script lang="ts" setup>
import { computed, reactive, ref, onMounted, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/stores/user'
import { isEmpty } from 'lodash'

import { useShare } from '@vueuse/core'

import { notify } from '@/components/AppNotification'
import { supabase } from '@/config/supabase'
import { onClickOutside, useTitle } from '@vueuse/core'

import AppLogo from '@/components/AppLogo.vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import AppError from '@/components/AppError.vue'
import AppLoader from '@/components/AppLoader.vue'
import AppDropdown from '@/components/AppDropdown.vue'

import AddReview from './components/AddReviewModal.vue'
import Reviews from './components/Reviews.vue'
import ViewComment from './components/ViewComment.vue'

const route = useRoute()
const router = useRouter()
const user = useUser().user
const userStore = useUser()

const loading = ref(false)
const searchLoading = ref(false)
const error = ref(false)
const scroller = ref(null) as any
const closeSuggestion = ref(false)
const target = ref(null)

const amenity: Ref<{ title: string }[]> = ref([])
const filter: Ref<null | string> = ref(null)

const area = ref({})
const areas = reactive({ items: [] })
const newReview = ref(false)
const reviews = ref(null)
const reviewCount = ref(0)
const allReviews = ref(0)

const title = useTitle()

const comments = ref({
  id: '',
  comments: [] as any[]
})

const query = ref({ query: '', name: '', id: '' })

const amenities = computed(() => {
  if (amenity.value.length === 0) return []

  return amenity.value.map((item) => {
    return item.title
  })
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

const getAllAmenities = async function () {
  try {
    const { data, error } = await supabase.from('amenities').select('title')

    if (error) throw Error(error.message ?? error)
    amenity.value = data
  } catch (err) {
    console.log(err)
    notify({
      content: err ?? `We couldn't fetch Amenities, please reload`,
      type: 'error',
      position: 'top-center'
    })
  }
}

const setPath = function (item: any) {
  query.value.id = item.area_id
  query.value.name = item.area_name
  query.value.query = ''
  closeSuggestion.value = false

  router.push(`/areas/${query.value.id}`)
}

const search = async function () {
  error.value = false
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

const handleClick = function (id: string) {
  comments.value.id = id
}

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

const addReview = function () {
  if (reviews.value !== null) {
    reviews.value.getAllReviews()
  } else {
    getArea()
    router.go(0)
  }
  newReview.value = false
}

const scroll = function () {
  scroller.value.scrollLeft += 430
}

const share = function () {
  const { share, isSupported } = useShare()

  if (isSupported) {
    share({
      title: `See ${area.value.name} on Area Finder`,
      url: location.href
    })

    return
  }

  navigator.clipboard.writeText(window.location.href).then(() => {
    notify({ content: 'Link Copied to clipboard', position: 'top-center', type: 'success' })
  })
}

const getArea = async function () {
  loading.value = true

  try {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .eq('id', route.params.name)
      .limit(1)

    const { count, error: review_error } = await supabase
      .from('reviews')
      .select('*, area(id)', { count: 'exact' })
      .or(`and(area.eq.${route.params.name}, approved.eq.APPROVED)`)

    const { count: allCount } = await supabase
      .from('reviews')
      .select('*, area(id)', { count: 'exact' })
      .or(`and(area.eq.${route.params.name})`)

    reviewCount.value = count as unknown as number
    allReviews.value = allCount as unknown as number

    if (review_error) throw Error(error!.message ?? error)
    if (error) throw Error(error.message ?? error)

    title.value =
      data[0].name.charAt(0).toUpperCase() +
      data[0].name.slice(1) +
      ', ' +
      data[0].lga.charAt(0).toUpperCase() +
      data[0].lga.slice(1) +
      ' - SpottaNG'
    area.value = data[0]
    await getAllAmenities()
  } catch (err) {
    notify({ content: err, position: 'top-center', type: 'error' })
    error.value = true
  }

  loading.value = false
}

watch(
  query,
  async () => {
    await search()
  },
  { deep: true }
)

watch(
  route,
  async () => {
    getArea()
  },
  { deep: true }
)

onMounted(() => {
  getArea()
})

onClickOutside(target, () => (closeSuggestion.value = false))
</script>
<template>
  <section
    class="h-[100vh] flex items-center justify-center bg-primary-light dark:bg-[#14161A] text-primary"
    v-if="loading"
  >
    <AppLoader />
  </section>
  <AppError v-else-if="error" />
  <section
    v-else
    class="min-h-[100vh] md:flex flex-col items-center bg-[#FBFCFE] dark:bg-[#14161A] text-text dark:text-text-dark"
  >
    <div
      class="md:w-[100vw] md:bg-light dark:bg-black flex flex-col items-center mb-[16px] md:mb-[32px] fixed z-10"
    >
      <div class="w-full md:w-page px-[16px] md:px-0">
        <header class="py-[10.5px] flex justify-between items-center">
          <div class="flex gap-[42px] items-center">
            <router-link to="/" class="text-text dark:text-text-dark">
              <AppLogo />
            </router-link>
            <form @submit.prevent class="w-[650px] hidden md:block">
              <div class="group relative">
                <AppInput
                  ref="target"
                  v-model="param"
                  type="search"
                  placeholder="Search for a place"
                  class="!bg-white dark:!bg-black-light"
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
                >
                  <svg
                    width="14"
                    height="16"
                    viewBox="0 0 14 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.20938 0C1.33301 0 0.609375 0.722079 0.609375 1.59844L0.601562 16L7.00156 13.6L13.4016 16V14.8453V1.6C13.4016 0.72555 12.676 0 11.8016 0H2.20938ZM2.20938 1.6H11.8016V13.6906L7.00156 11.8906L2.20312 13.6906L2.20938 1.6Z"
                      class="fill-[#212327] dark:!fill-[#E5EDF5]"
                    />
                  </svg>
                </AppButton>
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
                <AppButton
                  type="outline"
                  size="small"
                  class="!border-[#B2C1E6] dark:!border-[#383B43] !border-[2px] !rounded-[10px]"
                  @click="share()"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.7885 17.2821L16.1042 17.4659L16.3753 17.2209C16.8129 16.8254 17.3762 16.58 18 16.58C19.3339 16.58 20.42 17.6661 20.42 19C20.42 20.3339 19.3339 21.42 18 21.42C16.6661 21.42 15.58 20.3339 15.58 19C15.58 18.8247 15.604 18.6439 15.6464 18.4658L15.7322 18.1053L15.4122 17.9183L8.29224 13.7583L7.97224 13.5713L7.7003 13.8231C7.24562 14.2441 6.65469 14.5 6 14.5C4.61614 14.5 3.5 13.3839 3.5 12C3.5 10.6161 4.61614 9.5 6 9.5C6.65469 9.5 7.24562 9.75589 7.7003 10.1769L7.97196 10.4284L8.29182 10.242L15.3418 6.13196L15.6558 5.94892L15.5786 5.59378C15.531 5.37472 15.5 5.1861 15.5 5C15.5 3.61614 16.6161 2.5 18 2.5C19.3839 2.5 20.5 3.61614 20.5 5C20.5 6.38386 19.3839 7.5 18 7.5C17.3453 7.5 16.7544 7.24411 16.2997 6.82312L16.028 6.57157L15.7082 6.75804L8.65818 10.868L8.34421 11.0511L8.42141 11.4062C8.46903 11.6253 8.5 11.8139 8.5 12C8.5 12.1861 8.46903 12.3747 8.42141 12.5938L8.34415 12.9492L8.65848 13.1321L15.7885 17.2821Z"
                      class="dark:!stroke-[#FBFCFE] stroke-[#14161A]"
                    />
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
            :menu="['profile', 'reviews', 'logout']"
            position="bottom"
            @action="handleAction"
            v-if="!isEmpty(user.id)"
          >
            <div class="flex items-center gap-[13px]">
              <img
                :src="user.img"
                class="w-[32px] h-[32px] rounded-full border-[2px] border-white dark:border-text"
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

        <form @submit.prevent class="block md:hidden">
          <div class="group relative">
            <AppInput
              v-model="param"
              type="search"
              placeholder="Search for a place"
              class="!bg-white dark:!bg-black-light"
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
              class="hidden group-focus-within:block absolute top-16 left-0 right-0 z-50 p-1 bg-light dark:bg-icon text-text dark:text-text-dark rounded h-[25vh] overflow-y-auto"
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
                <div class="h-full w-full flex items-center justify-center" v-if="searchLoading">
                  <AppLoader />
                </div>
                <div class="w-full text-center text-sm mt-5" v-else>
                  Your query did not return any result
                </div>
              </template>
            </div>
          </div>
        </form>

        <div class="mb-[16px]">
          <div class="flex justify-between items-center">
            <div class="md:w-[60%]">
              <h1 class="text-[24px] capitalize">
                {{ area.name }}, {{ area.lga }}, {{ area.state }}
              </h1>
              <h2 class="text-[12px] md:text-[16px]">
                <b>“{{ reviewCount }}” Review{{ reviewCount > 1 ? 's' : '' }}</b>
                (People are raving about the selected location)
              </h2>
            </div>
          </div>
        </div>
        <div class="pb-[16px] flex justify-between items-center">
          <div class="flex gap-[10px] overflow-x-auto scrollbar-none" ref="scroller">
            <div
              class="flex-shrink-0 text-center text-[14px] py-[6px] px-[12px] border-[1.5px] text-[#14161A] border-[#B2C1E6] dark:border-[#383B43] dark:text-[#FBFCFE] bg-transparent rounded-[4px] cursor-pointer hover:opacity-75"
              :class="{
                '!bg-[#14161A] !border-[#B2C1E6] text-[#E5EDF5] dark:!bg-[#FBFCFE] dark:!border-[#383B43] dark:!text-[#212327]':
                  filter === null
              }"
              @click="filter = null"
            >
              All
            </div>
            <div
              class="flex-shrink-0 text-center text-[14px] py-[6px] px-[12px] border-[1.5px] text-[#14161A] border-[#B2C1E6] dark:border-[#383B43] dark:text-[#FBFCFE] bg-transparent rounded-[4px] cursor-pointer hover:opacity-75"
              :class="{
                '!bg-[#14161A] !border-[#B2C1E6] text-[#E5EDF5] dark:!bg-[#FBFCFE] dark:!border-[#383B43] dark:!text-[#212327]':
                  filter === item
              }"
              v-for="(item, i) in amenities"
              @click="filter === item ? (filter = null) : (filter = item)"
              :key="i"
            >
              {{ item }}
            </div>
          </div>
          <div
            class="py-[6px] px-[9px] rounded-full bg-white dark:bg-black-light cursor-pointer hover:opacity-75"
            @click="scroll()"
          >
            <svg
              width="8"
              height="14"
              viewBox="0 0 8 14"
              fill="none"
              class="stroke-black dark:stroke-text-dark"
            >
              <path
                d="M1 13L7 7L1 1"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <div class="flex gap-[16px] pb-5 md:hidden">
          <AppButton
            type="primary"
            class="uppercase font-[500] w-2/3"
            size="small"
            @click="newReview = true"
            :disabled="isEmpty(user.username)"
            >submit review</AppButton
          >
          <AppButton
            type="outline"
            size="small"
            class="!border-[#B2C1E6] dark:!border-[#383B43] !border-[1.5px] !rounded-[10px]"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.4297 19.4047L17.4282 19.4037L13.1301 16.4654C13.1299 16.4652 13.1296 16.4651 13.1294 16.4649C12.7969 16.2361 12.3854 16.1372 12 16.1372C11.6146 16.1372 11.2031 16.2361 10.8706 16.4649C10.8704 16.4651 10.8701 16.4652 10.8699 16.4654L6.57428 19.402C6.54731 19.4199 6.52251 19.4348 6.5 19.447V4.82982C6.5 4.81956 6.50652 4.7514 6.63451 4.66377C6.75912 4.57846 6.95765 4.51 7.1985 4.51H7.42322C7.45966 4.51 7.49186 4.50686 7.51946 4.50261C7.52489 4.50177 7.53016 4.50088 7.5351 4.5H16.4499C16.4549 4.50088 16.4601 4.50177 16.4656 4.50261C16.4932 4.50686 16.5254 4.51 16.5618 4.51H16.7865C17.0269 4.51 17.2264 4.57825 17.354 4.6649C17.4775 4.74873 17.4975 4.81938 17.5 4.84261V19.4487C17.4786 19.4368 17.4552 19.4223 17.4297 19.4047Z"
                class="dark:!stroke-[#FBFCFE] stroke-[#14161A]"
              />
            </svg>
          </AppButton>
          <AppButton
            type="outline"
            size="small"
            class="!border-[#B2C1E6] dark:!border-[#383B43] !border-[1.5px] !rounded-[10px]"
            @click="share()"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.7885 17.2821L16.1042 17.4659L16.3753 17.2209C16.8129 16.8254 17.3762 16.58 18 16.58C19.3339 16.58 20.42 17.6661 20.42 19C20.42 20.3339 19.3339 21.42 18 21.42C16.6661 21.42 15.58 20.3339 15.58 19C15.58 18.8247 15.604 18.6439 15.6464 18.4658L15.7322 18.1053L15.4122 17.9183L8.29224 13.7583L7.97224 13.5713L7.7003 13.8231C7.24562 14.2441 6.65469 14.5 6 14.5C4.61614 14.5 3.5 13.3839 3.5 12C3.5 10.6161 4.61614 9.5 6 9.5C6.65469 9.5 7.24562 9.75589 7.7003 10.1769L7.97196 10.4284L8.29182 10.242L15.3418 6.13196L15.6558 5.94892L15.5786 5.59378C15.531 5.37472 15.5 5.1861 15.5 5C15.5 3.61614 16.6161 2.5 18 2.5C19.3839 2.5 20.5 3.61614 20.5 5C20.5 6.38386 19.3839 7.5 18 7.5C17.3453 7.5 16.7544 7.24411 16.2997 6.82312L16.028 6.57157L15.7082 6.75804L8.65818 10.868L8.34421 11.0511L8.42141 11.4062C8.46903 11.6253 8.5 11.8139 8.5 12C8.5 12.1861 8.46903 12.3747 8.42141 12.5938L8.34415 12.9492L8.65848 13.1321L15.7885 17.2821Z"
                class="dark:!stroke-[#FBFCFE] stroke-[#14161A]"
              />
            </svg>
          </AppButton>
        </div>
      </div>
    </div>
    <div class="p-[160px] md:p-[120px]"></div>
    <template v-if="allReviews > 0">
      <div
        class="md:w-page px-[16px] md:px-0 flex gap-[16px] md:gap-[100px] flex-col md:flex-row justify-between"
      >
        <div class="md:w-[686px] md:order-2 overflow-x-auto md:overflow-hidden md:!sticky top-0">
          <div
            class="w-[150vw] md:w-auto grid grid-cols-3 md:grid-cols-2 grid-rows-2 gap-[10px]"
            v-if="area.imgs.length !== 0"
          >
            <img :src="area.imgs[0]" class="row-span-1 h-full w-auto rounded-[8px]" />
            <img :src="area.imgs[1]" class="row-span-1 rounded-[8px]" v-if="area.imgs[1]" />
            <div class="row-span-1 rounded-[8px] overflow-hidden relative">
              <div
                class="absolute top-0 right-0 bottom-0 left-0 bg-black/30 text-white md:flex items-center justify-center hidden"
              >
                VIEW MORE
              </div>
              <img :src="area.imgs[2]" v-if="area.imgs[2]" />
            </div>
            <img
              :src="area.imgs[3]"
              class="row-span-1 rounded-[8px] md:hidden"
              v-if="area.imgs[3]"
            />
            <img
              :src="area.imgs[4]"
              class="row-span-1 rounded-[8px] md:hidden"
              v-if="area.imgs[4]"
            />
          </div>
          <div class="text-xl opacity-50" v-else>
            No images uploaded for "<span class="capitalize">{{ area.name }}</span
            >" yet.
          </div>
        </div>
        <div class="md:order-1 w-full overflow-y-auto scrollbar-none">
          <ViewComment :id="comments.id" v-if="comments.id !== ''" @close="comments.id = ''" />
          <Reviews :filter="filter" type="full" ref="reviews" @clicked="handleClick" v-else />
        </div>
      </div>
    </template>
    <div class="w-full h-full flex flex-col justify-center items-center" v-else>
      <img src="@/assets/imgs/empty-area.png" class="h-[240px] w-auto" />
      <p class="opacity-55 mb-5">Oops! No Reviews Yet.</p>
      <AppButton
        type="primary"
        class="uppercase font-[500] md:w-[300px]"
        size="small"
        @click="newReview = true"
        :disabled="isEmpty(user.username)"
        >leave a review</AppButton
      >
    </div>
    <AddReview v-if="newReview" @close="newReview = false" @done="addReview" />
  </section>
</template>
