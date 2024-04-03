<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppLogo from '@/components/AppLogo.vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const filters = reactive([
  'Schools',
  'Hospitals',
  'Resort Park',
  'Shopping Malls',
  'Airports',
  'Train Station',
  'Nightlife',
  'Public Wifi',
  'Security',
  'Public Transport',
  'Bus Station',
  'Quiet'
])

const query = computed({
  set(newValue: string) {
    searchQuery.value = newValue
  },
  get() {
    return route.query.query
  }
})

const share = function () {
  navigator.clipboard.writeText(window.location.href).then(() => {
    console.log('Done')
  })
}
const search = function () {
  router.push(`/areas?query=${searchQuery.value}`)
}
</script>
<template>
  <section
    class="min-h-[100vh] md:flex flex-col items-center bg-light dark:bg-black text-text dark:text-text-dark"
  >
    <div class="bg-[#F2F6FD] dark:bg-transparent flex flex-col items-center mb-[32px]">
      <div class="w-full md:w-page px-[16px] md:px-0">
        <header class="py-[10.5px] flex justify-between items-center">
          <div class="flex gap-[42px] items-center">
            <router-link to="/" class="text-text dark:text-text-dark">
              <AppLogo />
            </router-link>
            <form @submit.prevent="search" class="w-[778px] hidden md:block">
              <AppInput
                v-model="query"
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
            </form>
          </div>
          <div class="flex items-center gap-[13px]">
            <span class="hidden md:block">Welcome!</span>
            <img src="@/assets/imgs/avatar.png" class="rounded-full border-[2px] border-white" />
          </div>
        </header>
        <form @submit.prevent="search" class="block md:hidden">
          <AppInput
            v-model="query"
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
        </form>
        <div class="mb-[16px]">
          <div class="flex justify-between items-center">
            <div class="md:w-[60%]">
              <h1 class="text-[24px]">{{ query }}</h1>
              <h2 class="text-[12px] md:text-[16px]">
                <b>“450” Reviews</b> (People are raving about the selected location)
              </h2>
            </div>
            <div class="hidden md:flex gap-[16px]">
              <AppButton type="primary" class="uppercase">Leave a review</AppButton>
              <AppButton type="outline">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.4297 19.4047L17.4282 19.4037L13.1301 16.4654C13.1299 16.4652 13.1296 16.4651 13.1294 16.4649C12.7969 16.2361 12.3854 16.1372 12 16.1372C11.6146 16.1372 11.2031 16.2361 10.8706 16.4649C10.8704 16.4651 10.8701 16.4652 10.8699 16.4654L6.57428 19.402C6.54731 19.4199 6.52251 19.4348 6.5 19.447V4.82982C6.5 4.81956 6.50652 4.7514 6.63451 4.66377C6.75912 4.57846 6.95765 4.51 7.1985 4.51H7.42322C7.45966 4.51 7.49186 4.50686 7.51946 4.50261C7.52489 4.50177 7.53016 4.50088 7.5351 4.5H16.4499C16.4549 4.50088 16.4601 4.50177 16.4656 4.50261C16.4932 4.50686 16.5254 4.51 16.5618 4.51H16.7865C17.0269 4.51 17.2264 4.57825 17.354 4.6649C17.4775 4.74873 17.4975 4.81938 17.5 4.84261V19.4487C17.4786 19.4368 17.4552 19.4223 17.4297 19.4047Z"
                    stroke="#3366FF"
                  />
                </svg>
              </AppButton>
              <AppButton type="outline" @click="share()">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.7885 17.2821L16.1042 17.4659L16.3753 17.2209C16.8129 16.8254 17.3762 16.58 18 16.58C19.3339 16.58 20.42 17.6661 20.42 19C20.42 20.3339 19.3339 21.42 18 21.42C16.6661 21.42 15.58 20.3339 15.58 19C15.58 18.8247 15.604 18.6439 15.6464 18.4658L15.7322 18.1053L15.4122 17.9183L8.29224 13.7583L7.97224 13.5713L7.7003 13.8231C7.24562 14.2441 6.65469 14.5 6 14.5C4.61614 14.5 3.5 13.3839 3.5 12C3.5 10.6161 4.61614 9.5 6 9.5C6.65469 9.5 7.24562 9.75589 7.7003 10.1769L7.97196 10.4284L8.29182 10.242L15.3418 6.13196L15.6558 5.94892L15.5786 5.59378C15.531 5.37472 15.5 5.1861 15.5 5C15.5 3.61614 16.6161 2.5 18 2.5C19.3839 2.5 20.5 3.61614 20.5 5C20.5 6.38386 19.3839 7.5 18 7.5C17.3453 7.5 16.7544 7.24411 16.2997 6.82312L16.028 6.57157L15.7082 6.75804L8.65818 10.868L8.34421 11.0511L8.42141 11.4062C8.46903 11.6253 8.5 11.8139 8.5 12C8.5 12.1861 8.46903 12.3747 8.42141 12.5938L8.34415 12.9492L8.65848 13.1321L15.7885 17.2821Z"
                    stroke="#3366FF"
                  />
                </svg>
              </AppButton>
            </div>
          </div>
        </div>
        <div class="pb-[16px] flex justify-between items-center">
          <div class="flex gap-[10px] overflow-hidden hover:overflow-x-auto">
            <div
              class="flex-shrink-0 text-center text-[14px] py-[4px] px-[8px] border-[0.2px] border-black dark:border-text-dark bg-white dark:bg-black-light rounded-[4px] cursor-pointer hover:opacity-75"
              v-for="(filter, i) in filters"
              :key="i"
            >
              {{ filter }}
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
        <div class="flex gap-[16px] md:hidden">
          <AppButton type="primary" class="uppercase">Leave a review</AppButton>
          <AppButton type="outline">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.4297 19.4047L17.4282 19.4037L13.1301 16.4654C13.1299 16.4652 13.1296 16.4651 13.1294 16.4649C12.7969 16.2361 12.3854 16.1372 12 16.1372C11.6146 16.1372 11.2031 16.2361 10.8706 16.4649C10.8704 16.4651 10.8701 16.4652 10.8699 16.4654L6.57428 19.402C6.54731 19.4199 6.52251 19.4348 6.5 19.447V4.82982C6.5 4.81956 6.50652 4.7514 6.63451 4.66377C6.75912 4.57846 6.95765 4.51 7.1985 4.51H7.42322C7.45966 4.51 7.49186 4.50686 7.51946 4.50261C7.52489 4.50177 7.53016 4.50088 7.5351 4.5H16.4499C16.4549 4.50088 16.4601 4.50177 16.4656 4.50261C16.4932 4.50686 16.5254 4.51 16.5618 4.51H16.7865C17.0269 4.51 17.2264 4.57825 17.354 4.6649C17.4775 4.74873 17.4975 4.81938 17.5 4.84261V19.4487C17.4786 19.4368 17.4552 19.4223 17.4297 19.4047Z"
                stroke="#3366FF"
              />
            </svg>
          </AppButton>
          <AppButton type="outline" @click="share()">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.7885 17.2821L16.1042 17.4659L16.3753 17.2209C16.8129 16.8254 17.3762 16.58 18 16.58C19.3339 16.58 20.42 17.6661 20.42 19C20.42 20.3339 19.3339 21.42 18 21.42C16.6661 21.42 15.58 20.3339 15.58 19C15.58 18.8247 15.604 18.6439 15.6464 18.4658L15.7322 18.1053L15.4122 17.9183L8.29224 13.7583L7.97224 13.5713L7.7003 13.8231C7.24562 14.2441 6.65469 14.5 6 14.5C4.61614 14.5 3.5 13.3839 3.5 12C3.5 10.6161 4.61614 9.5 6 9.5C6.65469 9.5 7.24562 9.75589 7.7003 10.1769L7.97196 10.4284L8.29182 10.242L15.3418 6.13196L15.6558 5.94892L15.5786 5.59378C15.531 5.37472 15.5 5.1861 15.5 5C15.5 3.61614 16.6161 2.5 18 2.5C19.3839 2.5 20.5 3.61614 20.5 5C20.5 6.38386 19.3839 7.5 18 7.5C17.3453 7.5 16.7544 7.24411 16.2997 6.82312L16.028 6.57157L15.7082 6.75804L8.65818 10.868L8.34421 11.0511L8.42141 11.4062C8.46903 11.6253 8.5 11.8139 8.5 12C8.5 12.1861 8.46903 12.3747 8.42141 12.5938L8.34415 12.9492L8.65848 13.1321L15.7885 17.2821Z"
                stroke="#3366FF"
              />
            </svg>
          </AppButton>
        </div>
      </div>
    </div>
    <div class="md:w-page px-[16px] md:px-0">Hi Welcome to my Youtube Tutorial</div>
  </section>
</template>
