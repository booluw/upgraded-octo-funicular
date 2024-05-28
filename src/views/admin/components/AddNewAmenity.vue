<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'

import { AMENITY_CATEGORY } from '@/utils/constants'
import { notify } from '@/components/AppNotification'

import AppSelection from '@/components/AppSelection.vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'

const emits = defineEmits(['back', 'done'])
const router = useRouter()

const loading = ref(false)
const amenity: { title: string; category: string[] } = reactive({ title: '', category: [] })

const saveAmenity = async function () {
  loading.value = true

  try {
    const { error } = await supabase.from('amenities').insert({ ...amenity })

    if (error) throw Error(error.message as any)

    emits('done')
    notify({ content: 'Amenity created', type: 'success', position: 'top-center' })
  } catch (error: any) {
    console.log(error)
    notify({
      content: error.message ?? 'An error ocurred while adding new amenity',
      type: 'error',
      position: 'top-center'
    })
  }

  loading.value = false
}
</script>

<template>
  <div class="md:w-2/3 text-left">
    <a href="#back" class="inline-flex gap-[5px] items-center" @click.prevent="router.go(-1)">
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_6405_25616)">
          <path
            d="M1.25 7.5L3.75 10V8.125H13.125V6.875H3.75V5L1.25 7.5Z"
            fill="#636366"
            fill-opacity="0.8"
          />
        </g>
        <defs>
          <clipPath id="clip0_6405_25616">
            <rect width="15" height="15" fill="white" transform="matrix(-1 0 0 -1 15 15)" />
          </clipPath>
        </defs>
      </svg>
      <span class="underline">Back</span>
    </a>
    <h1 class="text-icon dark:text-primary-light font-[500] text-2xl mt-5">Create Amenity</h1>
    <form
      class="md:w-2/3 rounded mt-5 p-3 bg-primary-light dark:bg-icon"
      @submit.prevent="saveAmenity()"
    >
      <AppInput
        type="text"
        v-model="amenity.title"
        size="large"
        placeholder="Amenity"
        rules="required"
        class="mb-5"
      />
      <AppSelection
        v-model="amenity.category"
        :options="AMENITY_CATEGORY"
        placeholder="Select Category"
        class="mb-5"
      />
      <AppButton type="primary" mode="submit" class="mt-5 w-full" :loading="loading"
        >SAVE</AppButton
      >
    </form>
  </div>
</template>
