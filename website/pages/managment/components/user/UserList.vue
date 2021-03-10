<template>
  <div>
    <div class="flex items-center space-x-5">
      <h2 class="text-lg font-bold">Users</h2>
      <button
        v-if="$dataStore.user.canEdit"
        class="flex text-left text-primary bg-white shadow items-center p-2
        hover:text-gray-600 hover:transform hover:scale-105
          hover:font-semibold transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5 mr-2" viewBox="0 0 16 16">
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2
            0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1
            0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        Add User
      </button>
    </div>
    <user
      v-for="user in users" :key="user.username"
      :user="user"
      >
    </user>
  </div>
</template>
<script>
import User from './User.vue';

export default {
  name: 'UserList',
  components: {
    User,
  },
  data() {
    return {
      users: [],
    };
  },
  created() {
    fetch('/api/users')
      .then((response) => {
        if (response.status === 404) {
          throw new Error('No data avalaible');
        }
        this.errorMessage = '';
        return response.json();
      })
      .then((response) => {
        this.users = response;
      })
      .catch();
  },

};
</script>
