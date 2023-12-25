<template>
  <div class="">
    <Combobox
      :model-value="props.modelValue"
      @update:model-value="(value) => emits('update:modelValue', value.value)"
      class="z-30"
      >
      <div class="relative mt-1">
        <div
          class="relative w-full cursor-default overflow-hidden rounded-lg bg-white border-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
        >
          <ComboboxInput
            class="w-full border-none pl-3 pr-10 text-sm leading-5 bg-base-100 text-base focus:ring-0"
            :class="{'py-2': size == 'md', 'py-1' : size == 'sm'}"
            :displayValue="() => displayValue"
            @change="query = $event.target.value"
            @blur="emits('blur', $event)"
            @focusin="inputBoxInFocus = true"
            @focusout="handleInputBoxFocusOut"
            :placeholder="props.placeholder"

          />
          <ComboboxButton
            class="absolute inset-y-0 right-0 flex items-center pr-2"
          >
            <ChevronUpDownIcon
              class="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </ComboboxButton>
        </div>
        <TransitionRoot
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          @after-leave="query = ''"
        >
          <ComboboxOptions
            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md border-2 bg-base-100 py-1 text-base ring-1 ring-black/5 focus:outline-none sm:text-sm"
          >
            <div
              v-if="filteredOptions.length === 0 && query !== ''"
              class="relative cursor-default select-none px-4 py-2 text-gray-700"
            >
              Nothing found.
            </div>

            <ComboboxOption
              v-for="option in filteredOptions"
              as="template"
              :key="option.value"
              :value="option"
              v-slot="{ selected, active }"
            >
              <li
                class="relative cursor-default select-none py-2 pl-10 pr-4"
                :class="{
                  'bg-primary content-primary': active,
                  'bg-base-100 content-base': !active,
                }"
              >
                <span
                  class="block truncate"
                  :class="{ 'font-medium': selected, 'font-normal': !selected }"
                >
                  {{ option.label }}
                </span>
                <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3"
                  :class="{ 'text-base': active, 'text-neutral': !active }"
                >
                  <CheckIcon class="h-5 w-5" aria-hidden="true" />
                </span>
              </li>
            </ComboboxOption>
          </ComboboxOptions>
        </TransitionRoot>
      </div>
    </Combobox>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

let query = ref('')

const displayValue = computed(() => props.options.find((option) => props.modelValue === option.value)?.label)


let filteredOptions = computed(() =>
  query.value === '' ? props.options: props.options.filter((person) => person?.label.toLowerCase().replace(/\s+/g, '')
  .includes(query.value.toLowerCase().replace(/\s+/g, '')))
)

const inputBoxInFocus = ref(false)

const handleInputBoxFocusOut = async () => {
  inputBoxInFocus.value = false
}



const emits = defineEmits(['update:modelValue', 'blur'])

const props = defineProps({
  modelValue: {
    type: undefined,
    default: null,
  },
  options: {
    type: Array,
    required: true,
  },
  size: {
    type: String,
    default: 'md',
  },
  placeholder: {
    type: String,
    default: '',
  },
})
</script>
