<template>
  <div class="bg-gray-200 rounded-lg overflow-hidden m-5">
    <div class="bg-gray-300 p-2 items-center">
        <h3 class="text-md font-bold text-gray-800">{{group.name}}</h3>
        <h4 class="text-sm text-gray-600">{{group.serialnumber}}</h4>
    </div>
    <div class="p-2 grid grid-cols-2 space-y-2 items-center">
    </div>
  </div>
</template>
<script>
export default {
    name: 'UVCGroup',
    props: ['group'],
};
</script>