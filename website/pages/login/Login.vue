<template>
  <div>
    <form class="flex flex-col space-y-2">
      <h1 class="font-bold text-lg text-center text-red-500" v-if="message">{{ message }}</h1>
      <input
        class="p-2 border border-gray-600 rounded"
        placeholder="Username"
        id="username"
        type="text"
        v-model="username"
        required
        autofocus>
      <input
        class="p-2 border border-gray-600 rounded"
        placeholder="Password"
        id="password"
        type="password"
        v-model="password"
        required>
      <button class="p-2 bg-primary text-white font-bold transform duration-75 hover:scale-105"
        type="submit"
        @click="handleSubmit">
        Login
      </button>
      <button
        class="transform duration-75 hover:scale-105"
        type="submit"
        @click="handleSubmitAsGuest">
        Login as guest
      </button>
    </form>
  </div>
</template>
<script>
export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      message: '',
    };
  },
  methods: {
    handleSubmitAsGuest() {},
    async handleSubmit(e) {
      e.preventDefault();
      if (this.password.length > 0) {
        fetch(`http://${process.env.VUE_APP_SERVER}:${process.env.VUE_APP_SERVER_PORT}/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
          // redirect: 'follow',
        }).then(async (response) => {
          if (response.status === 401) {
            const error = await response.json();
            throw new Error(error.msg);
          }
          if (response.redirected) {
            window.location.href = response.url;
          }
          return response;
        }).catch((error) => {
          this.message = error;
        });
      }
    },
  },
};
</script>
