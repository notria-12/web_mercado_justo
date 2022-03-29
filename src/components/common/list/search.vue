<script>
import { hasKeys } from '@utils/functions'

export default {
  props: {
    searchFields: {
      type: Array,
      required: true,
      validator: value => hasKeys(value, ['value', 'text'])
    },
    search: {
      type: Object,
      required: true,
      validator: value => hasKeys(value, ['term', 'field'])
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  mounted() {
    this.setup()
  },
  methods: {
    setup () {
      const search = this.searchFields[0].value
      this.$emit('search-update', search)
    },
    onSearch () {
      this.$emit('search')
    },
    onSearchErase () {
      this.$emit('search-erase')
    },
    onSearchTermUpdate (value) {
      this.$emit('search-term-update', value.replace(/\s{2,}/g, ' ').trim())
    },
    onSearchUpdate (value) {
      this.$emit('search-update', value)
    }
  }
}
</script>

<template>
  <b-input-group>
    <b-form-input
      :value="search.term"
      placeholder="Pesquise aqui"
      title='Use aspas para uma pesquisa mais precisa. Ex.: "termo"'
      type="search"
      @input="onSearchTermUpdate"
      @keypress.enter="onSearch"
    ></b-form-input>
    <b-input-group-append>
      <b-form-select
        class="rounded-0"
        :value="search.field"
        :options="searchFields"
        @change="onSearchUpdate"
      />
      <b-button
        variant="primary"
        class="d-flex justify-content-center align-items-center"
        @click.prevent="onSearchErase"
        :disabled="disabled"
      >
        <feather
          type="refresh-ccw"
          size="1.3em"
          style="overflow: initial"
        />
      </b-button>
      <b-button
        variant="primary"
        class="d-flex justify-content-center align-items-center"
        @click.prevent="onSearch"
        :disabled="disabled"
      >
        <feather
          type="search"
          size="1.3em"
          style="overflow: initial"
        />
      </b-button>
    </b-input-group-append>
  </b-input-group>
</template>

<style>
</style>
