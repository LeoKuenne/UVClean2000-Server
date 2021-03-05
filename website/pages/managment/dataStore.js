import Vue from 'vue';

const dataStore = Vue.observable({
  user: '',
  devices: [],
  groups: [],
});

Vue.prototype.$store = dataStore;
