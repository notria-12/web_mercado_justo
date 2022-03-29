<script>
import { hasKeys } from '@utils/functions'

export default {
  props: {
    serviceName: {
      type: String,
      required: true,
    },
    importConfig: {
      type: Object,
      required: false,
      default: () => ({}),
      validator: value => hasKeys(value, ['title', 'requiredFields', 'optionalFields'])
    },
  },
  data() {
    return {
      file: null,
      progressValue: 0,
      isSendingFile: false,
      response: responseData(),
      responseSuccessOpen: false,
      responseErrorOpen: false,
      filesInputMode: 'files'
    }
  },
  computed: {
    showProgressBar: function () {
      return this.progressValue > 0
    },
    disableSendButton: function () {
      return this.isSendingFile
    },
    showReport: function () {
      return (
        (!this.isSendingFile && Object.keys(this.response.errors).length > 0) ||
        Object.keys(this.response.successes).length > 0
      )
    },
    responseSuccessChevron: function () {
      return this.responseSuccessOpen ? 'chevron-down' : 'chevron-right'
    },
    responseErrorChevron: function () {
      return this.responseErrorOpen ? 'chevron-down' : 'chevron-right'
    },
    showRequiredFields: function () {
      return this.importConfig.requiredFields
        && this.importConfig.requiredFields.length > 0
    },
    showOptionalFields: function () {
      return this.importConfig.optionalFields
        && this.importConfig.optionalFields.length > 0
    },
    generalInstructions: function() {
      if (this.importConfig.generalInstructions) {
        return this.importConfig.generalInstructions
      } else {
        return [
          'O arquivo deve ser do tipo excel (.xlsx).',
          'Apenas os dados que serão importados devem estar no documento.',
          'Os nomes das colunas devem ser iguais em todas as planilhas, não importando a ordem das colunas.',
          'A primeira linha de cada planilha deve vir com os nomes das colunas.',
          'A linha que não preencher os dados obrigatórios será descartada.',
          'Os nomes dos campos devem ser iguais aos que estão listados abaixo.'
        ]
      }
    },
    fileAccept: function() {
      if (this.importConfig.file && this.importConfig.file.accept) {
        return this.importConfig.file.accept
      } else {
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    },
    fileMultiple: function() {
      if (this.importConfig.file && this.importConfig.file.multiple) {
        return this.importConfig.file.multiple
      } else {
        return false
      }
    },
    isDirectory () {
      return this.filesInputMode === 'folder'
    },
    showModeSelect() {
      return this.fileMultiple
    }
  },
  methods: {
    onUploadProgress(progressEvent) {
      this.progressValue = Math.round(
        (progressEvent.loaded / progressEvent.total) * 100
      )
    },
    onSubmit() {
      if (this.importConfig.onSubmit) {
        this.importConfig.onSubmit(this)
      } else {
        if (this.file == null) {
          this.$bvToast.toast('Escolha um arquivo antes.', {
            autoHideDelay: 5000,
            variant: 'danger',
          })
          return
        }

        this.resetResponse()
        this.isSendingFile = true
         this.$services[this.serviceName].import(this.file, this.onUploadProgress)
          .then((response) => {
            const message = response.data.mensagem
            this.$bvToast.toast(message, {
              variant: 'success',
              autoHideDelay: 5000,
            })
            for(const state in response.data.dados.erros) {
              this.response.errors[state] = {
                isOpen: false,
                ...response.data.dados.erros[state]
              }
            }
            for(const state in response.data.dados.sucessos) {
              this.response.successes[state] = response.data.dados.sucessos[state]
            }
            this.$root.$emit('refreshlist')
          })
          .catch((error) => {
            this.serviceCatch(error)
          })
          .finally(() => {
            this.isSendingFile = false
            this.progressValue = 0
          })
        }
    },
    resetResponse() {
      this.response = responseData()
    },
    toggleErrorCollapse(state) {
      this.response.errors[state].isOpen = !this.response.errors[state].isOpen
      // we need to force, otherwise it won't render correctly
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    },
    serviceCatch (error) {
      if (error.response) {
        const message = Array.isArray(error.response.data.dados)
          ? error.response.data.dados[0]
          : error.response.data.message
        this.$parent.$parent.$emit('toast', {
          variant: 'danger',
          message,
        })
      } else {
        this.$parent.$parent.$emit('toast', {
          variant: 'danger',
          message: 'Algo inesperado aconteceu. Tente novamente.',
        })
        console.log(error)
      }
    },
    onShow () {
      this.resetResponse()
    },
    setFilesInputMode (mode) {
      this.filesInputMode = mode
    }
  },
}

function responseData() {
  return {
    errors: {},
    successes: {},
  }
}
</script>

<template>
  <b-modal
    id="import-modal"
    :title="`Importar documentos para ${importConfig.title}`"
    size="lg"
    hide-footer
    @show="onShow"
  >
    <div class="row">
      <div class="col">
        <p class="m-0">Considerações Gerais:</p>
        <ul>
          <li
            v-for="(instruction, index) in generalInstructions"
            :key="index"
          >{{ instruction }}</li>
        </ul>
        <p v-if="showRequiredFields" class="m-0">Campos Obrigatórios:</p>
        <ul> 
          <li
            v-for="(field, index) in importConfig.requiredFields"
            :key="index"
          >{{ field }}</li>
        </ul>
        <p v-if="showOptionalFields" class="m-0">Campos Opcionais:</p>
        <ul> 
          <li
            v-for="(field, index) in importConfig.optionalFields"
            :key="index"
          >{{ field }}</li>
        </ul>
      </div>
    </div>
    <div class="row mt-3 pb-3">
      <div class="offset-1 col-8">
        <b-input-group>
          <b-form-file
            v-model="file"
            placeholder="Escolha o arquivo ou largue-o aqui..."
            drop-placeholder="Largue o arquivo aqui..."
            browse-text="Procurar"
            :accept="fileAccept"
            :multiple="fileMultiple"
            :directory="isDirectory"
          />
          <template #append>
            <b-dropdown v-if="showModeSelect" text="Modo" variant="primary">
              <b-dropdown-item @click="setFilesInputMode('folder')">Pasta</b-dropdown-item>
              <b-dropdown-item @click="setFilesInputMode('files')">Arquivos</b-dropdown-item>
            </b-dropdown>
          </template>
        </b-input-group>
      </div>
      <div class="col-2">
        <b-button
          class="w-100"
          variant="primary"
          @click.prevent="onSubmit"
          :disabled="disableSendButton"
          >Enviar</b-button
        >
      </div>
    </div>
    <div class="row mt-2" v-show="showProgressBar">
      <div class="mx-auto col-10">
        <b-progress
          :value="progressValue"
          :max="100"
          animated
          variant="success"
          :striped="false"
        ></b-progress>
      </div>
    </div>
    <div v-show="showReport" class="row mt-2">
      <div class="mx-auto col-10">
        <b-button v-b-toggle="'response'" class="w-100" variant="primary"
          >Relatório</b-button
        >
        <b-collapse id="response">
          <b-card>
            <ul 
              class="p-0 m-0" 
              @click="responseSuccessOpen = !responseSuccessOpen"
            >
              <span class="d-flex align-items-center pointer">
                <span>Sucesso</span>
                <feather
                  class="mr-2"
                  :type="responseSuccessChevron"
                  size="1.3em"
                  style="overflow: initial"
                ></feather>
              </span>
              <b-collapse v-model="responseSuccessOpen">
                <ul
                  class="d-block"
                  v-for="(value, state) in response.successes"
                  :key="state"
                  v-b-toggle="state"
                >
                  {{ state }}: {{ value }}
                </ul>
              </b-collapse>
            </ul>
            <ul class="p-0 m-0">
              <span 
                class="d-flex align-items-center pointer"
                @click="responseErrorOpen = !responseErrorOpen"
              >
                <span>Erro</span>
                <feather
                  class="mr-2"
                  :type="responseErrorChevron"
                  size="1.3em"
                  style="overflow: initial"
                ></feather>
              </span>
              <b-collapse v-model="responseErrorOpen">
                <ul
                  class="d-block"
                  v-for="(value, state) in response.errors"
                  :key="state"
                >
                  <span 
                    class="d-flex align-items-center pointer"
                    @click="toggleErrorCollapse(state)"
                  >
                    <span>{{ state }}</span>
                    <feather
                      class="mr-2"
                      :type="`chevron-${response.errors[state].isOpen ? 'down': 'right'}`"
                      size="1.3em"
                      style="overflow: initial"
                    ></feather>
                  </span>
                  <b-collapse 
                    v-model="response.errors[state].isOpen"
                    accordion="state"
                  >
                    <ul
                      v-for="(lines, line) in response.errors[state]"
                      :key="line"
                    >
                      <li v-for="(value, i) in lines" :key="i">
                        {{ line }}: {{ value }}
                      </li>
                    </ul>
                  </b-collapse>
                </ul>
              </b-collapse>
            </ul>
          </b-card>
        </b-collapse>
      </div>
    </div>
  </b-modal>
</template>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>