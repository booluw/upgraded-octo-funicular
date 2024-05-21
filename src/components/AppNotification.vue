<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

const hideNotification = ref(false)

const props = defineProps<{
  type?: 'error' | 'warning' | 'info' | 'success' | string
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-right' | 'bottom-center' | 'bottom-left' | string
  animate?: boolean
  content: string | { message: string, [otherOptions: string]: unknown }
}>()

const style = computed(() => {
  let response = ''
  // Styling to handle notification type
  switch (props.type) {
    case 'error':
      response = response + 'bg-red-200 text-red-500 border-[0.5px] border-red-500/50 '
      break
    case 'warning':
      response = response + 'bg-[#FEF2E8] text-orange-500 border-[0.5px] border-orange/50 '
      break
    case 'success':
      response = response + 'bg-[#F2FDF2] text-[#0F920F] border-[0.5px] border-[#0F920F] '
      break
    case 'info':
      response = response + 'bg-slate-200 text-slate-500 border-[0.5px] border-slate-500/50 '
      break
    default:
      response = response + 'bg-slate-200 text-slate-500 border-[0.5px] border-slate-500/50 '
      break
  }

  // Styling to handle notification position
  switch (props.position) {
    case 'top-left':
      response = response + 'top-32 left-0'
      break
    case 'top-center':
      response = response + 'top-32 left-[50%]'
      break
    case 'top-right':
      response = response + 'top-32 right-0'
      break
    case 'bottom-right':
      response = response + 'bottom-5 right-0'
      break
    case 'bottom-center':
      response = response + 'bottom-5 left-[50%]'
      break
    case 'bottom-left':
      response = response + 'bottom-5 left-0'
      break
    default:
      response = response + 'top-32 right-0'
      break
  }

  return response
})

onMounted(() => {
  setTimeout(() => {
    hideNotification.value = true
  }, 6000)
})
</script>
<template>
  <div
    class="fixed w-5/6 md:w-1/3 h-auto p-3 rounded-[6px] text-center flex items-center justify-center gap-3 capitalize"
    :class="hideNotification ? 'notify' : '' + ' ' + style"
    :style="
      position === 'top-center'
        ? 'transform: translate(-50%, 0)'
        : position === 'bottom-center'
          ? 'transform: translate(-50%, 0)'
          : ''
    "
  >
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="type === 'success'">
      <path
        d="M15.1771 7.38723V8.00056C15.1763 9.43818 14.7108 10.837 13.85 11.9884C12.9892 13.1399 11.7793 13.9822 10.4007 14.3898C9.02204 14.7974 7.54859 14.7485 6.20006 14.2503C4.85154 13.7521 3.70019 12.8313 2.91772 11.6253C2.13526 10.4193 1.76361 8.9926 1.8582 7.5581C1.95279 6.1236 2.50855 4.75811 3.4426 3.66528C4.37665 2.57244 5.63894 1.81082 7.04121 1.49399C8.44348 1.17717 9.9106 1.32212 11.2238 1.90723"
        stroke="#0F920F"
        stroke-width="1.33333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15.1667 2.66602L8.5 9.33935L6.5 7.33935"
        stroke="#0F920F"
        stroke-width="1.33333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    {{ typeof content === 'string' ? content : content.message || 'Hello Notificiation' }}
  </div>
</template>

<style scoped>
.notify {
  animation: notify ease-in-out forwards;
}

@keyframes notify {
  0% {
    opacity: 1;
  }

  99% {
    opacity: 0;
  }
}
</style>
