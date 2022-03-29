export default ($store) => ({
  async login(data) {
    return $store.dispatch('auth/logIn', data)
  },
})