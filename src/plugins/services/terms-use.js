const resource = 'termos-uso'

export default ($axios, helpers) => ({
  async create(termsUse) {
    return await $axios.post(resource, termsUse)
  },
  async getOne() {
    const response = await $axios.get(`${resource}`)
    return response.data.dados 
      ? response.data.dados.texto
      : ''
  },
  async update(termsUse) {
    return await $axios.put(`${resource}`, termsUse)
  },
  async remove() {
    return $axios.delete(`${resource}`)
  },
})
