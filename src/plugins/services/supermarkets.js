const resource = 'mercados'
// old id, wont delete anything if id is null
const OLD_ID = '519ce9db1161467d112cd003'

export default ($axios, helpers) => ({
  async create(supermarket) {
    const createSupermarket = Object.assign({}, supermarket)
    const response = await $axios.post(resource, createSupermarket)
    return this._dataIn(response)
  },
  async getAll(options) {
    const query = helpers.generateQueryFromOptions(options)
    const url = `${resource}${query}`
    const response = await $axios.get(url)
    const supermarkets = response.data.dados
    let result = []
    for (const supermarket of supermarkets) {
      result.push({
        ...supermarket,
        'primary-key': supermarket._id,
        mercado: supermarket.nome,
        responsavel: supermarket.responsavel ? supermarket.responsavel.nome : '',
      })
    }
    return [result, response.headers['x-total-count']]
  },
  async getOne(id) {
    return $axios.get(`${resource}/${id}`)
  },
  async getList(options) {
    const query = helpers.generateQueryFromOptions(options)
    return (await $axios.get(`${resource}/listar${query}`)).data.dados
  },
  async update(id, supermarket) {
    const updateSupermarket = Object.assign({}, supermarket)
    const response = await $axios.put(`${resource}/${id}`, updateSupermarket)
    return this._dataIn(response)
  },
  async remove(id) {
    return $axios.delete(`${resource}/${!!id ? id : OLD_ID}`)
  },
  async bulkRemove(ids) {
    ids = ids.map(id => !!id ? id : OLD_ID)
    return $axios.delete(`${resource}/bulk-remove`, { data: { ids } })
  },
  async import(files, onUploadProgress) {
    let formData = new FormData()
    formData.append('file', files)
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
  _dataIn(response) {
    const data = response.data.dados
    data.mercado = data.nome
    data.responsavel = data.responsavel ? data.responsavel.nome : ''
    response.data.dados = data
    return response
  }
})
