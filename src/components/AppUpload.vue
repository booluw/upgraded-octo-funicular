<script lang="ts" setup>
import { ref, reactive } from 'vue'

const props = defineProps<{
  accept: string
}>()

const emit = defineEmits(['file'])

const value = defineModel()
const placeholder = ref('')
const error = reactive({
  show: false,
  message: ''
})

const dragUpdateModel = function (e: any) {
  e.preventDefault()
  value.value = e.dataTransfer.files[0]
  // There might be a better way to emit this to the parent component
  emit('file', e.dataTransfer.files[0])
  // preview.value = URL.createObjectURL(e.dataTransfer.files[0])
}

const updateModel = function (e: any) {
  e.preventDefault()

  value.value = e.target.files[0]
  emit('file', e.target.files[0])
  // preview.value = URL.createObjectURL(e.target.files[0])
}
</script>
<template>
  <label class="group w-full" for="upload">
    <div
      class="group rounded-xl border-dashed border-[2px] border-primary/30 dark:border-gray-50/30 bg-[#F3F7FE] dark:bg-light/10 transition-all ease-in-out w-full p-10 text-center cursor-pointer flex flex-col items-center justify-center"
      :class="error.show ? 'border-red-500/70' : 'border-secondary/40 hover:border-secondary/75'"
      @drop="dragUpdateModel"
      @dragover.prevent="placeholder = 'Image recieved 😁'"
    >
      <!-- <svg
        width="46"
        height="46"
        viewBox="0 0 46 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="3" width="40" height="40" rx="20" fill="#F2F6FD" />
        <rect x="3" y="3" width="40" height="40" rx="20" stroke="#F9FAFB" stroke-width="6" />
        <g clip-path="url(#clip0_6405_25629)">
          <path
            d="M26.3326 26.3332L22.9992 22.9999M22.9992 22.9999L19.6659 26.3332M22.9992 22.9999V30.4999M29.9909 28.3249C30.8037 27.8818 31.4458 27.1806 31.8158 26.3321C32.1858 25.4835 32.2627 24.5359 32.0344 23.6388C31.8061 22.7417 31.2855 21.9462 30.5548 21.3778C29.8241 20.8094 28.925 20.5005 27.9992 20.4999H26.9492C26.697 19.5243 26.2269 18.6185 25.5742 17.8507C24.9215 17.0829 24.1033 16.4731 23.181 16.0671C22.2587 15.661 21.2564 15.4694 20.2493 15.5065C19.2423 15.5436 18.2568 15.8085 17.3669 16.2813C16.477 16.7541 15.7058 17.4225 15.1114 18.2362C14.517 19.05 14.1148 19.9879 13.9351 20.9794C13.7553 21.9709 13.8027 22.9903 14.0736 23.961C14.3445 24.9316 14.8319 25.8281 15.4992 26.5832"
            stroke="#475467"
            stroke-width="1.66667"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_6405_25629">
            <rect width="20" height="20" fill="white" transform="translate(13 13)" />
          </clipPath>
        </defs>
      </svg> -->
      <span class="opacity-50 group-hover:opacity-75" v-if="placeholder">
        {{ placeholder }}
      </span>
      <div class="text-sm group-hover:opacity-75" v-else>
        <span class="text-primary">Click to upload</span> or drag and drop<br />
        SVG, PNG, JPG or GIF (max. 800x400px)
      </div>
    </div>
    <input
      :accept="accept"
      type="file"
      id="upload"
      class="hidden"
      @change="updateModel"
    />
  </label>
</template>
