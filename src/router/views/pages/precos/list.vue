<script>
import List from '@components/common/list'
import vSelect from '@components/common/vue-select.vue'

export default {
  components: { List, vSelect },
  data() {
    return {
      fields: [
        { key: 'descricao', label: 'Descrição', sortable: true, include: false },
        { key: 'codigo_barras', label: 'Código de Barras', sortable: true, include: false },
        { key: 'unidade', label: 'Unidade', include: false },
        { key: 'preco', label: 'Preço', sortable: true },
        { key: 'categoria_1', label: 'Categoria 1', sortable: true, include: false },
        { key: 'atualizado_em', label: 'Última Atualização', sortable: true, include: false }
      ],
      searchFields: [
        { value: 'descricao', text: 'Descrição' },
        { value: 'codigo_barras', text: 'Código de Barras', strict: true },
      ],
      supermarkets: [],
      supermarket: null,
      supermarketsIds: [],
      supermarketId: null,
      importConfig: {
        title: 'Preços',
        requiredFields: ['Código de Barras', 'ID'],
        optionalFields: ['Preço']
      },
      bulkRemoveMessage: 'Realmente deseja excluir todos os preços selecionados?'
    }
  },
  watch: {
    supermarket: function (newValue) {
      this.supermarketId = null
    },
    supermarketId: function(newValue) {
      if (newValue) {
        this.$nextTick(() => {
          this.loadList()
        })
      }
    }
  },
  computed: {
    isSupermarketIdSelectDisabled () {
      return this.supermarket === null
    },
    supermarketsIdsFilter () {
      const baseSearch = {
        search: [
          {
            field: 'nome',
            term: this.supermarket,
            strict: true,
          }
        ],
      }
      if (this.user.tipo_conta !== 'admin') {
        baseSearch.search.push({
          field: 'id',
          term: this.user.responsavel_mercados.length > 0 
            ? this.user.responsavel_mercados
            : null,
          type: 'number',
          multi: true
        })
      }
      return baseSearch
    },
    preSetSearch () {
      return [
        { field: 'id', term: this.supermarketId, type: 'number', strict: true }
      ]
    },
    user () {
      return this.$store.getters['auth/user']
    },
    editableFields() {
      return [
        { key: 'preco', type: 'string', mask: 'money', placeholder: 'Preço' },
      ]
    },
    isSearchDisabled() {
      return this.supermarketId === null
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData () {
      this.$emit('loading', true)      
      this.$services.supermarkets.getList({})
        .then((supermarkets) => {
          this.supermarkets = supermarkets
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
          this.$emit('loading', false)
        })
    },
    loadList() {
      this.$refs.list.loadList()
    },
    loadSupermarketList () {
      if(!this.supermarkets) {
        return
      }

      this.$services.supermarkets.getList(this.supermarketsIdsFilter)
      .then((supermarketsIds) => {
          this.supermarketsIds = supermarketsIds
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
          this.$emit('loading', false)
        })
    },
    updateItems (data, vueInstance) {
      const id = data.id
      const updatedData = data.data
      let found = false
      for (const item of vueInstance.items) {
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
        vueInstance.items.push({
          'primary-key': updatedData._id,
          ...updatedData,
        })
      }
    },
    removeTemplate () {
      return `Realmente deseja excluir o preço?`
    },
    onUpdateRow (row, isTableBusy, vueInstance) {
      if (!this.supermarketId) {
        this.$emit('toast', {
          variant: 'danger',
          message: 'Você deve escolher um ID antes.',
        })
        return
      }

      isTableBusy(true)
      const index = row.index
      const item = row.item
      if (item['primary-key']) {
        this.$services.prices.update(item['primary-key'], {
          preco: item.preco,
          id: this.supermarketId
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
      } else {
        this.$services.prices.create({
          preco: item.preco,
          produto: item.productId,
          id: this.supermarketId,
        })
        .then((response) => {
          const id = response.data.dados._id
          vueInstance.$set(vueInstance.items[index], 'primary-key', id)
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
      
      this.$bvModal
        .msgBoxConfirm('Realmente deseja alterar o preço do produto selecionado?', {
          title: 'Atenção',
          okVariant: 'danger',
          okTitle: 'Sim',
          cancelVariant: 'primary',
          cancelTitle: 'Cancelar',
        })
        .then((response) => {
          if(response) {
            vueInstance.lastRowDbclickedIndex = row.index
          }
        })
    },
    validationFactory() {
      return {
        form: {
          preco: { }
        }
      }
    }
  },
}
</script>

<template>
  <list
    ref="list"
    service-name="prices"
    :fields="fields"
    :update-items="updateItems"
    :on-edit-click="onEditClick"
    :validation-factory="validationFactory"
    :remove-template="removeTemplate"
    :remove-item="$common.removeItem"
    :search-fields="searchFields"
    :show-after-import-slot="true"
    :pre-set-search="preSetSearch"
    :editable-fields="editableFields"
    :update-row="onUpdateRow"
    :import-config="importConfig"
    :bulkRemove="true"
    :bulk-remove-message="bulkRemoveMessage"
    :load-on-mount="false"
    :show-register-button="false"
    :is-search-disabled="isSearchDisabled"
  >
    <template slot="after-import">
      <div class="col-6">
        <v-select
          placeholder="Selecione o Mercado"
          :options="supermarkets"
          v-model="supermarket"
          append-to-body
          @input="loadSupermarketList"
        />
      </div>
      <div class="col-6">
        <v-select
          placeholder="Selecione o ID"
          :options="supermarketsIds"
          :disabled="isSupermarketIdSelectDisabled"
          v-model="supermarketId"
          append-to-body
        />
      </div>
    </template>
  </list>
</template>