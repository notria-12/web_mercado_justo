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
        { key: 'telefone', label: 'Telefone', include: false },
        { key: 'cidade', label: 'Cidade', sortable: true, include: false },
        { key: 'uf', label: 'UF', include: false },
        { key: 'ultima_atualização', label: 'Atualização', sortable: true, include: false },
      ],
      searchFields: [
        { value: 'nome', text: 'Nome' },
        { value: 'cpf', text: 'CPF' },
      ],
      preSetSearch: [
        { field: 'tipo_conta', term: ['gerente'], strict: true, multi: true }
      ],
      supermarkets: [],
      supermarketsIds: [],
      form: {
        senha: '',
        senha_confirmacao: '',
      },
      showPassword: false,
      tmp: {
        item: {},
        isTableBusy: () => null,
        vueInstance: null,
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
        }
      ]
    },
    importConfig() {
      return {
        title: 'Gerentes',
        requiredFields: [
          'Nome', 'Usuário/CPF', 'Senha', 'E-mail', 'ID',
        ],
        optionalFields: ['Mercado', 'ID'],
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
      this.$services.supermarkets.getList({})
        .then((supermarkets) => {
          this.supermarkets = supermarkets
        
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
          this.$emit('loading', false)
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
      return `Realmente deseja excluir o gerente?`
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
       this.$services.users.import(vueInstance.file, vueInstance.onUploadProgress, 'gerente')
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
        permissoes: ['precos'],
        tipo_conta: 'gerente',
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
            required,
            minLength: minLength(1),
          }
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