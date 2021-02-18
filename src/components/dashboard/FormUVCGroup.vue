<template>
  <div class="flex flex-col text-color">
    <h1 class="text-xl font-bold pb-5">{{heading}}</h1>
    <label for="add_groupname">Groupname</label>
    <input id="add_groupname"
      v-bind:value="editGroup.name"
      @input="group.name = $event.target.value"
      type="text"
      placeholder="Dach"
      class="rounded p-2 border-2 border-gray-500 mb-4">
    <label v-if="isEdit" for="add_groupid">Serialnumber</label>
    <input v-if="isEdit" id="add_groupid"
      v-bind:value="editGroup.id"
      v-bind:disabled="isEdit"
      @input="group.id = $event.target.value"
      type="text"
      placeholder="123456789"
      class="rounded p-2 border-2 border-gray-500 mb-4">
    <div class="">
        <button class="float-left font-semibold hover:transform hover:scale-105 transition-all"
          v-show="isEdit"
          v-on:click="$emit('delete', editGroup.id)">
          Delete
        </button>
        <div class="float-right space-x-2">
            <button class="font-semibold hover:transform hover:scale-105 transition-all"
              v-on:click="$emit(isEdit ? 'update' : 'add', {
                id: (group.id === '') ?
                  editGroup.id : group.id,
                name: (group.name === '') ?  editGroup.name : group.name,
              })">
              {{okProp}}
            </button>
            <button class="font-semibold hover:transform hover:scale-105 transition-all"
              v-on:click="$emit('close')">
              Close
            </button>
        </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'FormUVCGRoup',
  props: ['editGroup', 'isEdit'],
  computed: {
    okProp() {
      return this.isEdit ? 'Update' : 'Add';
    },
    heading() {
      return this.isEdit ? 'Update Group' : 'Add Group';
    },
  },
  data() {
    return {
      group: {
        name: '',
        id: '',
      },
    };
  },
  methods: {
  },
};
</script>
