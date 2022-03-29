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
        text: 'Adicionar Gerente'
      }
    }
  },
  methods: {
    onComponentChange(frag, vueInstance) {
      this.$bvModal
        .msgBoxConfirm('Deseja importar uma planilha com os cadastros ou criar um novo registro?', {
          title: 'Adicionar Gerente',
          okVariant: 'primary',
          okTitle: 'Novo Registro',
          cancelVariant: 'secondary',
          cancelTitle: 'Importar Planilha',
        })
        .then((response) => {
          if (response) {
            vueInstance.$refs.componentRef.appendEmptyItem(true)
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
    title="Gerentes"
    subTitle="Cadastre aqui os gerentes"
    :component="component"
  >
  </resource>
</template>