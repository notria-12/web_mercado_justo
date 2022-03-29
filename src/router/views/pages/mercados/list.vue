<script>
import List from '@/src/components/common/list'
import { required, requiredIf, integer, decimal, minLength, url, minValue } from '@vuelidate/validators'

export default {
  components: { List },
  data() {
    return {
      fields: [
        { key: 'mercado', label: 'Mercado', sortable: true },
        { key: 'id', label: 'ID' },
        { key: 'cnpj', label: 'CNPJ' },
        { key: 'latitude', label: 'Latitude' },
        { key: 'longitude', label: 'Longitude' },
        { key: 'telefone', label: 'Telefone' },
        { key: 'responsavel', label: 'Responsável', include: false },
        { key: 'site', label: 'Site' },
        { key: 'endereco', label: 'Endereço' },
        { key: 'cidade', label: 'Cidade', sortable: true },
        { key: 'uf', label: 'UF' },
        { key: 'ordem', label: 'Ordem', sortable: true },
        { key: 'visivel', label: 'Visível' }
      ],
      searchFields: [
        { value: 'nome', text: 'Mercado' },
        { value: 'cnpj', text: 'CNPJ' },
      ],
      linkFields: ['site'],
      ufs: [],
      cities: [],
      importConfig: {
        title: 'Mercados',
        requiredFields: ['Mercado', 'ID', 'Latitude', 'Longitude'],
        optionalFields: ['Site', 'CNPJ', 'Telefone', 'Endereço', 'Cidade', 'UF', 'Ordem'],
        hideButton: true,
      }
    }
  },
  computed: {
    editableFields() {
      return [
        { key: 'mercado', type: 'string', placeholder: 'Mercado' },
        { key: 'id', type: 'number', placeholder: 'ID' },
        { key: 'cnpj', type: 'string', mask: 'cnpj', placeholder: 'CNPJ' },
        { key: 'latitude', type: 'number', step: '0.00001', placeholder: 'Latitude' },
        { key: 'longitude', type: 'number', step: '0.00001', placeholder: 'Longitude' },
        { key: 'telefone', type: 'string', mask: 'telephone', placeholder: 'Telefone' },
        { key: 'site', type: 'string', placeholder: 'Site', title: 'Deve conter o protocolo (https:// ou http://)' },
        { key: 'endereco', type: 'string', placeholder: 'Endereço' },
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
        { key: 'ordem', type: 'number', placeholder: 'Ordem' },
        { key: 'visivel', type: 'boolean' }
      ]
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.$emit('loading', true)
      this.$services.stateCity.getStates()
        .then((states) => {
          this.ufs = states.map(state => ({
            value: state.text.split('-')[0].trim(),
            text: state.text.split('-')[0].trim()
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
      return `Realmente deseja excluir o mercado?`
    },
    onUpdateRow (row, isTableBusy, vueInstance) {
      const index = row.index
      const item = row.item
      isTableBusy(true)

      if (item['primary-key']) {
        this.$services.supermarkets.update(item['primary-key'], {
          nome: item.mercado,
          id: item.id,
          cnpj: item.cnpj || null,
          latitude: item.latitude,
          longitude: item.longitude,
          telefone: item.telefone || null,
          site: item.site || null,
          endereco: item.endereco || null,
          cidade: item.cidade || null,
          uf: item.uf || null,
          ordem: item.ordem || null,
          visivel: item.visivel
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
        this.$services.supermarkets.create({
          nome: item.mercado,
          id: item.id,
          cnpj: item.cnpj || null,
          latitude: item.latitude,
          longitude: item.longitude,
          telefone: item.telefone || null,
          site: item.site || null,
          endereco: item.endereco || null,
          cidade: item.cidade || null,
          uf: item.uf || null,
          ordem: item.ordem || null,
          visivel: item.visivel || false
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
      if (row.item.uf) {
        this.onStateSelect(row.item.uf)
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
          mercado: { required },
          id: { 
            required, 
            integer,
            minValue: minValue(1)
          },
          cnpj: {
            isValid: (value) => {
              return vueInstance.$validations.cnpj(value)
            }
          },
          latitude: { required, decimal },
          longitude: { required, decimal },
          telefone: { 
            minLength: minLength(14)
          },
          site: { url },
          endereco: { },
          cidade: { 
            required: requiredIf(() => {
              return !!vueInstance.form.uf
            })
          },
          uf: { },
          ordem: { 
            integer,
            minValue: minValue(1)
          },
          visivel: { }
        }
      }
    }
  },
}
</script>

<template>
  <list
    ref="list"
    service-name="supermarkets"
    :fields="fields"
    :update-items="updateItems"
    :remove-template="removeTemplate"
    :remove-item="$common.removeItem"
    :search-fields="searchFields"
    :on-edit-click="onEditClick"
    :editable-fields="editableFields"
    :validation-factory="validationFactory"
    :link-fields="linkFields"
    :update-row="onUpdateRow"
    :import-config="importConfig"
    :bulkRemove="true"
  >
  </list>
</template>