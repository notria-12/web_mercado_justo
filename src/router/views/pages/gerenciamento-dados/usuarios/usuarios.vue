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
}
</script>

<template>
  <resource
    :List="listComponent"
    title="Usuários"
    subTitle="Verifique aqui os usuários"
  >
  </resource>
</template>