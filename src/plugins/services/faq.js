const resource = 'perguntas-frequentes'

export default ($axios, helpers) => ({
  async create(faq) {
    return await $axios.post(resource, faq)
  },
  async getAll(options) {
    const query = helpers.generateQueryFromOptions(options)
    const url = `${resource}${query}`
    const response = await $axios.get(url)
    const faq = response.data.dados
    return [faq, response.headers['x-total-count']]
  },
  async getOne(id) {
    return $axios.get(`${resource}/${id}`)
  },
  async update(id, faq) {
    return await $axios.put(`${resource}/${id}`, faq)
  },
  async remove(id) {
    return $axios.delete(`${resource}/${id}`)
  },
})
