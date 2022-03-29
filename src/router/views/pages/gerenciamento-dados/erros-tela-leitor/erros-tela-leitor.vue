<script>
import Resource from '@components/common/resource.vue'
import List from './list'

export default {
  components: { Resource },
  data() {
    return {
      listComponent: List
    }
  },
}
</script>

<template>
  <resource
    :List="listComponent"
    title="Erros na Tela do Leitor"
    subTitle="Verifique aqui os erros na tela do leitor"
  >
  </resource>
</template>