import cnpj from '@plugins/validations/cnpj'
import cpf from '@plugins/validations/cpf'
import cep from '@plugins/validations/cep'

export default {
  install: function (Vue, options) {
    const validationsPlugin = {
      cnpj,
      cpf,
      cep
    }
    Vue.prototype.$validations = validationsPlugin
    Vue.$validations = validationsPlugin
  }
}
