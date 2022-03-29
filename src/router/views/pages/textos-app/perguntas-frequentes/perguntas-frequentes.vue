<script>
import Layout from '@layouts/main.vue'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import SessionExpired from '@mixins/session-expired.js'
import questionAnswer from './pergunta-resposta.vue'
import useVuelidate from '@vuelidate/core'

export default {
  setup() {
    return { $v: useVuelidate() }
  },
  components: { Layout, Loading, questionAnswer },
  mixins: [SessionExpired],
  data () {
    return {
      isLoading: false,
      faq: [
        {
          _id: null,
          pergunta: '',
          resposta: ''
        }
      ],
      removeOnSubmit: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.isLoading = true
      this.$services.faq.getAll({})
        .then(([faq]) => {
          if(faq.length > 0) {
            this.faq = faq
          }
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
          this.isLoading = false
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

      let faqPromises = []
      for (const qa of this.faq) {
        if(qa._id) {
          faqPromises.push(this.$services.faq.update(qa._id, qa))
        } else {
          faqPromises.push(this.$services.faq.create(qa))
        }
      }
      if(this.removeOnSubmit.length > 0) {
        this.completeRemove()
      }
      Promise.all(faqPromises)
        .then((faqResponses) => {
          for (const [index, faqResponse] of faqResponses.entries()) {
            if(!this.faq[index]._id) {
              this.faq[index]._id = faqResponse.data.dados._id
            }
          }

          const message = 'Perguntas frequentes atualizadas.'
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
    },
    faqInputHandler({ index, key, value }) {
      this.faq[index][key] = value
    },
    onAdd() {
      this.faq.push({
        _id: null,
        pergunta: '',
        resposta: ''
      })
    },
    onRemove(index) {
      this.removeOnSubmit.push(this.faq[index]._id)
      this.faq.splice(index, 1)
    },
    completeRemove() {
      let faqPromises = []
      for(const id of this.removeOnSubmit) {
        faqPromises.push(this.$services.faq.remove(id))
      }
      Promise.all(faqPromises)
        .then(() => {
          this.removeOnSubmit = []
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
            <div class="titulo">Perguntas Frequentes</div>
            <div class="subTitulo">Cadastre aqui as perguntas frequentes da plataforma</div>
            <div class="borda"></div>

            <b-form>
              <question-answer 
                v-for="(qa, index) in faq"
                :key="index"
                :index="index"
                :faq="qa"
                :is-first="index === 0"
                :is-last="index == faq.length - 1"
                @input="faqInputHandler"
                @add="onAdd"
                @remove="onRemove"
              />
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