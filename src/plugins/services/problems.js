const resource = 'problemas'

export default ($axios, helpers) => ({
  async getAll(options) {
    const query = helpers.generateQueryFromOptions(options)
    const url = `${resource}${query}`
    const response = await $axios.get(url)
    const problems = response.data.dados
    let result = []
    for (const problem of problems) {
      result.push({
        'primary-key': problem._id,
        codigo_barras: problem.codigo_barras,
        data_hora: helpers.dateWithTime(problem.data_hora),
      })
    }
    return [result, response.headers['x-total-count']]
  },
  async remove(id) {
    return $axios.delete(`${resource}/${id}`)
  },
  async bulkRemove(ids) {
    return $axios.delete(`${resource}/bulk-remove`, { data: { ids } })
  }
})