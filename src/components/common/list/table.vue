<script>
import { hasKeys } from '@utils/functions'
import vMoney from '@components/common/v-money.vue'
import vSelect from '@components/common/vue-select.vue'
import useVuelidate from '@vuelidate/core'

export default {
  components: { vMoney, vSelect },
  props: {
    serviceName: {
      type: String,
      required: true,
    },
    onEditClick: {
      type: Function,
      required: false,
    },
    updateItems: {
      type: Function,
      required: true,
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
      default: function (id) {
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i] && this.items[i]['primary-key'] == id) {
            this.items.splice(i, 1)
            this.$emit('total-rows-update', this.totalRows - 1)
          }
        }
      }
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
    bulkRemove: {
      type: Boolean,
      required: false,
      default: false
    },
    bulkRemoveMessage: {
      type: String,
      required: false,
      default: 'Realmente deseja fazer isto?'
    },
    currentPage: {
      type: Number,
      required: true
    },
    perPage: {
      type: Number,
      required: true
    },
    totalRows: {
      type: [Number, String],
      required: true
    },
    order: {
      type: Object,
      required: true,
      validator: value => hasKeys(value, ['field', 'direction'])
    },
    search: {
      type: [Object, Array],
      required: true,
      validator: value => hasKeys(value, ['term', 'field'])
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
    small: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  watch: {
    currentPage: function (newValue) {
      this.lastRowDbclickedIndex = null
      if(!this.isPageLoaded()) {
        this.resetIsImageLoaded()
      }
      this.loadNewPage(newValue)
    },
    perPage: function (newValue) {
      if (!this.pagesLoaded[newValue].includes(1)) {
        this.loadNewPage(this.currentPage)
      }
    },
  },
  data() {
    return {
      items: [],
      pagesLoaded: {
        5: [],
        10: [],
        20: [],
        30: [],
      },
      bulkRemoveIds: [],
      lastRowDbclickedIndex: null,
      isTableBusy: false,
      cnpjMask: '##.###.###/####-##',
      cpfMask: '###.###.###-##',
      telephoneMask: ['(##) ####-####', '(##) #####-####'],
      form: {},
      $v: {},
      imageLoaded: {
        5: Array.from({length: 5}).map(() => false),
        10: Array.from({length: 10}).map(() => false),
        20: Array.from({length: 20}).map(() => false),
        30: Array.from({length: 30}).map(() => false),
      }
    }
  },
  computed: {
    cFields: function () {
      let newFields = []
      if (this.bulkRemove) {
        newFields = [
          { key: 'select', label: '' }
        ]
      } 
      return [
        ...this.fields,
        {
          key: 'buttons',
          label: 'Opções',
        },
        ...newFields,
      ]
    },
    isMoreThanOneSelected: function () {
      return this.bulkRemoveIds.length > 1
    },
    isAllSelected: function() {
      if(this.items.length === 0) {
        return false
      }
      
      let currItemsFirstIndex = (this.currentPage - 1) * this.perPage
      const currItemsLastIndex = currItemsFirstIndex + this.perPage

      while(
        this.items[currItemsFirstIndex++] 
        && currItemsFirstIndex <= currItemsLastIndex
      ) {
        if (!this.bulkRemoveIds.includes(this.items[currItemsFirstIndex - 1]['primary-key'])) {
          return false
        }
      }
      return true
    },
    showUpdateButton: function() {
      return this.editableFields && this.editableFields.length > 0
    }
  },
  mounted() {
    if (this.loadOnMount) {
      this.loadList()
    }
    if (this.validationFactory) {
      this.setupValidations()
    }

    this.$root.$on('updatelist', (data) => {
      this.updateList(data)
    })
    this.$root.$on('refreshlist', () => {
      this.onSearchErase()
    })
  },
  beforeDestroy() {
    this.$root.$off()
  },
  methods: {
    edit(id, row) {
      if (this.onEditClick) {
        this.onEditClick(row, this)
        this.updateForm(row.item)
      } else {
        this.$emit('edit', id)
      }
      if (this.validationFactory) {
        this.$v.form.$reset()
      }
    },
    remove(id, item) {
      this.$bvModal
        .msgBoxConfirm(this.removeTemplate(item), {
          title: 'Atenção',
          okVariant: 'danger',
          okTitle: 'Remover',
          cancelVariant: 'primary',
          cancelTitle: 'Cancelar',
        })
        .then((response) => {
          if (response) {
            this.$emit('loading', true)
            this.$services[this.serviceName].remove(id)
              .then((response) => {
                const message = response.data.mensagem
                this.removeItem(id, this)
                this.$emit('toast', {
                  variant: 'success',
                  message,
                })
                this.loadList()
              })
              .catch((error) => {
                this.$common.serviceCatch(this, error)
              })
              .finally(() => {
                this.$emit('loading', false)
              })
          }
        })
    },
    loadList() {
      this.$emit('loading', true)
      this.$services[this.serviceName].getAll({
        perPage: this.perPage,
        currentPage: this.currentPage,
        search: this.search,
        order: this.order,
      })
        .then(([items, xTotalCount]) => {
          this.$emit('total-rows-update', xTotalCount) 
          this.holdLoadedItems(items)
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
          this.$emit('loading', false)
        })
    },
    updateList(data) {
      this.updateItems(data, this)
    },
    removeItems(ids) {
      for (const id of ids) {
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i] && this.items[i]['primary-key'] == id) {
            this.items.splice(i, 1)
          }
        }
      }
      this.$emit('total-rows-update', this.items.length)
      this.bulkRemoveIds = []
    },
    loadNewPage(page) {
      if (!this.pagesLoaded[this.perPage].includes(page)) {
        this.loadList()
      }
    },
    holdLoadedItems(items) {
      const currentItemsFirstIndex = (this.currentPage - 1) * this.perPage
      const currentItemsLastIndex = currentItemsFirstIndex + this.perPage
      for (
        let i = currentItemsFirstIndex, j = 0;
        i < currentItemsLastIndex, j < items.length;
        i++, j++
      ) {
        this.$set(this.items, i, items[j])
      }
      this.updatePagesLoaded()
    },
    updatePagesLoaded() {
      const itemsLoaded = this.perPage * this.currentPage
      for (const key in this.pagesLoaded) {
        let lastPageLoadedRelativeCurrPerPage = Math.floor(itemsLoaded / key)
        const pagesRelativeCurrPerPage = Math.floor(this.perPage / key)
        for (let i = 0; i < pagesRelativeCurrPerPage; i++) {
          this.pagesLoaded[key].push(lastPageLoadedRelativeCurrPerPage--)
        }
      }
    },
    onSearch() {
      this.resetTable()
      this.loadList()
      this.resetIsImageLoaded()
    },
    resetTable() {
      this.items = []
      this.pagesLoaded = {
        5: [],
        10: [],
        20: [],
        30: [],
      }
      this.lastRowDbclickedIndex = null
    },
    resetIsImageLoaded() {
      this.imageLoaded = {
        5: Array.from({length: 5}).map(() => false),
        10: Array.from({length: 10}).map(() => false),
        20: Array.from({length: 20}).map(() => false),
        30: Array.from({length: 30}).map(() => false),
      }
    },
    onSearchErase() {
      this.resetTable()
      this.loadList()
      this.resetIsImageLoaded()
    },
    onFirstRegister() {
      this.$root.$emit('onFirstRegister')
    },
    onSelect(isSelected, id) {
      if (isSelected) {
        this.bulkRemoveIds.push(id)
      } else {
        for (const [index, idToRemove] of this.bulkRemoveIds.entries()) {
          if(idToRemove === id) {
            this.bulkRemoveIds.splice(index, 1)
          }
        }
      }
    },
    onSelectAll(isSelected) {
      if(isSelected) {
        let currItemsFirstIndex = (this.currentPage - 1) * this.perPage
        const currItemsLastIndex = currItemsFirstIndex + this.perPage

        while(
          this.items[currItemsFirstIndex++] 
          && currItemsFirstIndex <= currItemsLastIndex
        ) {
          this.bulkRemoveIds.push(this.items[currItemsFirstIndex - 1]['primary-key'])
        }
      } else {
        this.bulkRemoveIds = []
      }
    },
    onBulkRemove() {
       this.$bvModal
        .msgBoxConfirm(this.bulkRemoveMessage, {
          title: 'Atenção',
          okVariant: 'danger',
          okTitle: 'Remover',
          cancelVariant: 'primary',
          cancelTitle: 'Cancelar',
        })
        .then((response) => {
          if (response) {
            this.$emit('loading', true)
            this.$services[this.serviceName].bulkRemove(this.bulkRemoveIds)
              .then((response) => {
                const message = response.data.mensagem
                this.removeItems(this.bulkRemoveIds)
                this.$emit('toast', {
                  variant: 'success',
                  message,
                })
                this.loadList()
              })
              .catch((error) => {
                this.$common.serviceCatch(this, error)
              })
              .finally(() => {
                this.$emit('loading', false)
              })
          }
        })
    },
    onRowDbclicked (item, index, event) {
      if (!this.showEditButton) {
        this.lastRowDbclickedIndex = index
      }
    },
    showEditableVersion (index) {
      return this.lastRowDbclickedIndex === index
    },
    onEditableCheckboxMulti (value, row, callback = () => null) {
      const currentItemsFirstIndex = (this.currentPage - 1) * this.perPage
      const index = row.index
      const key = row.field.key
      if (this.$v.form[key]) {
        this.$v.form[key].$model = value
      }
      this.$set(this.items[currentItemsFirstIndex + index], key, value)
      callback(value, row, this)
    },
    onEditableInput (value, row, callback = () => null) {
      const currentItemsFirstIndex = (this.currentPage - 1) * this.perPage
      const index = row.index
      const key = row.field.key
      if (this.$v.form[key]) {
        this.$v.form[key].$model = value
      }
      this.$set(this.items[currentItemsFirstIndex + index], key, value)
      callback(value, row, this)
    },
    setTableBusy(isBusy) {
      this.isTableBusy = isBusy
    },
    onUpdateRow (row) {
      if (this.updateRow && this.lastRowDbclickedIndex !== null) {
        this.$v.$touch()
        if (this.$v.form.$invalid) {
          this.$emit('toast', {
            variant: 'danger',
            message: 'Os dados estão inválidos.',
          })
          return
        }
        this.updateRow(row, this.setTableBusy, this)
      }
    },
    fixLink(url) {
      if(url.startsWith('http')) {
        return url
      } else {
        return `http://${url}`
      }
    },
    appendEmptyItem(showDetails = false) {
      const currentItemsFirstIndex = (this.currentPage - 1) * this.perPage
      this.$set(this.items, currentItemsFirstIndex, {
        ...this.fields.reduce((acc, field) => {
          Object.assign(acc, {
            [field.key]: field.default ? field.default : ''
          })
          return acc
        }, {}),
        _showDetails: showDetails
      })
      this.lastRowDbclickedIndex = currentItemsFirstIndex
      this.$v.$reset()
    },
    isLinkField(field) {
      return this.linkFields && this.linkFields.includes(field)
    },
    isDefaultField(edit) {
      return ['string', 'number'].includes(edit.type) 
        && !this.isLinkField(edit.key) 
        && edit.mask !== 'tags'
    },
    setupValidations() {
      for (const field of this.fields) {
        if (typeof field.include == 'undefined') {
          this.$set(this.form, field.key, field.default || '')
        }
      }
      this.$v = useVuelidate(
        this.validationFactory(this),
        this
      ).value
    },
    updateForm(item) {
      for (const key in this.form) {
        this.$v.form[key].$model = item[key]
      }
    },
    isImageLoaded(index) {
      return this.imageLoaded[this.perPage][index]
    },
    onImageLoad(index) {
      for (const perPage in this.pagesLoaded) {
        if (index < Number(perPage)) {
          this.$set(this.imageLoaded[Number(perPage)], index, true)
        }
      }
    },
    isPageLoaded() {
      return !!this.pagesLoaded[this.perPage][this.currentPage - 1]
    }
  },
}
</script>

<template>
  <b-table
    striped
    hover
    caption-top
    bordered
    :small="small"
    :items="items"
    :fields="cFields"
    :per-page="perPage"
    :current-page="currentPage"
    :busy="isTableBusy"
    responsive
    show-empty
    @row-dblclicked="onRowDbclicked"
  >
    <template #table-caption>
      <div class="text-right">Total de itens: {{ totalRows }}</div>
    </template>

    <!-- uil icons Header -->
    <template 
      v-for="(icon, index) in iconFields"
      v-slot:[`head(${icon.field})`]
    >
      <i 
        :key="index" 
        :class="`uil uil-${icon.icon}`"
      ></i>
    </template>

    <!-- Image Fields -->
    <template
      v-for="(image, index) in imageFields"
      v-slot:[`cell(${image})`]="data"
    >
      <transition-group name="fade" :key="index" class="img-placeholder-container">
        <div 
          key="placeholder"
          v-if="!isImageLoaded(data.index)"
          class="d-flex justify-content-center img-placeholder"
        >
          <feather 
            type="image" 
            size="50px"
            class="img-placeholder-icon"
          />
        </div>
        <b-img
          key="image"
          v-show="isImageLoaded(data.index)"
          :src="data.value"
          style="max-height: 100px"
          @load="onImageLoad(data.index)"
        />
      </transition-group>
    </template>

    <!-- Link Fields -->
    <template
      v-for="(field, index) in linkFields"
      v-slot:[`cell(${field})`]="data"
    >
      <a :key="index" :href="fixLink(data.value)" target="_blank">{{ data.value }}</a>
    </template>

    <!-- Check (true|false) Field -->
    <template
      v-for="(active, index) in activeFields"
      v-slot:[`cell(${active})`]="data"
    >
      <feather :key="index" :type="data.value ? 'check' : 'x'"></feather>
    </template>

    <!-- Editable Fields -->
    <template 
     v-for="(edit, index) in editableFields"
     v-slot:[`cell(${edit.key})`]="data"
    >
      <!-- Default Display -->
      <span 
        v-show="!showEditableVersion(data.index)"
        v-if="isDefaultField(edit)"
        :key="`og-${index}`"
      >{{ data.value }}</span>

      <!-- String -->
      <b-form-input
        v-show="showEditableVersion(data.index)"
        v-if="edit.type === 'string' && !edit.mask"
        class="editable-input"
        :key="index"
        :placeholder="edit.placeholder"
        :value="data.value"
        :state="$common.getState($v.form[edit.key] || null)"
        :title="edit.title"
        @input="value => onEditableInput(value, data, edit.callback)"
      />
      <span
        v-show="!showEditableVersion(data.index)"
        v-if="edit.type === 'string' && isLinkField(edit.key)"
        :key="`og-${index}`"
      >
        <a :href="fixLink(data.value)" target="_blank">{{ data.value }}</a>
      </span>

      <!-- Money Mask-->
      <v-money
        v-show="showEditableVersion(data.index)"
        v-if="edit.type === 'string' && edit.mask === 'money'"
        class="editable-input"
        :key="index"
        :placeholder="edit.placeholder"
        :value="data.value"
        :state="$common.getState($v.form[edit.key] || null)"
        :title="edit.title"
        @input="value => onEditableInput(value, data, edit.callback)"
      />

      <!-- CNPJ Mask -->
      <b-form-input
        v-show="showEditableVersion(data.index)"
        v-if="edit.type === 'string' && edit.mask === 'cnpj'"
        v-facade="cnpjMask"
        class="editable-input"
        :key="index"
        :placeholder="edit.placeholder"
        :value="data.value"
        :state="$common.getState($v.form[edit.key] || null)"
        :title="edit.title"
        @input="value => onEditableInput(value, data, edit.callback)"
      />

      <!-- CPF Mask -->
      <b-form-input
        v-show="showEditableVersion(data.index)"
        v-if="edit.type === 'string' && edit.mask === 'cpf'"
        v-facade="cpfMask"
        class="editable-input"
        :key="index"
        :placeholder="edit.placeholder"
        :value="data.value"
        :state="$common.getState($v.form[edit.key] || null)"
        :title="edit.title"
        @input="value => onEditableInput(value, data, edit.callback)"
      />

      <!-- Telephone Mask-->
      <b-form-input
        v-show="showEditableVersion(data.index)"
        v-if="edit.type === 'string' && edit.mask === 'telephone'"
        v-facade="telephoneMask"
        class="editable-input"
        :key="index"
        :placeholder="edit.placeholder"
        :value="data.value"
        :state="$common.getState($v.form[edit.key] || null)"
        :title="edit.title"
        @input="value => onEditableInput(value, data, edit.callback)"
      />

      <!-- Tags "Mask" -->
      <b-form-tags
        v-show="showEditableVersion(data.index)"
        v-if="edit.type === 'string' && edit.mask === 'tags'"
        class="editable-input"
        :key="index"
        :placeholder="edit.placeholder"
        :value="data.value"
        :state="$common.getState($v.form[edit.key] || null)"
        :title="edit.title"
        remove-on-delete
        add-button-text="adicionar"
        @input="value => onEditableInput(value, data, edit.callback)"
      />
      <span 
        v-show="!showEditableVersion(data.index)"
        v-if="edit.mask === 'tags'"
        :key="`og-${index}`"
      >
        <p
          v-for="(value, index) in data.value"
          :key="index"
          class="m-0"
        >
          {{ value }}
        </p>
      </span>

      <!-- Boolean -->
      <b-form-checkbox 
        v-show="showEditableVersion(data.index)"
        v-if="edit.type === 'boolean'"
        :checked="data.value"
        :key="index" 
        :value="true"
        :unchecked-value="false"
       @change="value => onEditableInput(value, data, edit.callback)"
      />
      <feather 
        v-show="!showEditableVersion(data.index)"
        v-if="edit.type === 'boolean'"
        :key="`og-${index}`"
        :type="data.value ? 'check' : 'x'"
      />

      <!-- Number -->
      <b-form-input
        v-show="showEditableVersion(data.index)"
        v-if="edit.type === 'number'"
        class="editable-input"
        type="number"
        :step="edit.step || '1'"
        :key="index"
        :placeholder="edit.placeholder"
        :value="data.value"
        :state="$common.getState($v.form[edit.key] || null)"
        :title="edit.title"
        @input="value => onEditableInput(value, data, edit.callback)"
      />

      <!-- Select -->
      <v-select 
        v-show="showEditableVersion(data.index)"
        v-if="edit.type === 'select'"
        class="editable-input"
        :placeholder="edit.placeholder"
        :value="data.value"
        :state="$common.getState($v.form[edit.key] || null)"
        :key="index"
        :options="edit.options"
        append-to-body
        :multiple="edit.multi || false"
        :title="edit.title"
        @input="value => onEditableInput(value, data, edit.callback)"
      />
      <span 
        v-show="!showEditableVersion(data.index)"
        v-if="edit.type === 'select'"
        :key="`og-${index}`"
      >{{ edit.multi ? data.value.join(', ') : data.value }}</span>
    </template>

    <!-- Checkbox -->
    <template #row-details="data">
      <div 
        v-for="(edit, index) in editableFields"
        :key="index"
      >
       <b-form-group 
        v-show="showEditableVersion(data.index)"
        v-if="edit.type === 'checkbox' && edit.multi === true"
        :label="edit.label" 
        :key="index"
        label-cols="3"
        >
          <b-form-checkbox-group
            :checked="data.item[edit.key]"
            :options="edit.options"
            :title="edit.title"
            @change="value => onEditableCheckboxMulti(value, 
              {
                ...data, 
                field: {
                  key: edit.key
                }
              }, edit.callback)"
            class="h-100 d-flex align-items-center justify-content-start"
          ></b-form-checkbox-group>
        </b-form-group>
        <b-form-group 
          v-show="!showEditableVersion(data.index)"
          v-if="edit.type === 'checkbox' && edit.multi === true"
          :label="edit.label" 
          :key="`og-${index}`"
          label-cols="3"
        >
          <b-form-checkbox-group
            :checked="data.item[edit.key]"
            :options="edit.options"
            disabled
            class="h-100 d-flex align-items-center justify-content-start"
          ></b-form-checkbox-group>
        </b-form-group>
      </div>
    </template>
    <!-- End Editable Fields -->

    <!-- Options Field -->
    <template #cell(buttons)="row">
      <div class="table-buttons">
        <button 
          v-if="showUpdateButton"
          title="Atualizar"
          class="table-button"
          @click="onUpdateRow(row)"
        >
          <feather type="check"></feather>
        </button>
        <button 
          v-if="showEditButton"
          title="Editar"
          class="table-button" 
          @click="edit(row.item['primary-key'], row)"
        >
          <feather type="edit"></feather>
        </button>
        <button
          title="Remover"
          class="table-button"
          @click="remove(row.item['primary-key'], row.item)"
        >
          <feather type="trash-2"></feather>
        </button>
      </div>
    </template>

    <!-- Select Head & Field -->
    <template #head(select)>
      <b-form-checkbox
        :checked="isAllSelected"
        @change="checked => onSelectAll(checked)"
      />
    </template>
    <template #cell(select)="row">
      <b-form-checkbox
        :checked="bulkRemoveIds.includes(row.item['primary-key'])"
        @change="checked => onSelect(checked, row.item['primary-key'])"
      />
    </template>

    <template #empty>
      <div class="m-5 d-flex justify-content-center align-items-center">
        <p class="m-0 mr-2">Ainda não há nenhum registro...</p>
        <b-button v-if="showRegisterButton" class="btn-md" @click.prevent="onFirstRegister"
          >Criar primeiro</b-button
        >
      </div>
    </template>

    <!-- BulkRemove Button -->
    <template #custom-foot>
      <b-td v-if="bulkRemove" :colspan="cFields.length">
        <b-button
          variant="danger"
          size="sm"
          class="float-right"
          :disabled="!isMoreThanOneSelected"
          @click.prevent="onBulkRemove"
        >
          Remover Selecionados
        </b-button>
      </b-td>      
    </template>

    <template #table-busy>
      <div class="text-center my-2">
        <b-spinner class="align-middle mr-3"></b-spinner>
        <strong>Carregando...</strong>
      </div>
    </template>
  </b-table>
</template>

<style lang="scss">
.table-buttons {
  display: flex;
  justify-content: center;
}
.table-button {
  border: none;
  i {
    width: 1rem;
  }
}
.editable-input {
  max-width: fit-content;
  min-width: 150px;
  background-color: #fff;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.img-placeholder-container {
  position: relative;
  display: block;
  min-height: 60px;
  min-width: 60px;
  max-height: 100px;

  .img-placeholder {
    position: absolute;
    top: 5px;
    left: 5px;
  }
}
</style>