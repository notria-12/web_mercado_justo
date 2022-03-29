const resource = 'estado-cidade'

export default ($axios) => ({
  async getStates() {
    const states = (await $axios.get(`/${resource}/estados`)).data.dados;
    let result = []
    for (const state of states) {
      result.push({
        value: state.nome,
        text: `${state.sigla} - ${state.nome}`,
      })
    }
    return result
  },

  async getCitiesByState(state) {
    const cities = (await $axios.get(`/${resource}/${state}/cidades`)).data.dados
    let result = []
    for (const city of cities) {
      result.push({
        value: city.nome,
        text: city.nome,
        codigo_municipio: city.codigo_municipio,
      })
    }
    return result
  }
})
