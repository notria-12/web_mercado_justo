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
    title="Produtos Sem Cadastro"
    subTitle="Verifique aqui os produtos sem cadastro"
  >
  </resource>
</template>