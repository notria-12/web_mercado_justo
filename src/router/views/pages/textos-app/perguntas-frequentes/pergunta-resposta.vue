<script>
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import ckeditor from '@components/common/ckeditor.vue'

export default {
  setup () {
    return { $v: useVuelidate() }
  },
  components: { ckeditor },
  props: {
    index: {
      type: Number,
      required: true
    },
    faq: {
      type: Object,
      required: true,
    },
    isFirst: {
      type: Boolean,
      required: true
    },
    isLast: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    showRemoveButton() {
      return !this.isFirst
    },
    showAddButton() {
      return this.isLast
    }
  },
  validations() {
    return {
      faq: {
        pergunta: { required },
        resposta: { required }
      }
    }
  },
  methods: {
    handleInput(value, key) {
      this.$emit('input', {
        index: this.index,
        key,
        value
      })
      if(!this.$v.faq[key].$dirty) {
        this.$v.faq[key].$touch()
      }
    },
    onRemove() {
      this.$emit('remove', this.index)
    },
    onAdd() {
      this.$emit('add')
    }
  }
}
</script>

<template>
  <div>
    <hr v-if="!isFirst">
    <div class="row">
      <b-form-group label="Pergunta" label-for="pergunta" class="col-6">
        <b-form-input 
          id="pergunta"
          placeholder="Pergunta"
          :value="$v.faq.pergunta.$model"
          @input="value => handleInput(value, 'pergunta')"
          :state="$common.getState($v.faq.pergunta)"
        />
      </b-form-group>
      <div class="col-1 form-group d-flex flex-column justify-content-end">
        <div class="d-flex justify-cotent-center">
        <feather 
          v-if="showRemoveButton"
          title="Remover pergunta e resposta"
          type="x" 
          class="mb-2 mr-2 btn-remove" 
          @click="onRemove"
        ></feather>
        <feather 
          v-if="showAddButton"
          title="Adicionar pergunta e resposta"
          type="plus" 
          class="mb-2 btn-add" 
          @click="onAdd"
        ></feather>
        </div>
      </div>
    </div>
    <div class="row">
      <b-form-group label="Resposta" label-for="resposta" class="col-6">
        <ckeditor
          id="resposta"
          placeholder="Resposta"
          :value="$v.faq.resposta.$model"
          @input="value => handleInput(value, 'resposta')"
          :state="$common.getState($v.faq.texto)"
        />
      </b-form-group>
    </div>
  </div>
</template>

<style>
.btn-remove {
  cursor: pointer;
}
.btn-remove:hover {
  color: red;
}
.btn-add {
  cursor: pointer;
}
</style>