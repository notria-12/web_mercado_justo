export default {
  install: (Vue, options) => {
    const commonPlugin = {
      serviceCatch: (vueInstance, error) => {
        if (error.response) {
          if (Array.isArray(error.response.data.dados)) {
            const messages = error.response.data.dados
            const h = vueInstance.$createElement
            const vNodesMsg = h(
              'ul', 
              messages.map(message => h('li', [message]))
            )
            vueInstance.$bvToast.toast([vNodesMsg], {
              title: 'Aviso',
              variant: 'danger'
            })
          } else {
            const message = error.response.data.mensagem
            vueInstance.$emit('toast', {
              variant: 'danger',
              message,
            })
          } 
        } else {
          vueInstance.$emit('toast', {
            variant: 'danger',
            message: 'Algo inesperado aconteceu. Tente novamente.',
          })
          console.log(error)
        }
      },
      getState(vuelidateProp, secundaryState = false) {
        if(!vuelidateProp) {
          return null
        }
        return vuelidateProp.$error || secundaryState
          ? false
          : vuelidateProp.$dirty
            ? true
            : null
      },
      removeItem (id, vueInstance) {
        if(id) {
          vueInstance.$emit('total-rows-update', vueInstance.totalRows - 1)
        }
        for (let i = 0; i < vueInstance.items.length; i++) { 
          if (vueInstance.items[i] && vueInstance.items[i]['primary-key'] == id) {
           vueInstance.items.splice(i, 1)
          }
        }
      },
    }
    Vue.prototype.$common = commonPlugin
    Vue.$common = commonPlugin
  }
}