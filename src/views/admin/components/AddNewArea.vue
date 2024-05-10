<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue'
import { isEmpty } from 'lodash'

import { STATES_AND_LGA } from '@/utils/constants'

import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import AppUpload from '@/components/AppUpload.vue'
import { notify } from '@/components/AppNotification'
import { supabase } from '../../../config/supabase'
import { uploadToCloudinary } from '@/utils/functions'

const emits = defineEmits(['back', 'done'])

const loading = ref(false)
const area = reactive({
  name: '',
  state: '',
  lga: '',
  imgs: [] as any[]
})
const imgs = reactive([]) as any[]

const lgas = computed(() => {
  if (area.state === '') return []
  const state = STATES_AND_LGA.filter((item) => {
    if (item.state === area.state) return item
    return
  })
  return state[0].lgas
})

const images = computed(() => {
  if (area.imgs.length === 0) return []
  return area.imgs.map((img) => {
    return URL.createObjectURL(img)
  })
})

const removeImage = function (index: number) {
  area.imgs = area.imgs.filter((img, i) => {
    if (i !== index) return img
  })
}

const addImage = function (file: File) {
  area.imgs.push(file)
}

const saveArea = async function () {
  loading.value = true
  try {
    // first upload to cloudinary
    Promise.all(
      area.imgs.map(async (file) => {
        try {
          await uploadToCloudinary(file as any)
            .then((response) => {
              imgs.push(response)
            })
            .catch((error) => {
              throw Error(error)
            })
        } catch (error) {
          console.log(error)
        }
      })
    ).finally(async () => {
      // Send to supabased
      const { error } = await supabase
        .from('areas')
        .insert({
          ...area,
          imgs,
          name: area.name.toLocaleLowerCase(),
          id: (area.name + '-' + area.lga + '-' + area.state)
            .toLocaleLowerCase()
            .replace(/[^A-z\s\d][\\\^]?/g, '-')
        })

      if (error) throw Error(error as any)

      notify({ content: 'New area added', position: 'top-center', type: 'success' })
      emits('done')
      loading.value = false
    })
  } catch (error) {
    console.log(error)
    notify({ content: error, position: 'top-center', type: 'error' })
    loading.value = false
  }
}

watch(
  area,
  () => {
    // If state is changed, revert LGA to empty string
    if (isEmpty(area.state)) return
    if (
      !STATES_AND_LGA.filter((item) => {
        if (item.state === area.state) return item
      })[0].lgas.includes(area.lga)
    ) {
      area.lga = ''
    }
  },
  { deep: true }
)
</script>
<template>
  <div class="md:w-2/3 text-left">
    <a href="#back" class="inline-flex gap-[5px] items-center" @click.prevent="emits('back')">
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
    <h1 class="text-icon dark:text-primary-light font-[500] text-2xl mt-5">Create a new Area</h1>
    <form
      class="md:w-2/3 rounded mt-5 p-3 bg-primary-light dark:bg-icon"
      @submit.prevent="saveArea()"
    >
      <AppInput
        type="text"
        v-model="area.name"
        size="large"
        placeholder="Name of Area"
        class="mb-5"
      />
      <AppSelect
        :options="
          STATES_AND_LGA.map((item) => {
            return item.state
          })
        "
        placeholder="State"
        v-model="area.state"
        class="mb-5"
      />
      <AppSelect
        :options="lgas"
        placeholder="Local Government Area"
        v-model="area.lga"
        class="mb-5"
      />

      <div class="flex gap-[10px] overflow-auto mb-5 pb-3" v-if="images.length !== 0">
        <img
          :src="file"
          v-for="(file, index) in images"
          :key="index"
          class="w-[80px] h-auto rounded border-[2px] border-primary/30 flex-shrink-0"
          @click="removeImage(index)"
        />
      </div>
      <div class="opacity-60 mb-5" v-else>Select an image to see the preview here</div>
      <AppUpload accept="image/*" @file="addImage" />
      <AppButton type="primary" mode="submit" class="mt-5 w-full" :loading="loading"
        >SAVE</AppButton
      >
    </form>
  </div>
</template>
