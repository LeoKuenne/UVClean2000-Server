<template>
  <div class="p-5">
      <h2 class="p-5 text-lg font-bold">Groups</h2>
      <div class="flex flex-row flex-wrap">
          <UVCGroup v-for="group in dataGroups" :key="group.name" :group="group">
          </UVCGroup>
      </div>
  </div>
</template>
<script>
import UVCGroup from './UVCGroup.vue';

export default {
  name: 'UVCGroupList',
  components: {
    UVCGroup,
  },
  props: ['dataGroups'],
};
</script>
