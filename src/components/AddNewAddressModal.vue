<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { STATES_AND_LGA } from '@/utils/constants'
import { notify } from './AppNotification'
import { supabase } from '@/config/supabase'

import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'

const emit = defineEmits(['close', 'done'])

const loading = ref(false)
const area = reactive({
  name: '',
  state: '',
  lga: ''
})

const lgas = computed(() => {
  if (area.state === '') return []
  const state = STATES_AND_LGA.filter((item) => {
    if (item.state === area.state) return item
    return
  })
  return state[0].lgas
})

const saveArea = async function () {
  loading.value = true
  try {
    // Send to supabased
    const { error } = await supabase.from('areas').insert({
      ...area,
      imgs: [],
      name: area.name.toLocaleLowerCase(),
      id: (area.name + '-' + area.lga + '-' + area.state)
        .toLocaleLowerCase()
        .replace(/[^A-z\s\d][\\^]?/g, '-')
    })

    if (error) throw Error(error.message as any)

    notify({ content: 'Address Added successfully!', position: 'top-center', type: 'success' })
    emit('done')
    loading.value = false
  } catch (error) {
    console.log(error)
    if (error === `duplicate key value violates unique constraint "areas_id_key"`) {
      notify({ content: "Area already exist", position: "top-center", type: "error" })
      loading.value = false
      return
    }
    notify({ content: error, position: 'top-center', type: 'error' })
    loading.value = false
  }
}
</script>
<template>
  <section
    class="py-5 fixed z-20 top-0 right-0 bottom-0 left-0 bg-[#FBFCFE]/50 dark:bg-black/50 flex justify-center items-center backdrop-blur"
  >
    <div
      class="mx-5 h-auto w-full md:mx-0 md:!w-[500px] rounded-[6px] p-[24px] bg-[#FBFCFE] dark:bg-black text-black dark:text-text-dark overflow-x-auto shadow scrollbar-none relative"
      ref="target"
      id="modal"
    >
      <button
        class="bg-transparent border border-[#E5EDF5] dark:border-[#212327] rounded p-[4px] absolute right-[24px]"
        @click="emit('close')"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity="0.6">
            <path
              d="M18 6L6 18"
              class="stroke-[#14161A] dark:stroke-[#FBFCFE]"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M6 6L18 18"
              class="stroke-[#14161A] dark:stroke-[#FBFCFE]"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        </svg>
      </button>
      <h1 class="text-center mb-7 font-semibold text-[24px]">Add an Address</h1>

      <form
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
          }).sort()
        "
        placeholder="State"
        v-model="area.state"
        class="mb-5"
      />
      <AppSelect
        :options="lgas.sort()"
        placeholder="Local Government Area"
        v-model="area.lga"
        class="mb-5"
      />
      <AppButton
        type="primary"
        mode="submit"
        class="mt-5 w-full"
        :loading="loading"
      >
        SUBMIT
      </AppButton>
    </form>
    </div>
  </section>
</template>
