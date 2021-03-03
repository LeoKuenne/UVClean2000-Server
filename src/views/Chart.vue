<template>
  <div>
    <router-view class="w-full h-full">
    </router-view>
    <!-- <transition name="fade" mode="out-in">
    </transition> -->
  </div>
</template>
<script>
export default {

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
