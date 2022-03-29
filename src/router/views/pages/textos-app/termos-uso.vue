<script>
import Layout from '@layouts/main.vue'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import SessionExpired from '@mixins/session-expired.js'
import ckeditor from '@components/common/ckeditor.vue'

export default {
  setup () {
    return { $v: useVuelidate() }
  },
  components: { Layout, Loading, ckeditor },
  mixins: [SessionExpired],
  data () {
    return {
      isLoading: false,
      form: {
        texto: ''
      }
    }
  },
  validations() {
    return {
      form: {
        texto: { required },
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.isLoading = true
      this.$services.termsUse.getOne()
        .then((termsUse) => {
          this.form.texto = termsUse
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
          this.isLoading = false
          this.$nextTick(() => {
            this.$v.$reset()
          })
        })
    },
    onSubmit() {
      this.isLoading = true
      this.$v.$touch()
      if (this.$v.$invalid) {
        this.$bvToast.toast('O formulário está inválido.', {
          variant: 'danger',
        })
        this.isLoading = false
        return
      }

      this.$services.termsUse.update(this.form)
        .then((response) => {
          const message = response.data.mensagem
          this.$bvToast.toast(message, {
            variant: 'success',
          })
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
         this.isLoading = false
        })
    }
  }
}
</script>

<template>
  <Layout>
    <div class="bloco">
      <div class="cabecalho">
        <div class="row">
          <div class="col-xl-12">
            <button
              class="btn btn-mercado-justo botaoTopo"
              @click="onSubmit"
            >
              Atualizar
            </button>
            <div class="titulo">Termos de Uso</div>
            <div class="subTitulo">Atualize aqui os termos de uso da plataforma</div>
            <div class="borda"></div>

            <b-form @submit.prevent="onSubmit">
              <div class="row">
                <b-form-group label="Texto Integral" label-for="texto" class="col-12">
                  <ckeditor
                    id="texto"
                    v-model="$v.form.texto.$model"
                    :state="$common.getState($v.form.texto)"
                    placeholder="Termos de Uso"
                    min-height="300px"
                  />
                </b-form-group>
              </div>
            </b-form>
          </div>
        </div>
      </div>
    </div>
    <Loading
      :active.sync="isLoading"
      color="#111d5e"
      :can-cancel="false"
    ></Loading>
  </Layout>
</template>

<style lang="scss">
.bloco {
  margin-top: 30px;
  background-color: #fff;
  padding: 40px;
  border-radius: 10px;
  .titulo {
    font-size: 25px;
    color: #111d5e;
    margin-bottom: 10px;
    font-weight: bold;
  }
  .subtitulo {
    margin-bottom: 10px;
  }
  .borda {
    margin-top: 15px;
    margin-bottom: 15px;
    border-bottom: solid 1px #edeff4;
    width: 150%;
    margin-left: -50%;
    margin-right: -50%;
  }
  .formulario {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .btn-mercado-justo {
    margin-top: 30px;
    margin-bottom: 10px;
    background-color: #111d5e;
    padding: 5px 30px;
    &.botaoTopo {
      float: right;
    }
  }
}
</style>