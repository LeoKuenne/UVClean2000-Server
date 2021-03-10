<template>
  <div class="h-24 m-2 flex border border-gray-300 rounded overflow-hidden">
    <div class="h-24 w-24 flex items-center justify-center bg-primary text-white">
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="h-16 w-16" viewBox="0 0 16 16">
        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
        <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468
          11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
      </svg>
    </div>
    <div class="w-full pl-2">
      <div class="flex items-center justify-between">
        <h1 class="font-bold text-lg">{{ user.username }}</h1>
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5 mx-2 text-black" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1
          .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
          <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0
            1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1
            1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5
            3V2h11v1h-11z"/>
        </svg>
      </div>
      <div class="pl-2">
        <h2 class="font-bold text-base">Settings</h2>
        <div class="space-x-2 text-sm flex items-center">
          <label for="cbxCanEdit">Can edit:</label>
          <input type="checkbox" id="cbxCanEdit">
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    user: Object,
  },
};
</script>
