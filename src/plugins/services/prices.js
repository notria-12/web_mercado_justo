const resource = 'precos'
// old id, wont delete anything if id is null
const OLD_ID = '519ce9db1161467d112cd003'

export default ($axios, helpers) => ({
  async create(price) {
    const createPrice = Object.assign({}, price)
    const response = await $axios.post(resource, createPrice)
    return this._dataIn(response)
  },
  async getAll(options) {
    const query = helpers.generateQueryFromOptions(options)
    const url = `${resource}${query}`
    const response = await $axios.get(url)
    const prices = response.data.dados
    let result = []
    for (const price of prices) {
      result.push({
        'primary-key': price._id,
        descricao: price.produto.descricao,
        codigo_barras: price.produto.codigo_barras.join(' '),
        unidade: price.produto.unidade,
        preco: price.preco,
        categoria_1: price.produto.categoria_1,
        atualizado_em: helpers.dateWithTime(price.atualizado_em),
      })
    }
    return [result, response.headers['x-total-count']]
  },
  async getOne(id) {
    return $axios.get(`${resource}/${id}`)
  },
  async update(id, price) {
    const updatePrice = Object.assign({}, price)
    const response = await $axios.put(`${resource}/${id}`, updatePrice)
    return this._dataIn(response)
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
  _dataIn(response) {
    const data = response.data.dados
    data.descricao = data.produto.descricao
    data.codigo_barras = data.produto.codigo_barras.join(' ')
    data.unidade = data.produto.unidade
    data.categoria_1 = data.produto.categoria_1
    data.atualizado_em = helpers.dateWithTime(data.atualizado_em)
    response.data.dados = data
    return response
  },
})
