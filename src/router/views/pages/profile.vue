<script>
import Layout from '@layouts/main.vue'
import vSelect from '@components/common/vue-select.vue'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import useVuelidate from '@vuelidate/core'
import { required, minLength, email, sameAs, requiredIf } from '@vuelidate/validators'
import SessionExpired from '@mixins/session-expired.js'

export default {
  setup () {
    return { $v: useVuelidate() }
  },
  components: { Layout, vSelect, Loading },
  mixins: [SessionExpired],
  computed: {
    user () {
      return this.$store.getters['auth/user']
    },
    isNotManager () {
      return this.user && this.user.tipo_conta !== 'gerente'
    }
  },
  data () {
    return {
      isLoading: false,
      cpfMask: '###.###.###-##',
      telephoneMask: ['(##) ####-####', '(##) #####-####'],
      ufs: [],
      cities: [],
      showPassword: false,
      form: {
        _id: '',
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        endereco: {
          cidade: null,
          uf: null
        },
        senha: '',
        senha_confirmacao: ''
      }
    }
  },
  validations() {
    return {
      form: {
        nome: { required },
        cpf: {
          required,
          isValid: (value) => {
            return this.$validations.cpf(value)
          }
        },
        email: { required, email },
        telefone: {
          required: requiredIf(() => {
            return this.user.tipo_conta !== 'gerente'
          }),
          minLength: minLength(14),
        },
        endereco: {
          cidade: { 
            required: requiredIf(() => {
              return this.user.tipo_conta === 'operador'
            })
          },
          uf: { 
            required: requiredIf(() => {
              return this.user.tipo_conta === 'operador'
            })
          }
        },
        senha: {
          minLength: minLength(8)
        },
        senha_confirmacao: {
          sameAs: sameAs(this.form.senha),
        },
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.isLoading = true
      const userPromise = this.$services.users.getMe()
      const statesPromise = this.$services.stateCity.getStates()

      Promise.all([userPromise, statesPromise])
        .then(([user, states]) => {
          for (const key in this.form) {
            if (key === 'endereco') {
              for (const subKey in this.form[key]) {
                if(user[key] && user[key][subKey]) {
                  this.$set(this.form[key], subKey, user[key][subKey])
                  if (subKey === 'uf') {
                    this.onStateSelect(this.form.endereco.uf)
                  }
                }
              }
            } else {
              this.$set(this.form, key, user[key])
            }
          }
          this.ufs = states.map(state => ({
            value: state.text.split('-')[0].trim(),
            text: state.text.split('-')[0].trim()
          }))
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
    onStateSelect(value) {
      if (value === null) {
        return
      }
      this.$services.stateCity.getCitiesByState(value)
        .then((cities) => {
          this.cities = cities
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
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

      this.$services.users.update(this.form._id, this.form)
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
            <div class="titulo">Perfil</div>
            <div class="subTitulo">Atualize os seus dados aqui</div>
            <div class="borda"></div>

            <b-form @submit.prevent="onSubmit">
              <div class="row">
                <b-form-group label="Nome" label-for="nome" class="col-3">
                  <b-form-input
                    id="nome"
                    v-model="$v.form.nome.$model"
                    :state="$common.getState($v.form.nome)"
                  />
                </b-form-group>
                <b-form-group label="E-mail" label-for="email" class="col-3">
                  <b-form-input
                    id="email"
                    v-model="$v.form.email.$model"
                    :state="$common.getState($v.form.email)"
                  />
                </b-form-group>
              </div>
              <div class="row">
                <b-form-group label="Usuário/CPF" label-for="cpf" class="col-3">
                  <b-form-input
                    id="cpf"
                    v-facade="cpfMask"
                    v-model="$v.form.cpf.$model"
                    :state="$common.getState($v.form.cpf)"
                  />
                </b-form-group>
                <b-form-group 
                  v-if="isNotManager" 
                  label="Telefone" 
                  label-for="telefone" 
                  class="col-3"
                >
                  <b-form-input
                    id="telefone"
                    v-facade="telephoneMask"
                    v-model="$v.form.telefone.$model"
                    :state="$common.getState($v.form.telefone)"
                  />
                </b-form-group>
              </div>
              <div class="row" v-if="isNotManager">
                <b-form-group label="UF" label-for="uf" class="col-3">
                  <v-select 
                    v-model="$v.form.endereco.uf.$model"
                    :options="ufs"
                    :state="$common.getState($v.form.endereco.uf)"
                    placeholder="Selecione a UF"
                    append-to-body
                    @input="onStateSelect"
                  />
                </b-form-group>
                <b-form-group label="Cidade" label-for="cidade" class="col-3">
                  <v-select 
                    v-model="$v.form.endereco.cidade.$model"
                    :options="cities"
                    :state="$common.getState($v.form.endereco.cidade)"
                    placeholder="Selecione a cidade"
                    append-to-body
                  />
                </b-form-group>
              </div>
              <div class="row">
                <b-form-group label="Senha" label-for="senha" class="col-3">
                  <b-form-input
                    id="senha"
                    :type="!showPassword ? 'password' : 'text'"
                    v-model="$v.form.senha.$model"
                    placeholder="Senha"
                    trim
                    :state="$common.getState($v.form.senha)"
                    autocomplete="new-password"
                  ></b-form-input>
                </b-form-group>
                <b-form-group label="Confirme a senha" label-for="senha_confirmacao" class="col-3">
                  <b-form-input
                    id="senha_confirmacao"
                    :type="!showPassword ? 'password' : 'text'"
                    v-model="$v.form.senha_confirmacao.$model"
                    placeholder="Confirme a senha"
                    :state="$common.getState($v.form.senha_confirmacao, $v.form.senha.$error)"
                    autocomplete="new-password"
                  ></b-form-input>
                </b-form-group>
              </div>
              <div class="row">
                <b-form-group
                  label="Mostrar senha"
                  class="col"  
                >
                  <b-form-checkbox 
                    v-model="showPassword"
                    :value="true"
                    :unchecked-value="false"
                    switch
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