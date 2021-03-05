<template>
  <div>
    <form class="flex flex-col space-y-2">
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
    };
  },
  methods: {
    handleSubmitAsGuest() {},
    handleSubmit(e) {
      e.preventDefault();
      if (this.password.length > 0) {
        this.$http.post('http://192.168.4.10:3000/login', {
          username: this.username,
          password: this.password,
        })
          .then((response) => {
            const { isAdmin } = response.data.user;
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('jwt', response.data.token);

            if (localStorage.getItem('jwt') != null) {
              this.$emit('loggedIn');
              if (this.$route.params.nextUrl != null) {
                this.$router.push(this.$route.params.nextUrl);
              } else if (isAdmin === 1) {
                this.$router.push('admin');
              } else {
                this.$router.push('dashboard');
              }
            }
          })
          .catch((error) => {
            console.error(error.response);
          });
      }
    },
  },
};
</script>
