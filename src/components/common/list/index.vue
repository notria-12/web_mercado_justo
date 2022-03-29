<script>
import { hasKeys } from '@utils/functions'
import listSearch from '@components/common/list/search.vue'
import listTable from '@components/common/list/table.vue'
import listPagination from '@components/common/list/pagination.vue'
import listImportModal from '@components/common/list/import-modal.vue';

export default {
  components: { listSearch, listTable, listPagination, listImportModal },
  props: {
    serviceName: {
      type: String,
      required: true,
    },
    updateItems: {
      type: Function,
      required: true,
    },
    onEditClick: {
      type: Function,
      required: false,
    },
    fields: {
      type: Array,
      required: true,
      validator: value => hasKeys(value, ['key', 'label'])
    },
    activeFields: {
      type: Array,
      required: false,
      validator: value => !value.some(v => typeof v !== 'string')
    },
    linkFields: {
      type: Array,
      required: false,
      validator: value => !value.some(v => typeof v !== 'string')
    },
    iconFields: {
      type: Array,
      required: false,
      validator: value => hasKeys(value, ['field', 'icon'])
    },
    imageFields: {
      type: Array,
      required: false,
      validator: value => !value.some(v => typeof v !== 'string')
    },
    editableFields: {
      type: Array,
      required: false,
      validator: value => hasKeys(value, ['key', 'type'])
    },
    updateRow: {
      type: Function,
      required: false,
    },
    removeTemplate: {
      type: Function,
      required: true,
    },
    removeItem: {
      type: Function,
      required: false,
    },
    searchFields: {
      type: Array,
      required: true,
      validator: value => hasKeys(value, ['value', 'text'])
    },
    importConfig: {
      type: Object,
      required: false,
      default: () => ({}),
      validator: value => hasKeys(value, ['title', 'requiredFields', 'optionalFields'])
    },
    showRegisterButton: {
      type: Boolean,
      required: false,
      default: true
    },
    showEditButton: {
      type: Boolean,
      required: false,
      default: true
    },
    showAfterImportSlot: {
      type: Boolean,
      required: false,
      default: false
    },
    bulkRemove: {
      type: Boolean,
      required: false,
      default: false
    },
    bulkRemoveMessage: {
      type: String,
      required: false,
    },
    preSetSearch: {
      type: Array,
      required: false,
      default: () => [],
      validator: value => hasKeys(value, ['field', 'term'])
    },
    loadOnMount: {
      type: Boolean,
      required: false,
      default: true
    },
    validationFactory: {
      type: Function,
      required: false
    },
    isSearchDisabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      currentPage: 1,
      perPage: 20,
      totalRows: 0,
      search: {
        field: 'all',
        term: '',
        type: null,
        strict: null
      },
      order: {
        field: '_id',
        direction: 1,
      },
    }
  },
  computed: {
    cColOffset: function() {
      const base = this.showImportButton ? 5 : 7
      return this.showAfterImportSlot ? base - 4 : base
    },
    showImportButton: function() {
      return Object.keys(this.importConfig).length > 0 && !this.importConfig.hideButton
    },
    completeSearch: function() {
      return [
        ...this.preSetSearch,
        this.search
      ]
    }
  },
  methods: {
    onImport () {
      this.$bvModal.show("import-modal")
    },
    onSearch () {
      if (!this.isSearchDisabled) {
        this.currentPage = 1
        this.$refs.listTable.onSearch()
      }
    },
    onSearchErase () {
      if (!this.isSearchDisabled) {
        this.search.term = ''
        this.perPage = 20
        this.order.field = '_id'
        this.order.direction = 1
        this.$refs.listTable.onSearchErase()
      }
    },
    onSearchTermUpdate(value) {
      const type = this.search.type
      if (type) {
        if (type == 'number') {
          this.search.term = Number(value)
        } else if (type == 'date') {
          this.search.term = new Date(value)
        } else if(type == 'boolean') {
          this.search.term = !!value
        }
      } else {
        this.search.term = value
      }
    },
    onSearchUpdate(value) {
      const search = this.searchFields.filter(searchField => searchField.value == value)[0]
      this.search.field = search.value
      this.search.type = search.type || null
      this.search.strict = search.strict || null
    },
    loadList() {
      this.onSearchErase()
    },
    appendEmptyItem(showDetails = false) {
      this.$refs.listTable.appendEmptyItem(showDetails)
    }
  }
}
</script>

<template>
  <div>
    <div class="row">
      <div v-show="showImportButton" class="col-2 mt-2 mb-3">
        <b-input-group>
          <b-button
            variant="primary"
            class="d-flex justify-content-center align-items-center"
            @click.prevent="onImport"
          >
            <feather
              class="mr-2"
              type="download"
              size="1.3em"
              style="overflow: initial"
            ></feather>
            Importar
          </b-button>
        </b-input-group>
      </div>
      <div v-if="showAfterImportSlot" class="col-4 row mt-2 mb-3">
        <slot name="after-import"></slot>
      </div>
      <div :class="`offset-${cColOffset} col-5 mt-2 mb-3`">
        <list-search
          :search="search"
          :search-fields="searchFields"
          :disabled="isSearchDisabled"
          @search="onSearch"
          @search-erase="onSearchErase"
          @search-term-update="onSearchTermUpdate"
          @search-update="onSearchUpdate"
        />
      </div>
    </div>
    <list-table
      ref="listTable"
      :service-name="serviceName"
      :update-items="updateItems"
      :on-edit-click="onEditClick"
      :fields="fields"
      :active-fields="activeFields"
      :link-fields="linkFields"
      :icon-fields="iconFields"
      :image-fields="imageFields"
      :remove-template="removeTemplate"
      :remove-item="removeItem"
      :show-register-button="showRegisterButton"
      :show-edit-button="showEditButton"
      :bulk-remove="bulkRemove"
      :bulk-remove-message="bulkRemoveMessage"
      :current-page="currentPage"
      :total-rows="totalRows"
      :order="order"
      :search="completeSearch"
      :per-page="perPage"
      :editable-fields="editableFields"
      :validation-factory="validationFactory"
      :update-row="updateRow"
      :load-on-mount="loadOnMount"
      @total-rows-update="v => totalRows = v"
      @edit="v => $parent.$emit('edit', v)"
      @loading="v => $parent.$emit('loading', v)"
      @toast="v => $parent.$emit('toast', v)"
    />
    
    <list-pagination 
      :current-page="currentPage"
      :total-rows="totalRows"
      :per-page="perPage"
      :order="order"
      :search-fields="searchFields"
      @current-page-update="v => currentPage = v"
      @order-field-update="v => order.field = v"
      @order-direction-update="v => order.direction = v"
      @per-page-update="v => perPage = v"
    />
    <list-import-modal
      :service-name="serviceName"
      :import-config="importConfig" 
    />
  </div>
</template>

<style>
</style>