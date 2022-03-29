<script>
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
const targetClass = '.vs__dropdown-toggle'

export default {
  components: { vSelect },
  props: {
    value: {
      required: false,
      default: null
    },
    label: {
      type: String,
      required: false,
      default: 'text'
    },
    options: {
      type: Array,
      required: true
    },
    placeholder: {
      type: String,
      required: true
    },
    reduce: {
      type: Function,
      required: false,
      default: data => data.value
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false
    },
    state: {
      type: Boolean,
      required: false,
      default: null
    },
    filterBy: {
      type: Function,
      required: false,
      default(option, label, search) {
        return (label || '').toLowerCase().indexOf(search.toLowerCase()) > -1
      }
    },
    selectable: {
      type: Function,
      required: false,
      default(option) {
        if(!this.multiple) {
          return this.value != option.value
        } else {
          return this.value 
            ? !this.value.includes(option.value)
            : true
        }
      }
    },
    appendToBody: {
      type: Boolean,
      required: false,
      default: null
    }
  },
  watch: {
    state (newState) {
      if (newState == null) {
        this.$refs.vSelect.$el.querySelector(targetClass).classList.remove('is-invalid', 'is-valid')
      } else if (newState) {
        this.$refs.vSelect.$el.querySelector(targetClass).classList.remove('is-invalid')
        this.$refs.vSelect.$el.querySelector(targetClass).classList.add('is-valid')
      } else {
        this.$refs.vSelect.$el.querySelector(targetClass).classList.remove('is-valid')
        this.$refs.vSelect.$el.querySelector(targetClass).classList.add('is-invalid')
      }
    }
  },
  mounted () {
    this.loadCss()
  },
  methods: {
    handleInput (event) {
      this.$emit('input', event)
    },
    handleSearch (search, loading) {
      this.$emit('search', search, loading)
    },
    loadCss () {
      this.$refs.vSelect.$el.querySelector(targetClass).classList.add('form-control')
    }
  }
}
</script>

<template>
  <v-select
    ref="vSelect"
    :label="label"
    :value="value"
    :options="options"
    :placeholder="placeholder"
    :reduce="reduce"
    :disabled="disabled"
    :multiple="multiple"
    :selectable="selectable"
    :filterBy="filterBy"
    :append-to-body="appendToBody"
    @input="handleInput"
    @search="handleSearch"
  >
    <span slot="no-options">Desculpe, nenhuma opção disponível.</span>
    <template v-for="(_, slot) of $scopedSlots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </v-select>
</template>

<style>
.vs__dropdown-toggle {
  padding-right: 0.2rem !important;
  background-position: right calc(1.575em + 0.1875rem) center !important;
  height: calc(1.5em + 1rem + 2px);
}
.vs__dropdown-toggle.is-valid {
  background-position: right calc(3em + 0.1875rem) center !important;
}
.vs__actions button,
.vs__actions svg {
  cursor: pointer;
}
.vs--disabled {
  background-color: #f8f8f8 !important;
}
/*  Temporary fix */
.v-select .vs__selected-options {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
