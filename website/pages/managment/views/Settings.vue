<template>
  <div class="flex text-color">
  <div
    class="w-1/6 flex flex-col p-5 bg-gray-200 space-y-5">
    <div class="space-y-2">
      <h1 class="text-xl text-secondary font-bold">Overview</h1>
      <router-link
        :to="{ name: 'settingsUserList' }"
        :class="[this.$route.path === '/settings/user' ?
          'text-gray-600 transform scale-105 font-semibold' : '']"
        @click="$emit('showUser')"
        class="w-full text-left text-primary hover:text-gray-600 hover:transform hover:scale-105
          hover:font-semibold transition-all inline-flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5 mx-2" viewBox="0 0 16 16">
          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          <path fill-rule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75
            1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
          <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
        </svg>
        User
      </router-link>
    </div>
  </div>
    <transition name="fade" mode="out-in">
      <router-view
        class="w-5/6 h-full p-12">
      </router-view>
    </transition>
  </div>
</template>

<script>
// import Sidebar from '../components/dashboard/Sidebar.vue';

export default {
  name: 'Settings',
  components: {
    // Sidebar,
  },
  data() {
    return {
      prop_showAddForm: false,
    };
  },
};
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
