<script setup>
import Card from '@/components/Card.vue'
import ComboBox from '@/components/ComboBox.vue'
import FormInput from '@/components/FormInput.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useOfficeStore } from '@/stores/office'
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
const officeStore = useOfficeStore();
const authStore = useAuthStore()

const searchQuery = ref("");

const payload = ref({});

const options = computed(() => officeStore.offices.map(i => {
  return {
    value: i.id,
    label: i.name,
  }
}))

const formErrors = ref({});

const submit = ref(false);

const submitOfficeForm = () => {
  submit.value = true;
  formErrors.value = {}
  if(authStore.authUser.role != 'admin'){
    payload.value.office_id = authStore.authUser.office_id;
  }
  officeStore.save(payload.value)
  .then((res) => {
    if (officeStore.formType == 'create') {
      alert("You have successfully added an office");
    }else{
      alert("You have successfully updated an office");
    }
    submit.value = false;
    officeStore.get();
    officeStore.unSelect();
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
  officeStore.unSelect();
  payload.value = {};
}

const handleSearchRecord = debounce(() => {
  officeStore.get({
    q: searchQuery.value,
  });
}, 500)

const handleDeleteOffice = (schedule) => {
  if(confirm('Are you sure you want to delete this office?')){
    officeStore.destroy(schedule)
    .then(res => {
      officeStore.get();
    })
  }
}


watch(
  () => officeStore.selectedOffice,
  (value) => {
    if(!isEmpty(value)){
      payload.value = cloneDeep(value);
    }
  }
)



onMounted(async () => {
  officeStore.get();
  officeStore.unSelect();
})

</script>

<template>
  <div class="container mx-auto grid grid-cols-12 gap-2">

    <div class="col-span-12 md:col-span-4">
      <Card title="Create Office">
        <form @submit.prevent="submitOfficeForm">
          <div class="grid grid-cols-12">

            <div class="col-span-12">
              <FormInput label="Office Name" :errors="formErrors?.name">
                <input type="text" v-model="payload.name" placeholder="" class="input input-bordered w-full" />
              </FormInput>
            </div>


          </div>
          <div class="flex justify-between flex-row-reverse pt-6" v-if="officeStore.formType != 'schedule'">

            <button class="btn btn-primary" :disabled="submit">
              <span v-if="submit" class="loading loading-spinner"></span>
              <span>
                <span v-if="officeStore.formType == 'create'">Submit</span>
                <span v-else>Update</span>
              </span>
            </button>

            <button class="btn btn-default" v-if="officeStore.formType == 'update'" @click="handleResetForm">
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>

    <div class="col-span-12 md:col-span-8">
      <Card title="List of Offices">

        <div class="flex justify-between flex-row-reverse">
          <div class="flex join py-4">
            <input type="text" placeholder="Search for office" v-model="searchQuery" @keyup="handleSearchRecord($event)" class="input input-bordered input-sm w-full max-w-xs join-item" />
            <button type="button" class="btn btn-sm join-item">
              <SearchIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Office Name</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in officeStore.offices">
                <td>{{ row.name }}</td>
                <td class="text-center">
                  <div class="join">
                    <div class="tooltip tooltip-left" data-tip="Edit Office">
                      <button class="btn btn-ghost btn-sm btn-square" @click="officeStore.edit(row)">
                        <EditIcon class="w-5 h-5" />
                      </button>
                    </div>
                    <div class="tooltip tooltip-left" data-tip="Delete Office">
                      <button class="btn btn-ghost btn-sm btn-square" @click="handleDeleteOffice(row)">
                        <DeleteIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="officeStore.offices.length == 0">
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
