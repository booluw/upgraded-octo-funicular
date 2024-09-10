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
import ImageModal from '@/components/ImageModal.vue'

import AddReview from './components/AddReviewModal.vue'
import Reviews from './components/Reviews.vue'

import IconProfile from '@/components/icons/IconProfile.vue'
import IconLike from '@/components/icons/IconLike.vue'
import IconBookmark from '@/components/icons/IconBookmark.vue'
import IconLock from '@/components/icons/IconLock.vue'

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

const showImage = ref(false)

const amenity: Ref<{ title: string }[]> = ref([])
const filter: Ref<null | string> = ref(null)
const counter = reactive({})
const rating = ref(0)

const area: Ref<any> = ref({})
const areas = reactive({ items: [] })
const newReview = ref(false)
const reviews = ref(null)
const reviewCount = ref(0)
const allReviews = ref(0)

const title = useTitle()

const query = ref({ query: '', name: '', id: '' })

const amenities = computed(() => {
  if (amenity.value.length === 0) return []

  return amenity.value.map((item) => {
    return item.title
  })
})

const menuItems = computed(() => {
  const response = [
    { text: 'my reviews', icon: IconLike },
    { text: 'bookmarks', icon: IconBookmark },
    { text: 'profile', icon: IconProfile },
    'logout'
  ]

  if (user.role === 'ADMIN') {
    response.unshift({
      icon: IconLock,
      text: 'dashboard'
    })
  }
  return response
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
      .rpc('search_areas', { search_name: query.value.query.replace(/\d+/g, '').replace(' ', '') })
      .order('area_created_at', { ascending: false })

    if (error) throw Error(error.message ?? error)
    areas.items = data
  } catch (error) {
    console.log(error)
  }

  searchLoading.value = false
}

const handleAction = async function (action: 'logout' | 'profile' | 'reviews'|'dashboard') {
  if (action === 'logout') {
    await supabase.auth.signOut()
    userStore.resetUser()
    router.push('/')
  } else if (action === 'profile') {
    router.push('/profile')
  } else if (action === 'dashboard') {
    router.push('/admin')
  } else {
    router.push('/profile/reviews')
  }
}

const addReview = function () {
  newReview.value = false

  if (reviews.value !== null) {
    reviews.value.getAllReviews()
  } else {
    getArea()
    router.go(0)
  }

  getArea()
  router.go(0)
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

const getAreaAmenities = async function () {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('amenities, rating')
      .or(`and(area.eq.${route.params.name}, approved.eq.APPROVED)`)

    if (error) throw error

    data.forEach((item) => {
      item.amenities.forEach((amenity: string) => {
        counter[amenity] = (counter[amenity] || 0) + 1
      })

      rating.value = rating.value + item.rating
    })
  } catch (error) {
    console.log(error)
  }
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
    await getAreaAmenities()
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
      class="md:w-[100vw] bg-light dark:bg-black flex flex-col items-center mb-[16px] md:mb-[32px] fixed right-0 left-0 z-10"
    >
      <div class="w-full md:w-page px-[16px] md:px-0">
        <header class="py-[10.5px] flex gap-[10px] md:gap-0 justify-between items-center">
          <div class="flex gap-[10px] md:gap-[42px] items-center">
            <router-link to="/" class="text-text dark:text-text-dark">
              <AppLogo />
            </router-link>
            <form @submit.prevent class="md:w-[650px] block">
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
            :menu="menuItems"
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

        <div
          class="md:py-[16px] flex justify-between items-start md:items-center w-[90vw] relative"
        >
          <div class="pb-2 flex gap-[10px] scrollbar overflow-auto" ref="scroller">
            <div
              class="text-center text-[14px] py-[6px] px-[12px] border-[1.5px] text-[#14161A] border-[#B2C1E6] dark:border-[#383B43] dark:text-[#FBFCFE] bg-transparent rounded-[4px] cursor-pointer hover:opacity-75"
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
              {{ item }} &nbsp; {{ counter[item as unknown] ?? 0 }}
            </div>
          </div>
          <div
            class="mt-1 py-[6px] px-[9px] rounded-full bg-white dark:bg-black-light cursor-pointer hover:opacity-75 flex items-center justify-center"
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
      </div>
    </div>

    <div class="md:hidden overflow-x-auto pt-[150px]" v-if="area.imgs">
      <div
        class="p-5 pt-0 flex gap-[10px] cursor-pointer"
        v-if="area.imgs.length !== 0"
        @click="showImage = true"
      >
        <img
          :src="img"
          v-for="(img, index) in area.imgs"
          :key="index"
          class="rounded w-[calc(100%/2.5)]"
        />
      </div>
      <div class="text-xl opacity-50 text-center" v-else>
        <svg
          class="block my-4 mx-auto"
          width="43"
          height="36"
          viewBox="0 0 43 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            opacity="0.6"
            d="M10.5234 0.0235375C10.3909 0.0216635 10.2594 0.0461448 10.1364 0.0955585C10.0134 0.144972 9.90151 0.218333 9.80714 0.311377C9.71277 0.404422 9.63783 0.515294 9.58668 0.637552C9.53553 0.759809 9.5092 0.891012 9.5092 1.02354C9.5092 1.15606 9.53553 1.28727 9.58668 1.40952C9.63783 1.53178 9.71277 1.64265 9.80714 1.7357C9.90151 1.82874 10.0134 1.9021 10.1364 1.95152C10.2594 2.00093 10.3909 2.02541 10.5234 2.02354H39.5078C40.0708 2.02354 40.5078 2.4606 40.5078 3.02354V26.0509C40.5059 26.1834 40.5304 26.315 40.5798 26.4379C40.6292 26.5609 40.7026 26.6728 40.7957 26.7672C40.8887 26.8616 40.9996 26.9365 41.1218 26.9876C41.2441 27.0388 41.3753 27.0651 41.5078 27.0651C41.6403 27.0651 41.7715 27.0388 41.8938 26.9876C42.0161 26.9365 42.1269 26.8616 42.22 26.7672C42.313 26.6728 42.3864 26.5609 42.4358 26.4379C42.4852 26.315 42.5097 26.1834 42.5078 26.0509V3.02354C42.5078 1.37847 41.1529 0.0235375 39.5078 0.0235375H10.5234ZM4.5 6.0001C2.29 6.0001 0.5 7.7901 0.5 10.0001V32.0001C0.5 34.2101 2.29 36.0001 4.5 36.0001H32.5C34.71 36.0001 36.5 34.2101 36.5 32.0001V10.0001C36.5 7.7901 34.71 6.0001 32.5 6.0001H4.5ZM4.5 8.0001H32.5C33.602 8.0001 34.5 8.8981 34.5 10.0001V30.7696L26.6211 22.8907C26.0393 22.3089 25.2701 22.0157 24.5 22.0157C23.7299 22.0158 22.9599 22.3082 22.3789 22.8907L20.5117 24.7579L16.6211 20.9024C16.0393 20.3207 15.2701 20.0313 14.5 20.0313C13.7299 20.0314 12.9599 20.3199 12.3789 20.9024L2.5 30.7813V10.0001C2.5 8.8981 3.398 8.0001 4.5 8.0001ZM28.5 12.0001C27.9696 12.0001 27.4609 12.2108 27.0858 12.5859C26.7107 12.961 26.5 13.4697 26.5 14.0001C26.5 14.5305 26.7107 15.0392 27.0858 15.4143C27.4609 15.7894 27.9696 16.0001 28.5 16.0001C29.0304 16.0001 29.5391 15.7894 29.9142 15.4143C30.2893 15.0392 30.5 14.5305 30.5 14.0001C30.5 13.4697 30.2893 12.961 29.9142 12.5859C29.5391 12.2108 29.0304 12.0001 28.5 12.0001ZM14.5 22.0157C14.7537 22.0155 15.0068 22.1163 15.207 22.3165L15.2109 22.3204L19.6055 26.672C19.7012 26.8493 19.8482 26.9937 20.0273 27.086L22.6289 29.6642C22.7216 29.7595 22.8324 29.8354 22.9548 29.8874C23.0772 29.9394 23.2087 29.9665 23.3417 29.9671C23.4747 29.9677 23.6064 29.9417 23.7293 29.8907C23.8521 29.8398 23.9635 29.7648 24.057 29.6703C24.1505 29.5757 24.2243 29.4635 24.2739 29.3401C24.3235 29.2167 24.348 29.0846 24.3459 28.9517C24.3439 28.8187 24.3154 28.6875 24.262 28.5657C24.2086 28.4439 24.1315 28.3339 24.0352 28.2423L21.9336 26.1642L23.793 24.3048V24.3009C24.1909 23.9019 24.8066 23.9043 25.207 24.3048L34.0781 33.1759C33.713 33.6643 33.1548 34.0001 32.5 34.0001H4.5C3.84797 34.0001 3.29513 33.6648 2.92969 33.1798L13.793 22.3165C13.9919 22.117 14.2463 22.0159 14.5 22.0157Z"
            fill="currentColor"
          />
        </svg>

        No images uploaded for "<span class="capitalize">{{ area.name }}</span
        >" yet.
      </div>
    </div>

    <div class="md:pt-[150px] px-[16px] w-full flex items-center md:justify-center">
      <div class="md:w-page py-5">
        <div class="flex items-center justify-between md:justify-start gap-20">
          <h1 class="text-[24px] capitalize">{{ area.name }}, {{ area.lga }}, {{ area.state }}</h1>
          <div class="flex items-start gap-[4px]">
            <svg
              class="w-[18px]"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6 0L7.875 3.975L12 4.575L9 7.65L9.675 12L6 9.975L2.325 12L3 7.65L0 4.575L4.125 3.975L6 0Z"
                fill="#FABB07"
              />
            </svg>
            {{ Math.abs(rating / reviewCount).toFixed(1) || 0 }}
          </div>
        </div>
        <h2 class="text-[12px] md:text-[16px]">
          <b>“{{ reviewCount }}” Review{{ reviewCount > 1 ? 's' : '' }}</b>
          (People are raving about the selected location)
        </h2>
      </div>
    </div>
    <template v-if="allReviews > 0">
      <div
        class="md:w-page px-[16px] md:px-0 flex gap-[16px] md:gap-[100px] flex-col md:flex-row justify-between"
      >
        <div
          class="hidden md:block md:w-[686px] md:order-2 overflow-x-auto md:overflow-hidden md:!sticky top-0"
        >
          <div
            class="w-[150vw] md:w-auto grid grid-cols-3 md:grid-cols-2 md:grid-rows-2 gap-[10px] cursor-pointer"
            v-if="area.imgs.length !== 0"
            @click="showImage = true"
          >
            <img :src="area.imgs[0]" class="row-span-1 h-full w-auto rounded-[8px]" />
            <img :src="area.imgs[1]" class="row-span-1 rounded-[8px]" v-if="area.imgs[1]" />
            <div class="row-span-1 rounded-[8px] overflow-hidden relative">
              <div
                class="absolute top-0 right-0 bottom-0 left-0 bg-black/30 text-white md:flex items-center justify-center hidden cursor-pointer"
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
          <div class="text-xl opacity-50 text-center" v-else>
            <svg
              class="block my-4 mx-auto"
              width="43"
              height="36"
              viewBox="0 0 43 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                opacity="0.6"
                d="M10.5234 0.0235375C10.3909 0.0216635 10.2594 0.0461448 10.1364 0.0955585C10.0134 0.144972 9.90151 0.218333 9.80714 0.311377C9.71277 0.404422 9.63783 0.515294 9.58668 0.637552C9.53553 0.759809 9.5092 0.891012 9.5092 1.02354C9.5092 1.15606 9.53553 1.28727 9.58668 1.40952C9.63783 1.53178 9.71277 1.64265 9.80714 1.7357C9.90151 1.82874 10.0134 1.9021 10.1364 1.95152C10.2594 2.00093 10.3909 2.02541 10.5234 2.02354H39.5078C40.0708 2.02354 40.5078 2.4606 40.5078 3.02354V26.0509C40.5059 26.1834 40.5304 26.315 40.5798 26.4379C40.6292 26.5609 40.7026 26.6728 40.7957 26.7672C40.8887 26.8616 40.9996 26.9365 41.1218 26.9876C41.2441 27.0388 41.3753 27.0651 41.5078 27.0651C41.6403 27.0651 41.7715 27.0388 41.8938 26.9876C42.0161 26.9365 42.1269 26.8616 42.22 26.7672C42.313 26.6728 42.3864 26.5609 42.4358 26.4379C42.4852 26.315 42.5097 26.1834 42.5078 26.0509V3.02354C42.5078 1.37847 41.1529 0.0235375 39.5078 0.0235375H10.5234ZM4.5 6.0001C2.29 6.0001 0.5 7.7901 0.5 10.0001V32.0001C0.5 34.2101 2.29 36.0001 4.5 36.0001H32.5C34.71 36.0001 36.5 34.2101 36.5 32.0001V10.0001C36.5 7.7901 34.71 6.0001 32.5 6.0001H4.5ZM4.5 8.0001H32.5C33.602 8.0001 34.5 8.8981 34.5 10.0001V30.7696L26.6211 22.8907C26.0393 22.3089 25.2701 22.0157 24.5 22.0157C23.7299 22.0158 22.9599 22.3082 22.3789 22.8907L20.5117 24.7579L16.6211 20.9024C16.0393 20.3207 15.2701 20.0313 14.5 20.0313C13.7299 20.0314 12.9599 20.3199 12.3789 20.9024L2.5 30.7813V10.0001C2.5 8.8981 3.398 8.0001 4.5 8.0001ZM28.5 12.0001C27.9696 12.0001 27.4609 12.2108 27.0858 12.5859C26.7107 12.961 26.5 13.4697 26.5 14.0001C26.5 14.5305 26.7107 15.0392 27.0858 15.4143C27.4609 15.7894 27.9696 16.0001 28.5 16.0001C29.0304 16.0001 29.5391 15.7894 29.9142 15.4143C30.2893 15.0392 30.5 14.5305 30.5 14.0001C30.5 13.4697 30.2893 12.961 29.9142 12.5859C29.5391 12.2108 29.0304 12.0001 28.5 12.0001ZM14.5 22.0157C14.7537 22.0155 15.0068 22.1163 15.207 22.3165L15.2109 22.3204L19.6055 26.672C19.7012 26.8493 19.8482 26.9937 20.0273 27.086L22.6289 29.6642C22.7216 29.7595 22.8324 29.8354 22.9548 29.8874C23.0772 29.9394 23.2087 29.9665 23.3417 29.9671C23.4747 29.9677 23.6064 29.9417 23.7293 29.8907C23.8521 29.8398 23.9635 29.7648 24.057 29.6703C24.1505 29.5757 24.2243 29.4635 24.2739 29.3401C24.3235 29.2167 24.348 29.0846 24.3459 28.9517C24.3439 28.8187 24.3154 28.6875 24.262 28.5657C24.2086 28.4439 24.1315 28.3339 24.0352 28.2423L21.9336 26.1642L23.793 24.3048V24.3009C24.1909 23.9019 24.8066 23.9043 25.207 24.3048L34.0781 33.1759C33.713 33.6643 33.1548 34.0001 32.5 34.0001H4.5C3.84797 34.0001 3.29513 33.6648 2.92969 33.1798L13.793 22.3165C13.9919 22.117 14.2463 22.0159 14.5 22.0157Z"
                fill="currentColor"
              />
            </svg>
            No images uploaded for "<span class="capitalize">{{ area.name }}</span
            >" yet.
          </div>
        </div>
        <div class="md:order-1 w-full overflow-y-auto scrollbar-none">
          <Reviews :filter="filter" type="full" ref="reviews" />
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
    <AppButton
      type="primary"
      class="uppercase font-[500] !py-5 !px-6 md:hidden fixed bottom-5 right-5"
      size="small"
      @click="newReview = true"
      :disabled="isEmpty(user.username)"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 0C9.448 0 9 0.448 9 1V9H1C0.448 9 0 9.448 0 10C0 10.552 0.448 11 1 11H9V19C9 19.552 9.448 20 10 20C10.552 20 11 19.552 11 19V11H19C19.552 11 20 10.552 20 10C20 9.448 19.552 9 19 9H11V1C11 0.448 10.552 0 10 0Z"
          fill="#FBFCFE"
        />
      </svg>
    </AppButton>
  </section>

  <AddReview v-if="newReview" @close="newReview = false" @done="addReview" />
  <ImageModal v-if="showImage" :img="area.imgs" @close="showImage = false" />
</template>
