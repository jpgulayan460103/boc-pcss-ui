<script setup>
import Card from '@/components/Card.vue'
import ComboBox from '@/components/ComboBox.vue'
import FormInput from '@/components/FormInput.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { usePositionStore } from '@/stores/position'
import { useAuthStore } from '@/stores/auth.js'
import EditIcon from '@/icons/EditIcon.vue'
import DeleteIcon from '@/icons/DeleteIcon.vue'
import CalendarIcon from '@/icons/CalendarIcon.vue'
import SearchIcon from '@/icons/SearchIcon.vue'
import PlusIcon from '@/icons/PlusIcon.vue'
import { cloneDeep, debounce, isEmpty } from 'lodash';
import { useThemeStore } from '@/stores/theme.js'
import dayjs from 'dayjs';


const themeStore = useThemeStore()
const positionStore = usePositionStore();
const authStore = useAuthStore()

const searchQuery = ref("");

const payload = ref({});

const options = computed(() => positionStore.positions.map(i => {
  return {
    value: i.id,
    label: i.name,
  }
}))

const formErrors = ref({});

const submit = ref(false);

const submitPositionForm = () => {
  submit.value = true;
  formErrors.value = {}
  if(authStore.authUser.role != 'admin'){
    payload.value.position_id = authStore.authUser.position_id;
  }
  positionStore.save(payload.value)
  .then((res) => {
    if (positionStore.formType == 'create') {
      alert("You have successfully added an position");
    }else{
      alert("You have successfully updated an position");
    }
    submit.value = false;
    positionStore.get();
    positionStore.unSelect();
    formErrors.value = {}
    payload.value = {};
  })
  .catch(err => {
    submit.value = false;
    formErrors.value = err.response.data.errors;
    console.warn(err);
  })
}

const handleResetForm = () => {
  positionStore.unSelect();
  payload.value = {};
}

const handleSearchRecord = debounce(() => {
  positionStore.get({
    q: searchQuery.value,
  });
}, 500)

const handleDeletePosition = (schedule) => {
  if(confirm('Are you sure you want to delete this position?')){
    positionStore.destroy(schedule)
    .then(res => {
      positionStore.get();
    })
  }
}


watch(
  () => positionStore.selectedPosition,
  (value) => {
    if(!isEmpty(value)){
      payload.value = cloneDeep(value);
    }
  }
)



onMounted(async () => {
  positionStore.get();
  positionStore.unSelect();
})

</script>

<template>
  <div class="container mx-auto grid grid-cols-12 gap-2">

    <div class="col-span-12 md:col-span-4">
      <Card title="Create Position/Designation" class="min-h-full">
        <form @submit.prevent="submitPositionForm">
          <div class="grid grid-cols-12">

            <div class="col-span-12">
              <FormInput label="Position Name" :errors="formErrors?.name">
                <input type="text" v-model="payload.name" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>


          </div>
          <div class="flex justify-between flex-row-reverse pt-6" v-if="positionStore.formType != 'schedule'">

            <button class="btn btn-primary" :disabled="submit">
              <span v-if="submit" class="loading loading-spinner"></span>
              <span>
                <span v-if="positionStore.formType == 'create'">Submit</span>
                <span v-else>Update</span>
              </span>
            </button>

            <button class="btn btn-default" v-if="positionStore.formType == 'update'" @click="handleResetForm">
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>

    <div class="col-span-12 md:col-span-8">
      <Card title="List of Positions/Designations" class="min-h-full">

        <div class="flex justify-between flex-row-reverse">
          <div class="flex join py-4">
            <input type="text" placeholder="Search for position" v-model="searchQuery" @keyup="handleSearchRecord($event)" class="input input-bordered input-sm w-full max-w-xs join-item" />
            <button type="button" class="btn btn-sm join-item">
              <SearchIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Position Name</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in positionStore.positions">
                <td>{{ row.name }}</td>
                <td class="text-center">
                  <div class="join">
                    <div class="tooltip tooltip-left" data-tip="Edit Position">
                      <button class="btn btn-ghost btn-sm btn-square" @click="positionStore.edit(row)">
                        <EditIcon class="w-5 h-5" />
                      </button>
                    </div>
                    <div class="tooltip tooltip-left" data-tip="Delete Position">
                      <button class="btn btn-ghost btn-sm btn-square" @click="handleDeletePosition(row)">
                        <DeleteIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="positionStore.positions.length == 0">
              <tr>
                <th colspan="20" class="text-center">
                  <p class="text-lg">No Data</p>
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
    
  </div>
</template>

<style>
.vc-time-picker{
  padding: 0 !important;
}
</style>
