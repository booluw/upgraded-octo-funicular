<!-- eslint-disable vue/no-textarea-mustache -->
<script lang="ts" setup>
import { ref, useSlots, reactive } from 'vue'
import { validation } from './validations'

const emit = defineEmits(['valid', 'invalid'])
const props = defineProps<{
  type: 'text' | 'textarea' | 'search' | 'email' | 'password'
  placeholder?: string
  rules?: string
  regex?: string
  size?: 'small' | 'large'
  "same-as"?: string
}>()

const value = defineModel()
const showLabel = ref(false)
const pattern = props.regex ? new RegExp(props.regex) : ''
const error = reactive({
  show: false,
  message: ''
})

const updateModel = function (e: any) {
  showLabel.value = true
  value.value = e.target.value

  error.message = ''
  error.show = false

  // First validates regex
  if (props.regex) {
    const isValid = new RegExp(props.regex).test(e.target.value)

    if (!isValid) {
      error.show = true
      error.message = `${props.placeholder} is not valid`

      return
    }
  }

  if (props.sameAs) {
    if (e.target.value !== props.sameAs) {
      error.show = true;
      error.message = 'Validation error'
    };
    return;
  }

  // Then validate rules

  props.rules?.split('|').forEach((rule: string) => {
    error.show = !validation[rule](e.target.value, props.placeholder).valid
    error.message = validation[rule](e.target.value, props.placeholder).message
  })

  if (!error.show) {
    emit('valid')
  } else {
    emit('invalid')
  }
}
</script>
<template>
  <div>
    <div
      class="flex flex-col justify-center rounded-[6px] bg-[#F3F7FE] dark:bg-black-light text-black-light dark:text-[#F3F7FE] border dark:border-[#383B43] focus-within:border-primary transition-all ease-out group"
      :class="size === 'small' ? 'px-[10px] py-[5px]' : 'p-[12px]'"
    >
      <span
        v-if="!useSlots().icon"
        class="text-[10px] !text-left"
        :class="
          value !== ''
            ? 'opacity-55'
            : 'opacity-0 translate-y-[15px] group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all ease-in-out'
        "
      >
        {{ placeholder }}
      </span>
      <div class="flex items-center gap-[10px]">
        <slot name="icon" v-if="type !== 'password'" />
        <textarea
          v-if="type === 'textarea'"
          class="w-full bg-transparent focus-within:outline-none outline-none min-h-[100px]"
          :v-model="value"
          :placeholder="placeholder"
          :required="rules?.includes('required')"
          :pattern="pattern"
          @input="updateModel"
          @focus="updateModel"
        >{{ value }}</textarea>
        <input
          v-else
          class="w-full bg-transparent focus-within:outline-none outline-none"
          :class="
            useSlots().icon
              ? 'translate-y-0 py-[5px]'
              : value === ''
                ? '-translate-y-[7px] group-focus-within:placeholder:text-transparent'
                : 'translate-y-0 transition-transform ease-in-out group-focus-within:placeholder:text-transparent'
          "
          :type="type"
          :value="value"
          :placeholder="placeholder"
          :required="rules?.includes('required')"
          @input="updateModel"
          @focus="updateModel"
          v-lazy="value === 'search'"
        />
        <div v-if="type === 'password'">
          <svg
            width="16"
            height="17"
            class="fill-[#14161A] dark:fill-[#FBFCFE]"
            viewBox="0 0 16 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.6">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8 2.58337C7.31486 2.58337 6.65778 2.85555 6.17331 3.34001C5.68884 3.82448 5.41667 4.48156 5.41667 5.16671V7.08337H10.5833V5.16671C10.5833 4.48156 10.3112 3.82448 9.82669 3.34001C9.34222 2.85555 8.68514 2.58337 8 2.58337ZM12.0833 7.08337V5.16671C12.0833 4.08374 11.6531 3.04513 10.8874 2.27935C10.1216 1.51358 9.08297 1.08337 8 1.08337C6.91703 1.08337 5.87842 1.51358 5.11265 2.27935C4.34687 3.04513 3.91667 4.08374 3.91667 5.16671V7.08337H3.33333C2.18274 7.08337 1.25 8.01611 1.25 9.16671V13.8334C1.25 14.984 2.18274 15.9167 3.33333 15.9167H12.6667C13.8173 15.9167 14.75 14.984 14.75 13.8334V9.16671C14.75 8.01612 13.8173 7.08337 12.6667 7.08337H12.0833ZM3.33333 8.58337C3.01117 8.58337 2.75 8.84454 2.75 9.16671V13.8334C2.75 14.1555 3.01117 14.4167 3.33333 14.4167H12.6667C12.9888 14.4167 13.25 14.1555 13.25 13.8334V9.16671C13.25 8.84454 12.9888 8.58337 12.6667 8.58337H3.33333Z"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
    <p class="text-xs text-red-400 text-left mt-1">{{ error.message }}</p>
  </div>
</template>
