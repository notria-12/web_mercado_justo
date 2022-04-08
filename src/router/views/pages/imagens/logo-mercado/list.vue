<script>
import List from '@components/common/list'
// import vSelect from '@components/common/vue-select.vue'
import { required } from '@vuelidate/validators'

export default {
  components: { List,  },
  data() {
    return {
      fields: [
        { key: 'url', label: 'imagem', include: false },
        { key: 'descricao', label: 'Descrição', sortable: true, include: false },
        { key: 'id', label: 'ID', sortable: true },
      ],
      searchFields: [
        { value: 'nome', text: 'Descrição' },
        { value: 'id', text: 'ID', type: 'number' },
      ],
      imageFields: ['url'],
      bulkRemoveMessage: 'Realmente deseja excluir as imagens selecionadas?'
    }
  },
  computed: {
    importConfig () {
      return {
        title: 'Logo de mercados',
        onSubmit: this.onSubmit,
        generalInstructions: [
          'As imagens devem estar em um dos formatos: .jpg ou .png.',
          'o nome do arquivo deve ser o ID do mercado.',
          'É possível selecionar uma ou várias ao mesmo tempo, ou ainda a pasta que contenha as imagens.',
        ],
        file: {
          accept: 'image/jpeg,image/png',
          multiple: true,
        }
      }
    },
    preSetSearch () {
      return [
        { field: 'categoria', term: 'logo', strict: true }
      ]
    },
    editableFields() {
      return [
        { key: 'id', type: 'number', placeholder: 'ID' },
      ]
    }
  },
  methods: {
    onSubmit (vueInstance) {
      if (vueInstance.file == null) {
        
        this.$bvToast.toast('Escolha um arquivo antes.', {
          autoHideDelay: 5000,
          variant: 'danger',
        })
        return
      }

      vueInstance.resetResponse()
      vueInstance.isSendingFile = true
      this.$services.images.import(vueInstance.file, vueInstance.onUploadProgress, this.supermarket)
        .then((response) => {
          const message = response.data.mensagem
          this.$bvToast.toast(message, {
            variant: 'success',
            autoHideDelay: 5000,
          })
          for(const state in response.data.dados.erros) {
            vueInstance.response.errors[state] = {
              isOpen: false,
              ...response.data.dados.erros[state]
            }
          }
          for(const state in response.data.dados.sucessos) {
            vueInstance.response.successes[state] = response.data.dados.sucessos[state]
          }
          this.$root.$emit('refreshlist')
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
          vueInstance.isSendingFile = false
          vueInstance.progressValue = 0
        })
    },
    updateItems (data, vueInstance) {
      const id = data.id
      const updatedData = data.data
      let found = false
      for (const item of vueInstance.items) {
        if (item && item['primary-key'] === id) {
          found = true
          for (const key in item) {
            if (key === 'primary-key') {
              item[key] = updatedData['_id']
            } else {
              item[key] = updatedData[key]
            }
          }
        }
      }
      if (!found) {
        vueInstance.items.push({
          'primary-key': updatedData._id,
          ...updatedData,
        })
      }
    },
    removeTemplate () {
      return 'Realmente deseja excluir a imagem?'
    },
    onUpdateRow (row, isTableBusy, vueInstance) {
      isTableBusy(true)
      // const index = row.index
      const item = row.item
      if (item['primary-key']) {
        this.$services.images.update(item['primary-key'], {
          id: item.id
        })
          .then(() => {
            vueInstance.lastRowDbclickedIndex = null
            vueInstance.loadList()
          })
          .catch((error) => {
            this.$common.serviceCatch(this, error)
          })
          .finally(() => {
            isTableBusy(false)
          })
      }
    },
    onEditClick(row, vueInstance) {
      if(row.index === vueInstance.lastRowDbclickedIndex) {
        vueInstance.lastRowDbclickedIndex = null
        return
      }
      
      vueInstance.lastRowDbclickedIndex = row.index
    },
    validationFactory() {
      return {
        form: {
          id: { required }
        }
      }
    }
  },
}
</script>

<template>
  <list
    ref="list"
    service-name="images"
    :fields="fields"
    :update-items="updateItems"
    :on-edit-click="onEditClick"
    :validation-factory="validationFactory"
    :remove-template="removeTemplate"
    :search-fields="searchFields"
    :image-fields="imageFields"
    :bulkRemove="true"
    :bulk-remove-message="bulkRemoveMessage"
    :editable-fields="editableFields"
    :update-row="onUpdateRow"
    :import-config="importConfig"
    :pre-set-search="preSetSearch"
  >
  </list>
</template>