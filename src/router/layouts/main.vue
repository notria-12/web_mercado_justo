<script>
import { layoutComputed } from '@state/helpers'
import Vertical from '@router/layouts/vertical'

export default {
  components: { Vertical },
  data() {
    return {}
  },
  computed: {
    ...layoutComputed,
  },
  methods: {},
}
</script>

<template>
  <div>
    <Vertical v-if="layoutType === 'vertical'" :layout="layoutType">
      <slot />
    </Vertical>
  </div>
</template>
