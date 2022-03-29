<script>
import Layout from '@layouts/default'
import appConfig from '@src/app.config'
import NProgress from 'nprogress/nprogress'

/**
 * Login component
 */
export default {
  page: {
    title: 'Log in',
    meta: [{ name: 'description', content: `Log in to ${appConfig.title}` }],
  },
  components: { Layout },
  data() {
    return {
      cpf: '',
      senha: '',
      authError: null,
      isAuthError: false,
      isLoading: false,
      cpfMask: '###.###.###-##',
    }
  },
  computed: {
    placeholders() {
      return process.env.NODE_ENV === 'production'
        ? {
            cpf: 'Digite o seu CPF',
            senha: 'Digite sua senha'
          }
        : {
            cpf: 'Digite "000.000.000-00" como CPF',
            senha: 'Digite "12345678" como senha',
          }
    },
  },
  methods: {
    tryToLogIn() {
      this.isLoading = true
      this.authError = null
      this.$services.auth.login({
        cpf: this.cpf,
        senha: this.senha,
      })
        .then((responseData) => {
          this.isAuthError = false
          this.$router.push(
            this.$route.query.redirectFrom || { name: 'profile' }
          )
          NProgress.done()
        })
        .catch((error) => {
          this.isAuthError = true
          this.authError = error.response 
            ? error.response.data.mensagem 
            : error.message
              ? error.message
              : 'Houve um erro, tente novamente.'
        })
        .finally(() => {
          this.isLoading = false
        })
    },
  },
}
</script>

<template>
  <Layout>
    <!-- end row -->
    <div class="account-pages my-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-xl-10">
            <div class="card">
              <div class="card-body p-0">
                <div class="row">
                  <div class="col-md-6 p-5">
                    <!-- <div class="mx-auto mb-5">
                      <a routerLink="/">
                        <img
                          src="@assets/images/logo.png"
                          alt
                          height="48"
                          style="margin-left: -10px;"
                        />
                        <h3 class="d-inline align-middle ml-1 text-logo"></h3>
                      </a>
                    </div> -->

                    <h6 class="h5 mb-0 mt-4">Bem vindo!</h6>
                    <p class="text-muted mt-1 mb-4">Entre com seu login e senha.</p>

                    <b-alert v-model="isAuthError" variant="danger" dismissible>{{ authError }}</b-alert>

                    <b-form class="authentication-form" @submit.prevent="tryToLogIn">
                      <div class="form-group">
                        <div class="input-group input-group-merge">
                          <div class="input-group-prepend">
                            <span class="input-group-text">
                              <feather type="user" class="align-middle icon-dual"></feather>
                            </span>
                          </div>
                          <b-form-input
                            id="input-1"
                            v-model="cpf"
                            v-facade="cpfMask"
                            type="text"
                            required
                            :placeholder="placeholders.cpf"
                            autocomplete="username"
                          ></b-form-input>
                        </div>
                      </div>
                      <div class="form-group mt-4">
                        <div class="input-group input-group-merge">
                          <div class="input-group-prepend">
                            <span class="input-group-text">
                              <feather type="lock" class="align-middle icon-dual"></feather>
                            </span>
                          </div>
                          <b-form-input
                            id="password"
                            v-model="senha"
                            type="password"
                            required
                            :placeholder="placeholders.senha"
                            autocomplete="current-password"
                          ></b-form-input>
                        </div>
                      </div>
                      <b-form-group id="button-group" class="mb-1">
                        <b-button type="submit" variant="primary" class="btn-block">
                          <b-spinner small v-if="isLoading"></b-spinner>
                          <span class="sr-only" v-if="isLoading">Entrando...</span>
                          <span v-if="!isLoading">Entrar</span>
                        </b-button>
                        <!-- <b-link variant="info" class="btn-block text-center mt-5" style="font-size: 16px;" href="/criar-conta">Criar conta</b-link> -->
                      </b-form-group>
                    </b-form>
                  </div>
                  <div class="col-lg-6 d-none d-md-inline-block">
                    <div class="auth-page-sidebar">
                      <div class="overlay"></div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- end card-body -->
            </div>
            <!-- end card -->

            <!-- end row -->
          </div>
          <!-- end col -->
        </div>
        <!-- end row -->
      </div>
      <!-- end container -->
    </div>
  </Layout>
</template>

<style lang="scss" module></style>
