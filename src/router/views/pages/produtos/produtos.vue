<script>
import Resource from '@components/common/resource.vue'
import List from './list'

export default {
  components: { Resource },
  data() {
    return {
      listComponent: List,
    }
  },
  computed: {
    component() {
      return {
        onChange: this.onComponentChange,
        text: 'Adicionar Produto'
      }
    }
  },
  methods: {
    onComponentChange(frag, vueInstance) {
      this.$bvModal
        .msgBoxConfirm('Deseja importar uma planilha com os cadastros ou criar um novo registro?', {
          title: 'Adicionar Produto',
          okVariant: 'primary',
          okTitle: 'Novo Registro',
          cancelVariant: 'secondary',
          cancelTitle: 'Importar Planilha',
        })
        .then((response) => {
          if (response) {
            vueInstance.$refs.componentRef.appendEmptyItem()
          } else if(typeof response == 'boolean' && !response) {
            vueInstance.$refs.componentRef.onImport()
          }
        })
    }
  }
}
</script>

<template>
  <resource
    :List="listComponent"
    :component="component"
    title="Produtos"
    subTitle="Cadastre aqui os produtos"
  >
  </resource>
</template>