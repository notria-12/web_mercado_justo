const resource = 'usuarios'

export default ($axios, helpers) => ({
  async create(user) {
    const createUser = Object.assign({}, user)
    const response = await $axios.post(resource, this._removeEmpty(createUser))
    return this._dataIn(response)
  },
  async getAll(options) {
    const query = helpers.generateQueryFromOptions(options)
    const url = `${resource}${query}`
    const response = await $axios.get(url)
    const users = response.data.dados
    let result = []
    for (const user of users) {
      result.push({
        'primary-key': user._id,
        nome: user.nome,
        cpf: user.cpf,
        email: user.email,
        id: user.responsavel_mercados,
        mercado: this._formatSupermarket(user.mercado),
        telefone: this._formatTelephone(user),
        orientacao: helpers.capitalize(user.orientacao),
        idade: user.idade,
        cidade: this._formatCity(user),
        uf: this._formatUF(user),
        data_cadastro: helpers.dateWithoutTime(user.data_cadastro),
        status_assinante: !!user.status_assinante ? 'Assinante' : 'Não',
        data_assinatura: helpers.dateWithoutTime(user.data_assinatura),
        data_assinatura_cancelada: helpers.dateWithoutTime(user.data_assinatura_cancelada),
        ultimo_acesso: helpers.dateWithTime(user.ultimo_acesso),
        acessos: await this.getAccessesFromUser(user._id),
        compartilhamentos: user.compartilhamentos,
        tipo_conta: helpers.capitalize(user.tipo_conta),
        permissoes: user.permissoes,
        _showDetails: user.tipo_conta == 'operador'
      })
    }
    return [result, response.headers['x-total-count']]
  },
  async getMe() {
    return (await $axios.get(`${resource}/eu`)).data.dados
  },
  async getOne(id) {
    return $axios.get(`${resource}/${id}`)
  },
  async getList() {
    return (await $axios.get(`${resource}/listar`)).data.dados
  },
  async update(id, user) {
    const updateUser = Object.assign({}, user)
    const response = await $axios.put(`${resource}/${id}`, this._removeEmpty(updateUser))
    return this._dataIn(response)
  },
  async remove(id) {
    if (!id) {
      // old id, wont delete anything if id is null
      id = '519ce9db1161467d112cd003'
    }
    return $axios.delete(`${resource}/${id}`)
  },
  async import(file, onUploadProgress, accountType) {
    let formData = new FormData()
    formData.append('file', file)
    return $axios.post(
      `${resource}/importar?tipo_conta=${accountType}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress,
      }
    )
  },
  async usedValue(field, value) {
    const usedValue = (await $axios.get(`${resource}/${field}/${value}`)).data.dados
    if (usedValue) {
      return true
    } else {
      return false
    }
  },

  async getAccessesFromUser(userId) {
    const query = helpers.generateQueryFromOptions({
      search: [
        { field: 'colecao', term: 'usuarios', strict: true },
        { field: 'usuario', term: userId, type: 'objectId' }
      ]
    })
    const url = `acessos${query}`
    const response = await $axios.get(url)
    return response.headers['x-total-count']
  },
  _dataIn(response) {
    let data = response.data.dados
    data.mercado = this._formatSupermarket(data.mercado)
    data.telefone = this._formatTelephone(data)
    data.cidade = this._formatCity(data)
    data.uf = this._formatUF(data)
    data.orientacao = helpers.capitalize(data.orientacao)
    data.data_cadastro = helpers.dateWithoutTime(data.data_cadastro)
    data.data_assinatura = helpers.dateWithoutTime(data.data_assinatura)
    data.data_assinatura_cancelada = helpers.dateWithoutTime(data.data_assinatura_cancelada)
    data.ultimo_acesso = helpers.dateWithTime(data.ultimo_acesso)
    data.tipo_conta = helpers.capitalize(data.tipo_conta)
    response.data.dados = data
    return response
  },
  _removeEmpty(user) {
    if (user.senha === "") {
      delete user.senha;
    }
    if (user.endereco) {
      if (user.endereco.cidade === null) {
        delete user.endereco
      }
    }
    return user
  },
  _formatIds(ids) {
    if (ids) {
      return ids.length > 1 ? ids.join(', ') : ids[0]
    } else {
      return ''
    }
  },
  _formatSupermarket(supermarkets) {
    return supermarkets ? supermarkets.nome : ''
  },
  _formatTelephone(user) {
    if (user.tipo_conta !== 'gerente') {
      return user.telefone ? user.telefone : ''
    } else {
      return user.mercado && user.mercado.telefone
        ? user.mercado.telefone
        : ''
    }
  },
  _formatCity(user) {
    if (user.tipo_conta !== 'gerente') {
      return user.endereco && user.endereco.cidade
        ? user.endereco.cidade : ''
    } else {
      return user.mercado && user.mercado.cidade
        ? user.mercado.cidade
        : ''
    }
  },
  _formatUF(user) {
    if (user.tipo_conta !== 'gerente') {
      return user.endereco && user.endereco.uf
        ? user.endereco.uf : ''
    } else {
      return user.mercado && user.mercado.uf
        ? user.mercado.uf
        : ''
    }
  }
})
