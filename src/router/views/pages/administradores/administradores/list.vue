<script>
import List from '@/src/components/common/list'
import useVuelidate from '@vuelidate/core'
import { required, minLength, email, sameAs } from '@vuelidate/validators'

export default {
  setup () {
    return { $v: useVuelidate() }
  },
  components: { List },
  data() {
    return {
      fields: [
        { key: 'nome', label: 'Nome', sortable: true},
        { key: 'cpf', label: 'usuário/CPF' },
        { key: 'email', label: 'E-mail' },
        { key: 'mercado', label: 'Mercado', sortable: true, include: false },
        { key: 'id', label: 'ID', default: [] },
        { key: 'telefone', label: 'Telefone' },
        { key: 'cidade', label: 'Cidade', sortable: true },
        { key: 'uf', label: 'UF' },
        { key: 'ultima_atualização', label: 'Atualização', sortable: true, include: false },
      ],
      searchFields: [
        { value: 'nome', text: 'Nome' },
        { value: 'cpf', text: 'CPF' },
      ],
      preSetSearch: [
        { field: 'tipo_conta', term: ['operador'], strict: true, multi: true }
      ],
      supermarkets: [],
      supermarketsIds: [],
      ufs: [],
      cities: [],
      permissions: [
        { value: 'imagens', text: 'Imagens' },
        { value: 'precos', text: 'Preços' },
        { value: 'usuarios', text: 'Usuários' },
        { value: 'produtos', text: 'Produtos' },
        { value: 'mercados', text: 'Mercados' },
        { value: 'edicao_textos_app', text: 'Edição de Textos do App' },
        { value: 'gerenciamento_dados', text: 'Gerencimento de Dados' }
      ],
      form: {
        senha: '',
        senha_confirmacao: '',
      },
      showPassword: false,
      tmp: {
        item: {},
        isTableBusy: () => null,
        vueInstance: null
      }
    }
  },
  computed: {
    editableFields () {
      return [
        { key: 'nome', type: 'string', placeholder: 'Nome' },
        { key: 'cpf', type: 'string', mask: 'cpf', placeholder: 'CPF' },
        { key: 'email', type: 'string', placeholder: 'E-mail' },
        { 
          key: 'mercado', 
          type: 'select',
          options: this.supermarkets, 
          callback: this.onSupemarketSelect,
          placeholder: 'Selecione o mercado',
        },
        { 
          key: 'id', 
          type: 'select', 
          options: this.supermarketsIds, 
          placeholder: 'Selecione o ID',
          multi: true
        },
        { 
          key: 'telefone', 
          type: 'string', 
          mask: 'telephone',
          placeholder: 'Telefone'
          },
        { 
          key: 'cidade', 
          type: 'select', 
          options: this.cities,
          placeholder: 'Selecione a cidade' ,
        },
        { 
          key: 'uf', 
          type: 'select', 
          options: this.ufs, 
          callback: this.onStateSelect, 
          placeholder: 'Selecione o estado',
        },
        {
          key: 'permissoes',
          type: 'checkbox',
          multi: true,
          options: this.permissions,
          label: 'Selecione os níveis de acesso do usuário'
        }
      ]
    },
    importConfig() {
      return {
        title: 'Administradores',
        requiredFields: [
          'Nome', 'Usuário/CPF', 'Senha', 'E-mail', 'Telefone', 'Cidade', 'UF',
        ],
        optionalFields: [
          'Mercado', 'ID', 
          '*Permissões', 
          '*Valores válidos: Imagens, Preços, Usuários, Produtos, Mercados, Edição de Textos do App e Gerenciamento de Dados'
        ],
        hideButton: true,
        onSubmit: this.onImportSubmit
      }
    },
  },
  validations() {
    return {
      form: {
        senha: {
          required,
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
      this.$emit('loading', true)
      const supermarketsList = this.$services.supermarkets.getList({})
      const statesList = this.$services.stateCity.getStates()

      Promise.all([supermarketsList, statesList])
        .then(([supermarkets, states]) => {
          this.supermarkets = supermarkets
          this.ufs = states.map(state => ({
            value: state.text.split('-')[0].trim(),
            text: state.text.split('-')[0].trim()
          }))
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
          this.$emit('loading', false)
        })
    },
    onStateSelect(value, row, vueInstance) {
      if (row) {
        const index = row.index
        this.$set(vueInstance.items[index], 'cidade', null)
        vueInstance.$v.form.cidade.$model = null
      }
      if (!value) {
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
    onSupemarketSelect (value, row, vueInstance) {
      const index = row.index
      this.$set(vueInstance.items[index], 'id', [])
      vueInstance.$v.form.id.$model = null
      if(!value) {
        return
      }

      this.$services.supermarkets.getList({
        search: {
          field: 'nome',
          term: value,
          strict: true,
        },
      })
      .then((supermarketsIds) => {
          this.supermarketsIds = supermarketsIds
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
          this.$emit('loading', false)
        })
    },
    updateItems(data, vueInstance) {
      const id = data.id
      const updatedData = data.data
      let found = false
      for (const item of vueInstance.items) {
        if (item && item['primary-key'] == id) {
          found = true
          for (const key in item) {
            if (key == 'primary-key') {
              item[key] = updatedData['_id']
            } else {
              item[key] = updatedData[key]
            }
          }
        }
      }
      if (!found) {
        vueInstance.items.push({
          'primary-key': updatedData._id,
          ...updatedData,
        })
      }
    },
    removeTemplate() {
      return `Realmente deseja excluir o administrador?`
    },
    onUpdateRow (row, isTableBusy, vueInstance) {
      const index = row.index
      const item = row.item

      if (item['primary-key']) {
        isTableBusy(true)
        this.$services.users.update(item['primary-key'], {
          nome: item.nome,
          cpf: item.cpf,
          email: item.email,
          responsavel_mercados: item.id,
          telefone: item.telefone,
          endereco: {
            cidade: item.cidade || null,
            uf: item.uf || null
          },
          permissoes: item.permissoes
        })
          .then((response) => {
            this.$bvToast.toast(response.data.mensagem, {
              autoHideDelay: 5000,
              variant: 'success',
            })
            vueInstance.lastRowDbclickedIndex = null
            vueInstance.loadList()
          })
          .catch((error) => {
            this.$common.serviceCatch(this, error)
          })
          .finally(() => {
            isTableBusy(false)
          })
      } else {
        this.$bvModal.show('password');
        this.$set(this.tmp, 'item', item)
        this.$set(this.tmp, 'isTableBusy', isTableBusy)
        this.$set(this.tmp, 'vueInstance', vueInstance)
      }
    },
    onEditClick(row, vueInstance) {
      if(row.index === vueInstance.lastRowDbclickedIndex) {
        vueInstance.lastRowDbclickedIndex = null
        return
      }

      vueInstance.lastRowDbclickedIndex = row.index
      if (row.item.uf) {
        this.onStateSelect(row.item.uf)
      }
      if (row.item.mercado) {
        this.$services.supermarkets.getList({
          search: [
            {
              field: 'nome',
              term: row.item.mercado,
              strict: true
            }
          ]
        })
          .then((response) => {
            this.supermarketsIds = response
          })
          .catch((error) => {
            this.$common.serviceCatch(this, error)
          })
      }
    },
    appendEmptyItem(showDetails = false) {
      this.$refs.list.appendEmptyItem(showDetails)
    },
    onImport() {
      this.$refs.list.onImport()
    },
    onImportSubmit(vueInstance) {
      if (vueInstance.file == null) {
        this.$bvToast.toast('Escolha um arquivo antes.', {
          autoHideDelay: 5000,
          variant: 'danger',
        })
        return
      }

      vueInstance.resetResponse()
      vueInstance.isSendingFile = true
       this.$services.users.import(vueInstance.file, vueInstance.onUploadProgress, 'operador')
        .then((response) => {
          const message = response.data.mensagem
          this.$bvToast.toast(message, {
            variant: 'success',
            autoHideDelay: 5000,
          })
          for(const state in response.data.dados.erros) {
            vueInstance.response.errors[state] = {
              isOpen: false,
              ...response.data.dados.erros[state]
            }
          }
          for(const state in response.data.dados.sucessos) {
            vueInstance.response.successes[state] = response.data.dados.sucessos[state]
          }
          this.$root.$emit('refreshlist')
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
          vueInstance.isSendingFile = false
          vueInstance.progressValue = 0
        })
    },
    onPasswordSubmit() {
      this.$v.form.$touch()
      if (this.$v.form.$invalid) {
        this.$bvToast.toast('A senha é necessária para criar o novo registro.', {
          variant: 'danger',
          title: 'Aviso'
        })
        return
      }

      const isTableBusy = this.tmp.isTableBusy
      const item = this.tmp.item
      isTableBusy(true)
      this.$services.users.create({
        nome: item.nome,
        cpf: item.cpf,
        email: item.email,
        responsavel_mercados: item.id,
        telefone: item.telefone,
        endereco: {
          cidade: item.cidade || null,
          uf: item.uf || null
        },
        permissoes: item.permissoes,
        tipo_conta: 'operador',
        senha: this.form.senha,
      })
      .then(() => {
        this.tmp.vueInstance.lastRowDbclickedIndex = null
        this.tmp.vueInstance.loadList()
      })
      .catch((error) => {
        this.$common.serviceCatch(this, error)
      })
      .finally(() => {
        isTableBusy(false)
        this.resetPasswordModal()
      })
    },
    onPasswordOk() {
      this.onPasswordSubmit()
    },
    resetPasswordModal() {
      this.form.senha = ''
      this.form.senha_confirmacao = ''
      this.$v.$reset()
      this.$set(this.tmp, 'item', {})
      this.$set(this.tmp, 'isTableBusy', () => null)
      this.$set(this.tmp, 'vueInstance', null)
    },
    validationFactory(vueInstance) {
      return {
        form: {
          nome: { required },
          cpf: {
            required,
            isValid: (value) => {
              return vueInstance.$validations.cpf(value)
            }
          },
          email: { required, email },
          id: {
            minLength: minLength(1),
          },
          telefone: {
            required,
            minLength: minLength(14),
          },
          cidade: { required },
          uf: { required }
        }
      }
    }
  },
}
</script>

<template>
  <div>
    <list
      ref="list"
      service-name="users"
      :fields="fields"
      :pre-set-search="preSetSearch"
      :update-items="updateItems"
      :remove-template="removeTemplate"
      :remove-item="$common.removeItem"
      :search-fields="searchFields"
      :on-edit-click="onEditClick"
      :validation-factory="validationFactory"
      :editable-fields="editableFields"
      :update-row="onUpdateRow"  
      :import-config="importConfig"
    >
    </list>
    <b-modal 
      id="password" 
      title="Crie uma senha"
      ok-title="Enviar"
      cancel-title="Cancelar" 
      @show="resetPasswordModal"
      @hidden="resetPasswordModal"
      @ok="onPasswordOk"
    >
      <form ref="form" @submit.stop.prevent="onPasswordSubmit">
        <div class="row">
        <b-form-group label="Senha" label-for="senha" class="col-6">
          <b-form-input
            id="senha"
            :type="!showPassword ? 'password' : 'text'"
            v-model="$v.form.senha.$model"
            placeholder="Senha"
            trim
            :state="
              $v.form.senha.$error
                ? false
                : $v.form.senha.$dirty
                ? true
                : null
            "
            autocomplete="new-password"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Confirme a senha" label-for="senha_confirmacao" class="col-6">
          <b-form-input
            id="senha_confirmacao"
            :type="!showPassword ? 'password' : 'text'"
            v-model="$v.form.senha_confirmacao.$model"
            placeholder="Confirme a senha"
            :state="
              $v.form.senha_confirmacao.$error || $v.form.senha.$error ? false : $v.form.senha_confirmacao.$dirty ? true : null
            "
            autocomplete="new-password"
          ></b-form-input>
        </b-form-group>
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
      </form>
    </b-modal>
  </div>
</template>