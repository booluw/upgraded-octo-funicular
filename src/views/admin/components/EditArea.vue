<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'

import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import AppUpload from '@/components/AppUpload.vue'
import { notify } from '@/components/AppNotification'
import { supabase } from '@/config/supabase'
import { uploadToCloudinary } from '@/utils/functions'

const emits = defineEmits(['back', 'done'])
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const error = ref(false)
const area = ref({
  id: '',
  name: '',
  state: '',
  lga: '',
  imgs: [] as any
})
const imgs = ref([]) as any

const images = computed(() => {
  if (area.value.imgs.length === 0) return []
  return imgs.value.map((img: any) => {
    return URL.createObjectURL(img)
  })
})

const removeImage = function (index: number) {
  imgs.value = imgs.value.filter((img: any, i: number) => {
    if (i !== index) return img
  })
}

const removeImg = function (index: number) {
  area.value.imgs = area.value.imgs.filter((img: string, i: number) => {
    if (i !== index) return img
  })
}

const addImage = function (file: File) {
  imgs.value.push(file)
}

const saveArea = async function () {
  loading.value = true
  try {

    let img = [] as string[]

    if (imgs.value.length !== 0) {
      // first upload to cloudinary
      Promise.all(
        imgs.value.map(async (file: any) => {
          try {
            await uploadToCloudinary(file as any)
              .then((response: string) => {
                img.push(response)
              })
              .catch((error) => {
                throw Error(error.message ?? error)
              })
          } catch (error) {
            console.log(error)
          }
        })
      ).finally(async () => {
        // Send to supabased
        const { error } = await supabase.from('areas').update({
          imgs: [...img, ...area.value.imgs],
        }).eq('id', area.value.id)

        if (error) throw Error(error.message as any)

        notify({ content: 'Area updated', position: 'top-center', type: 'success' })
        emits('done')
        loading.value = false
      })
    } else {
      const { error } = await supabase.from('areas').update({
          imgs: [...area.value.imgs],
        }).eq('id', area.value.id)

        if (error) throw Error(error.message as any)

        notify({ content: 'Area updated', position: 'top-center', type: 'success' })
        emits('done')
        loading.value = false
    }
  } catch (error) {
    console.log(error)
    notify({ content: error, position: 'top-center', type: 'error' })
    loading.value = false
  }
}

const getArea = async function () {
  loading.value = true

  try {
    const { data, error } = await supabase.from('areas').select('*').eq('id', route.query.id)

    if (error) throw Error(error.message)
    area.value = data[0]
  } catch (err) {
    console.log(err)
    error.value = true
  }

  loading.value = false
}

onMounted(() => {
  getArea()
})

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
    <h1 class="text-icon dark:text-primary-light font-[500] text-2xl mt-5">Edit Area</h1>
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
        disabled
      />
      <AppSelect
        :options="[]"
        placeholder="State"
        v-model="area.state"
        class="mb-5"
        disabled
      />
      <AppSelect
        :options="[]"
        placeholder="Local Government Area"
        v-model="area.lga"
        class="mb-5"
        disabled
      />
      <AppUpload accept="image/*" @file="addImage" />
      <div class="flex gap-[10px] overflow-auto mt-5 pb-3" v-if="images.length !== 0 || area.imgs.length !== 0">
        <div
          class="w-[80px] flex-shrink-0 group relative"
          v-for="(file, index) in area.imgs"
          :key="index"
          @click="removeImg(index)"
        >
          <img :src="file" class="w-full h-auto rounded" />
          <div
            class="absolute top-0 right-0 left-0 bottom-0 text-sm hidden group-hover:flex items-center justify-center bg-black/30 rounded text-white cursor-pointer"
          >
            Remove
          </div>
        </div>
        <div
          class="w-[80px] flex-shrink-0 group relative"
          v-for="(file, index) in images"
          :key="index"
          @click="removeImage(index)"
        >
          <img :src="file" class="w-full h-auto rounded" />
          <div
            class="absolute top-0 right-0 left-0 bottom-0 text-sm hidden group-hover:flex items-center justify-center bg-black/30 rounded text-white cursor-pointer"
          >
            Remove
          </div>
        </div>
      </div>
      <AppButton type="primary" mode="submit" class="mt-5 w-full" :loading="loading"
        >SAVE</AppButton
      >
    </form>
  </div>
</template>
