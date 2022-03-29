<script>
import List from '@/src/components/common/list'

export default {
  components: { List },
  data() {
    return {
      fields: [
        { key: 'nome', label: 'Nome', sortable: true },
        { key: 'cpf', label: 'CPF' },
        { key: 'email', label: 'E-mail' },
        { key: 'orientacao', label: 'Orientação' },
        { key: 'idade', label: 'Idade' },
        { key: 'cidade', label: 'Cidade', sortable: true },
        { key: 'uf', label: 'UF' },
        { key: 'data_cadastro', label: 'Cadastro' },
        { key: 'status_assinante', label: 'Status', sortable: true },
        { key: 'data_assinatura', label: 'Assinado' },
        { key: 'data_assinatura_cancelada', label: 'Cancelado' },
        { key: 'ultimo_acesso', label: 'Último Acesso', sortable: true },
        { key: 'acessos', label: 'Acessos' },
        { key: 'compartilhamentos', label: 'Compartilhamentos' },
      ],
      searchFields: [
        { value: 'nome', text: 'Nome' },
        { value: 'cpf', text: 'CPF' },
        { value: 'email', text: 'E-mail' },
      ],
      preSetSearch: [
        { field: 'tipo_conta', term: 'cliente', strict: true }
      ],
      iconFields: [
        { field: 'compartilhamentos', icon: 'share-alt'}
      ]
    }
  },
  methods: {
    updateItems(data, context) {
      const id = data.id
      const updatedData = data.data
      let found = false
      for (const item of context.items) {
        if (item && item['primary-key'] == id) {
          found = true
          for (const key in item) {
            if (key == 'primary-key') {
              item[key] = updatedData['_id']
            } else {
              item[key] = updatedData[key]
            }
          }
        }
      }
      if (!found) {
        context.items.push({
          'primary-key': updatedData._id,
          ...updatedData,
        })
      }
    },
    removeTemplate({ nome, cpf }) {
      return `Deseja remover o usuário ${nome}, CPF ${cpf}?`
    },
    onEditClick(row, vueInstance) {
      this.$bvModal
        .msgBoxOk('Disponível na próxima etapa.', {
          title: 'Aviso',
          okVariant: 'primary',
          okTitle: 'Ok',
        })
    }
  },
}
</script>

<template>
  <list
    service-name="users"
    :fields="fields"
    :pre-set-search="preSetSearch"
    :update-items="updateItems"
    :remove-template="removeTemplate"
    :search-fields="searchFields"
    :icon-fields="iconFields"
    :on-edit-click="onEditClick"  
  >
  </list>
</template>