const resource = 'dashboard'

export default ($axios, helpers) => ({
  async getAll() {
    return (await $axios.get(resource)).data.dados
  },
})
