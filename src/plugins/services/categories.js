const resource = 'categorias'

export default ($axios, helpers) => ({
  async create(category) {
    return await $axios.post(resource, category)
  },
  async getAll(options) {
    const query = helpers.generateQueryFromOptions(options)
    const url = `${resource}${query}`
    const response = await $axios.get(url)
    const categories = response.data.dados
    let result = []
    for (const category of categories) {
      result.push({
        id: category._id,
        nome: category.nome,
        pai: category.pai,
      })
    }
    return [result, response.headers['x-total-count']]
  },
  async getOne(id) {
    return $axios.get(`${resource}/${id}`)
  },
  async getList() {
    return (await $axios.get(`${resource}/listar`)).data.dados
  },
  async update(id, category) {
    return await $axios.put(`${resource}/${id}`, category)
  },
  async remove(id) {
    return $axios.delete(`${resource}/${id}`)
  },
})
