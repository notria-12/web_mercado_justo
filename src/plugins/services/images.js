const resource = 'imagens'

export default ($axios, helpers) => ({
  async getAll(options) {
    const query = helpers.generateQueryFromOptions(options)
    const url = `${resource}${query}`
    const response = await $axios.get(url)
    const images = response.data.dados
    let result = []
    for (const image of images) {
      result.push({
        'primary-key': image._id,
        id: image.id || '',
        codigo_barras: image.codigo_barras || '',
        url: image.url,
        descricao: this._getDescription(image)
      })
    }
    return [result, response.headers['x-total-count']]
  },
  async update(id, image) {
    const updateImage = Object.assign({}, image)
    const response = await $axios.put(`${resource}/${id}`, updateImage)
    return this._dataIn(response)
  },
  async remove(id) {
    return $axios.delete(`${resource}/${id}`)
  },
  async bulkRemove(ids) {
    return $axios.delete(`${resource}/bulk-remove`, { data: { ids } })
  },
  async import(files, onUploadProgress) {
    let formData = new FormData()
    for (const file of files) {
      formData.append('files', file)
    }
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
  _getDescription(image) {
    if (image.categoria === 'produto') {
      return image.produto ? image.produto.descricao : ''
    } else {
      return image.mercado ? image.mercado.nome : ''
    }
  },
  _dataIn(response) {
    const data = response.data.dados
    data.descricao = this._getDescription(data)
    response.data.dados = data
    return response
  }
})