<script>
import List from '@/src/components/common/list'
import { required, requiredIf,  integer, minLength, minValue } from '@vuelidate/validators'

export default {
  components: { List },
  data() {
    return {
      fields: [
        { key: 'descricao', label: 'Descrição', sortable: true },
        { key: 'codigo_barras', label: 'Código de Barras', sortable: true, default: [] },
        { key: 'categoria_1', label: 'Categoria 1', sortable: true  },
        { key: 'categoria_2', label: 'Categoria 2', sortable: true  },
        { key: 'categoria_3', label: 'Categoria 3', sortable: true  },
        { key: 'unidade', label: 'Unid' },
        { key: 'cidade', label: 'Cidade' },
        { key: 'uf', label: 'UF' },
        { key: 'ordem', label: 'Ordem', sortable: true }
      ],
      searchFields: [
        { value: 'descricao', text: 'Descrição' },
        { value: 'codigo_barras', text: 'Código de Barras' },
      ],
      importConfig: {
        title: 'Produtos',
        requiredFields: ['Descrição', 'Código de Barras', 'Categoria 1'],
        optionalFields: [
          'Categoria 2', 
          'Categoria 3', 
          '*Unidade', 
          '*Valores válidos: unid, gr e kg.'
        ],
        hideButton: true,
      },
      bulkRemoveMessage: 'Realmente deseja excluir todos os itens selecionados?',
      categories_1: [],
      categories_2: [],
      categories_3: [],
      unidades: [
        { value: 'unid', text: 'Unid' },
        { value: 'gr', text: 'Grama' },
        { value: 'kg', text: 'Quilo' },
      ],
      ufs: [],
      cities: [],
    }
  },
  computed: {
    editableFields () {
      return [
        { key: 'descricao', type: 'string', placeholder: 'Descrição' },
        { 
          key: 'codigo_barras', 
          type: 'string', 
          mask: 'tags',
          placeholder: 'Código de barras',
        },
        { 
          key: 'categoria_1', 
          type: 'select', 
          options: this.categories_1,
          callback: this.onFirstCatSel,
          placeholder: 'Selecione a categoria'
        },
        { 
          key: 'categoria_2', 
          type: 'select', 
          options: this.categories_2,
          callback: this.onSecondCatSel,
          placeholder: 'Selecione a categoria'
        },
        { 
          key: 'categoria_3', 
          type: 'select', 
          options: this.categories_3,
          placeholder: 'Selecione a categoria'
        },
        { 
          key: 'unidade', 
          type: 'select', 
          options: this.unidades,
          placeholder: 'Selecione a unidade'
        },
        { 
          key: 'cidade', 
          type: 'select', 
          options: this.cities,
          placeholder: 'Selecione a cidade' ,
        },
        { 
          key: 'uf', 
          type: 'select', 
          options: this.ufs, 
          callback: this.onStateSelect, 
          placeholder: 'Selecione o estado',
        },
        { key: 'ordem', type: 'number', placeholder: 'Ordem' }
      ]
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.$emit('loading', true)
      const statePromise = this.$services.stateCity.getStates()
      const categories1Promise = this.$services.categories.getAll({
        perPage: 1000,
        search: {
          field: 'pai',
          term: '0',
          type: 'null'
        }
      })

      Promise.all([statePromise, categories1Promise])
        .then(([states, [categories]]) => {
          this.ufs = states.map(state => ({
            value: state.text.split('-')[0].trim(),
            text: state.text.split('-')[0].trim()
          }))
          this.categories_1 = categories.map(category => ({
            value: category.nome,
            text: category.nome,
            id: category.id,
          }))
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
          this.$emit('loading', false)
        })
    },
    onStateSelect(value, row, vueInstance) {
      if (row) {
        const index = row.index
        this.$set(vueInstance.items[index], 'cidade', null)
        vueInstance.$v.form.cidade.$model = null
      }
      if (!value) {
        return
      }

      this.$services.stateCity.getCitiesByState(value)
        .then((cities) => {
          this.cities = cities
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
    },
    onFirstCatSel(value, row, vueInstance) {
      if (row) {
        const index = row.index
        this.$set(vueInstance.items[index], 'categoria_2', null)
        this.$set(vueInstance.items[index], 'categoria_3', null)
        vueInstance.$v.form['categoria_2'].$model = null
        vueInstance.$v.form['categoria_3'].$model = null
        this.categories_2 = []

        if (value) {
          this.loadSubCategories(value, 1)
        }
      }
    },
    loadSubCategories(value, baseCategoriesNumber) {
      return new Promise((resolve, reject) => {
        const id = this[`categories_${baseCategoriesNumber}`].filter(cat => cat.value === value)[0].id
        this.$services.categories.getAll({
          perPage: 1000,
          search: {
            field: 'pai',
            term: id,
            type: 'objectId'
          }
        })
        .then(([categories]) => {
          this[`categories_${baseCategoriesNumber + 1}`] = categories.map(category => ({
            value: category.nome,
            text: category.nome,
            id: category.id,
          }))
          resolve(true)
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
          reject(error)
        })
      })
      
    },
    onSecondCatSel(value, row, vueInstance) {
      if (row) {
        const index = row.index
        this.$set(vueInstance.items[index], 'categoria_3', null)
        vueInstance.$v.form['categoria_3'].$model = null
      }

      if (value) {
        this.loadSubCategories(value, 2)
      }
    },
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
    removeTemplate() {
      return 'Realmente deseja excluir o item?'
    },
    onUpdateRow (row, isTableBusy, vueInstance) {
      const index = row.index
      const item = row.item
      isTableBusy(true)

      if (item['primary-key']) {
        this.$services.products.update(item['primary-key'], {
          descricao: item.descricao,
          codigo_barras: item.codigo_barras,
          categoria_1: item.categoria_1,
          categoria_2: item.categoria_2 || null,
          categoria_3: item.categoria_3 || null,
          unidade: item.unidade || null,
          cidade: item.cidade || null,
          uf: item.uf || null,
          ordem: item.ordem || null
        })
          .then((response) => {
            this.$bvToast.toast(response.data.mensagem, {
              autoHideDelay: 5000,
              variant: 'success',
            })
            vueInstance.lastRowDbclickedIndex = null
            vueInstance.loadList()
          })
          .catch((error) => {
            this.$common.serviceCatch(this, error)
          })
          .finally(() => {
            isTableBusy(false)
          })
      } else {
        this.$services.products.create({
          descricao: item.descricao,
          codigo_barras: item.codigo_barras,
          categoria_1: item.categoria_1,
          categoria_2: item.categoria_2 || null,
          categoria_3: item.categoria_3 || null,
          unidade: item.unidade || null,
          cidade: item.cidade || null,
          uf: item.uf || null,
          ordem: item.ordem || null
        })
          .then((response) => {
            this.$bvToast.toast(response.data.mensagem, {
              autoHideDelay: 5000,
              variant: 'success',
            })
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
      const item = row.item
      if (item.uf) {
        this.onStateSelect(row.item.uf)
      }
      
      if (item.categoria_1) {
        this.loadSubCategories(item.categoria_1, 1)
          .then(() => {
            if (item.categoria_2) {
              this.loadSubCategories(item.categoria_2, 2)
            }
          })
      }
    },
    appendEmptyItem(showDetails = false) {
      this.$refs.list.appendEmptyItem(showDetails)
    },
    onImport() {
      this.$refs.list.onImport()
    },
    validationFactory(vueInstance) {
      return {
        form: {
          descricao: { required },
          codigo_barras: {
            required,
            minLength: minLength(1)
          },
          categoria_1: { required },
          categoria_2: {
            required: requiredIf(() => {
              return !!vueInstance.form.categoria_3
            })
          },
          categoria_3: { },
          unidade: { },
          cidade: { 
            required: requiredIf(() => {
              return !!vueInstance.form.uf
            })
          },
          uf: { },
          ordem: {
            integer,
            minValue: minValue(1)
          }
        }
      }
    }
  },
}
</script>

<template>
  <list
    ref="list"
    service-name="products"
    :fields="fields"
    :update-items="updateItems"
    :remove-template="removeTemplate"
    :remove-item="$common.removeItem"
    :search-fields="searchFields"
    :on-edit-click="onEditClick"
    :editable-fields="editableFields"
    :validation-factory="validationFactory"
    :update-row="onUpdateRow"
    :bulkRemove="true"
    :bulk-remove-message="bulkRemoveMessage"
    :import-config="importConfig"
  >
  </list>
</template>