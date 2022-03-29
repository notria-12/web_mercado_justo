<script>
import appConfig from '@src/app.config'

export default {
  page: {
    titleTemplate(title) {
      title = typeof title === 'function' ? title(this.$store) : title
      return title ? `${title} | ${appConfig.title}` : appConfig.title
    },
  },
}
</script>

<template>
  <div id="app">
    <RouterView :key="$route.fullPath" />
  </div>
</template>
<style lang="scss">
@import '@design';
</style>
