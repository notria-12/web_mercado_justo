<script>
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
import 'vue2-datepicker/locale/pt-br'
const targetClass = '.mx-input'

export default {
  components: { DatePicker },
  props: {
    value: {
      type: [Date, Array, String],
      required: false,
      default: null
    },
    id: {
      type: String,
      required: true
    },
    format: {
      type: String,
      required: false,
      default: 'DD/MM/YYYY'
    },
    placeholder: {
      type: String,
      required: false,
      default: 'dd/mm/aaaa'
    },
    state: {
      type: Boolean,
      required: false,
      default: null
    },
    range: Boolean
  },
  watch: {
    state (newState) {
      if (newState == null) {
        this.$refs.dateSelect.$el.querySelector(targetClass).classList.remove('is-invalid', 'is-valid')
      } else if (newState) {
        this.$refs.dateSelect.$el.querySelector(targetClass).classList.remove('is-invalid')
        this.$refs.dateSelect.$el.querySelector(targetClass).classList.add('is-valid')
      } else {
        this.$refs.dateSelect.$el.querySelector(targetClass).classList.remove('is-valid')
        this.$refs.dateSelect.$el.querySelector(targetClass).classList.add('is-invalid')
      }
    }
  },
  computed: {
    cValue() {
      if (typeof this.value == 'string') {
        if (this.value.includes('T00')) {
          return new Date(this.value.replace('T00', 'T03'))
        } else {
          return new Date(this.value)
        }
      } else {
        return this.value
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
    loadCss () {
      this.$refs.dateSelect.$el.querySelector(targetClass).classList.add('form-control')
    }
  }
}
</script>

<template>
  <date-picker
    id="data"
    ref="dateSelect"
    :range="range"
    :value="cValue"
    :format="format"
    :placeholder="placeholder"
    @input="handleInput"
  />
</template>

<style>
.mx-input {
  padding-right: 0 !important;
  background-position: right calc(1.775em + 0.1875rem) center !important;
  height: calc(1.5em + 1rem + 2px);
}
.mx-datepicker {
  width: 100%;
}
</style>
