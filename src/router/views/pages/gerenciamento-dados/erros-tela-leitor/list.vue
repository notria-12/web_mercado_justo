<script>
import List from '@/src/components/common/list'

export default {
  components: { List },
  data() {
    return {
      fields: [
        { key: 'codigo_barras', label: 'Código de Barras', sortable: true },
        { key: 'data_hora', label: 'Atualização', sortable: true },
      ],
      searchFields: [
        { value: 'codigo_barras', text: 'Código de Barras' },
      ],
      preSetSearch: [
        { field: 'tipo', term: 'erro_tela_leitor', strict: true }
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
    removeTemplate({ codigo_barras, data_hora }) {
      return `Deseja remover o código de barras ${codigo_barras}, enviado em ${data_hora}?`
    },
  },
}
</script>

<template>
  <list
    service-name="problems"
    :fields="fields"
    :pre-set-search="preSetSearch"
    :update-items="updateItems"
    :remove-template="removeTemplate"
    :search-fields="searchFields"
    :show-register-button="false"
    :show-edit-button="false"
    :bulk-remove="true"
    bulk-remove-message="Realmente deseja excluir todos os códigos selecionados?"
  >
  </list>
</template>