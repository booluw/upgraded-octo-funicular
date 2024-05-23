<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'
import { formatDate } from '@/utils/functions'

import AppLoader from '@/components/AppLoader.vue'
import AppError from '@/components/AppError.vue'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AppPagination from '@/components/AppPagination.vue'
import AppTable from '@/components/AppTable/Index.vue'

import AddNewAmenity from './components/AddNewAmenity.vue'

const route = useRoute()
const router = useRouter()

const error = ref(false)
const loading = ref(false)

const query = ref('')

</script>
<template>
  <section class="">
  <AppError v-if="error" />
  <section class="" v-else>
    <section class="flex justify-center" v-if="route.query.action === 'add'">
      <AddNewAmenity @done="router.go(-1)" />
    </section>
    <section class="flex justify-center" v-else-if="route.query.action === 'edit'"></section>
    <section class="" v-else>
      <div class="flex items-center justify-between">
        <h1 class="text-icon dark:text-primary-light font-[600] text-2xl">All Amenities</h1>
        <div class="flex items-center gap-[20px]">
          <AppButton type="primary" size="small" @click="router.push('?action=add')">
            CREATE AMENITY
          </AppButton>
          <form class="flex items-center gap-[5px]" @submit.prevent="searchAmenity()">
            <AppInput v-model="query" type="search" placeholder="Amenity" size="small" required>
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
            <AppButton type="outline" mode="submit" size="small" class="uppercase"
              >Search</AppButton
            >
          </form>
        </div>
      </div>
    </section>
  </section>
  </section>
</template>