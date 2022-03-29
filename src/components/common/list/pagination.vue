<script>
import { hasKeys } from '@utils/functions'

export default {
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalRows: {
      type: [Number, String],
      required: true
    },
    perPage: {
      type: Number,
      required: true
    },
    order: {
      type: Object,
      required: true,
      validator: value => hasKeys(value, ['field', 'direction'])
    },
    searchFields: {
      type: Array,
      required: true,
      validator: value => hasKeys(value, ['key', 'label'])
    },
    perPageOptions: {
      type: Array,
      required: false,
      validator: value => hasKeys(value, ['value', 'text']),
      default: () => [
        { value: 5, text: '5' },
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 30, text: '30' },
      ]
    }
  },
  computed: {
    cOrderFields: function () {
      return [
        ...this.searchFields,
        {
          value: '_id',
          text: 'Padrão',
        },
      ]
    }
  },
  methods: {
    onCurrentPageUpdate (value) {
      this.$emit('current-page-update', value)
    },
    onOrderFieldUpdate (value) {
      this.$emit('order-field-update', value)
    },
    onOrderDirectionUpdate (value) {
      this.$emit('order-direction-update', value)
    },
    onPerPageUpdate (value) {
      this.$emit('per-page-update', value)
    }
  }
}
</script>

<template>
  <div class="d-flex flex-row justify-content-between">
    <b-pagination
      :value="currentPage"
      :total-rows="totalRows"
      :per-page="perPage"
      aria-controls="my-table"
      @change="onCurrentPageUpdate"
    ></b-pagination>
    <div class="w-25">
      <div class="row">
        <div class="col-8 p-0">
          <label for="orderSelect">Ordernar por</label>
          <b-form-select
            id="orderSelect"
            :value="order.field"
            :options="cOrderFields"
            size="sm"
            @change="onOrderFieldUpdate"
          >
          </b-form-select>
        </div>
        <div class="col-4 p-0">
          <label for="directionSelect">Direção</label>
          <b-form-select
            id="directionSelect"
            :value="order.direction"
            size="sm"
            @change="onOrderDirectionUpdate"
          >
            <b-form-select-option value="1">Asc</b-form-select-option>
            <b-form-select-option value="-1">Desc</b-form-select-option>
          </b-form-select>
        </div>
      </div>
    </div>
    <div class="w-25">
      <label for="select">Linhas por página</label>
      <b-form-select
        id="select"
        :value="perPage"
        :options="perPageOptions"
        size="sm"
        @change="onPerPageUpdate"
      >
      </b-form-select>
    </div>
  </div>
</template>

<style>
.pagination {
  margin-top: 1rem;
}
</style>