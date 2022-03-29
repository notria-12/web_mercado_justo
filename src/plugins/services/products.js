const resource = 'produtos'
// old id, wont delete anything if id is null
const OLD_ID = '519ce9db1161467d112cd003'

export default ($axios, helpers) => ({
  async create(product) {
    return await $axios.post(resource, product)
  },
  async getAll(options) {
    const query = helpers.generateQueryFromOptions(options)
    const url = `${resource}${query}`
    const response = await $axios.get(url)
    const products = response.data.dados
    let result = []
    for (const product of products) {
      result.push({
        'primary-key': product._id,
        descricao: product.descricao,
        codigo_barras: product.codigo_barras,
        categoria_1: product.categoria_1,
        categoria_2: product.categoria_2,
        categoria_3: product.categoria_3,
        unidade: product.unidade,
        cidade: product.cidade,
        uf: product.uf,
        ordem: product.ordem
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
  async update(id, product) {
    return await $axios.put(`${resource}/${id}`, product)
  },
  async remove(id) {
    return $axios.delete(`${resource}/${!!id ? id : OLD_ID}`)
  },
  async bulkRemove(ids) {
    ids = ids.map(id => !!id ? id : OLD_ID)
    return $axios.delete(`${resource}/bulk-remove`, { data: { ids } })
  },
  async import(file, onUploadProgress) {
    let formData = new FormData()
    formData.append('file', file)
    return $axios.post(
      `${resource}/importar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress,
      }
    )
  },
})
