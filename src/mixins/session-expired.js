export default {
  mounted() {
    if (this.$store.getters['auth/isSessionExpired']) {
      const intervalId = setInterval(() => {
        if (!this.$children[0].isLoading) {
          clearInterval(intervalId)
          showModal(this)
        }
      }, 500)
    }
  },
}

function showModal(vueInstance) {
  const message = 'Por favor, faça o login novamente.'
  vueInstance.$bvModal.msgBoxOk(message, {
    title: 'Sessão Expirada',
    noCloseOnBackdrop: true,
    noCloseOnEsc: true,
    noEnforceFocus: true,
  }).then((ok) => {
    vueInstance.$store.dispatch('auth/logOut')
    vueInstance.$router.push({ name: 'login' })
  }).catch(error => console.log(error))
}