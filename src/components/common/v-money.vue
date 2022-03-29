<script>
import {Money} from 'v-money'

export default {
  components: {Money},
  props: {
    value: {
      required: false,
      default: null
    },
    money: {
      type: Object,
      required: false,
      default: () => ({
        precision: 2,
        decimal: ',',
        thousands: '.',
        prefix: 'R$ ',
        masked: true
      })
    },
    state: {
      type: Boolean,
      required: false,
      default: null
    }
  },
  data() {
    return {
      lastEvent: 0,
    }
  },
  watch: {
    state (newState) {
      if (newState == null) {
        this.$refs.money.$el.classList.remove('is-invalid', 'is-valid')
      } else if (newState) {
        this.$refs.money.$el.classList.remove('is-invalid')
        this.$refs.money.$el.classList.add('is-valid')
      } else {
        this.$refs.money.$el.classList.remove('is-valid')
        this.$refs.money.$el.classList.add('is-invalid')
      }
    }
  },
  methods: {
    handleInput (event) {
      if(event != this.lastEvent) {
        this.lastEvent = event
        this.$emit('input', event)
      }
    },
  }
}
</script>

<template>
  <money
    ref="money"
    :value="value"
    v-bind="money"
    @input="handleInput"
    class="form-control"
  />
</template>

<style>

</style>