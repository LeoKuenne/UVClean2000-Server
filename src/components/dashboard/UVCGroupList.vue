<template>
  <div class="p-5 overflow-auto" id="groups">
    <div class="absolute p-2 items-center bg-white shadow space-y-2">
      <h2 class="text-lg font-bold">Groups</h2>
      <button
        @click="showAddForm"
        class="w-full text-left text-primary hover:text-gray-600 hover:transform hover:scale-105
          hover:font-semibold transition-all inline-flex items-center shadow p-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5 mx-2" viewBox="0 0 16 16">
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2
            0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1
            0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        Add UVClean Group
      </button>
    </div>
    <div class="flex flex-row flex-wrap content-center justify-center">
        <UVCGroup
          @edit="editGroup($event)"
          v-on="$listeners"
          v-for="group in $dataStore.groups"
          :key="group.id"
          :group="group"
          class="shadow-lg">
        </UVCGroup>
    </div>
    <div
      v-show="showEditForm"
      class="fixed top-0 left-0 h-full w-full
      bg-black bg-opacity-50 flex justify-center items-center"
      >
      <FormUVCGroup
        @close="showEditForm = false"
        @update="updateGroup($event)"
        @delete="deleteGroup($event)"
        @add="addGroup($event)"
        :editGroup="formGroup"
        :isEdit="isFormEdit"
        class="absolute w-1/2 bg-gray-100 rounded p-5 border-2 border-gray-400 shadow-lg">
      </FormUVCGroup>
    </div>
  </div>
</template>
<script>
import UVCGroup from './UVCGroup.vue';
import FormUVCGroup from './FormUVCGroup.vue';

export default {
  name: 'UVCGroupList',
  components: {
    UVCGroup,
    FormUVCGroup,
  },
  methods: {
    showAddForm() {
      this.formGroup = {
        name: '',
        id: '',
      };
      this.isFormEdit = false;
      this.showEditForm = true;
    },
    addGroup(event) {
      this.$emit('groupAdd', event.name);
      this.showEditForm = false;
    },
    editGroup(group) {
      this.formGroup = group;
      this.isFormEdit = true;
      this.showEditForm = true;
    },
    updateGroup(group) {
      this.$emit('groupUpdate', { id: group.id, prop: 'name', newValue: group.name });
      this.showEditForm = false;
    },
    deleteGroup(serialnumber) {
      this.$emit('groupDelete', serialnumber);
      this.showEditForm = false;
    },
  },
  data() {
    return {
      showEditForm: false,
      isFormEdit: false,
      formGroup: {
        name: '',
        id: '',
      },
    };
  },
};
</script>
