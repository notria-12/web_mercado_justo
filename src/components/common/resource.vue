<script>
import Layout from '@layouts/main'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import SessionExpired from '@mixins/session-expired.js'

export default {
  components: { Layout, Loading },
  mixins: [SessionExpired],
  props: {
    List: {
      type: Object,
      required: true,
    },
    FormTemplate: {
      type: Object,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
      required: true,
    },
    component: {
      type: Object,
      required: false,
      default: () => ({
        onChange: null,
        text: ''
      })
    },
  },
  beforeMount() {
    this.$options.components.List = this.List
    if (this.FormTemplate) {
      this.$options.components.FormTemplate = this.FormTemplate
    }
  },
  mounted(){
    this.$root.$on('onFirstRegister', (data) => {
      this.onComponentChange('create')
    })
  },
  beforeDestroy() {
    this.$root.$off()
  },
  data() {
    return {
      currentComponent: 'list',
      nextComponent: 'create',
      nextComponentText: 'Novo',
      editId: '',
      isLoading: false,
      toast: {
        message: '',
        variant: 'info',
        autoHideDelay: 5000,
      },
    }
  },
  computed: {
    currentProperties () {
      if (this.currentComponent == 'list') {
        this.nextComponent = 'create'
        this.nextComponentText = 'Novo'
        return {}
      } else if (this.currentComponent == 'create') {
        this.nextComponent = 'list'
        this.nextComponentText = 'Listar'
        return {
          id: '',
          mode: 'create',
        }
      } else if (this.currentComponent == 'edit') {
        this.nextComponent = 'list'
        this.nextComponentText = 'Listar'
        return {
          id: this.editId,
          mode: 'edit',
        }
      }
    },
    formComponentExists() {
      return !!this.FormTemplate || !!this.component.onChange
    }
  },
  methods: {
    onComponentChange(frag) {
      if (this.component && this.component.onChange) {
        this.component.onChange(frag, this)
      } else {
        this.currentComponent = frag
      }
    },
    changeEditId(id) {
      this.editId = id
    },
    showToast(data) {
      this.toast.variant = data.variant
      this.toast.message = data.message
      this.toast.autoHideDelay = data.autoHideDelay || 5000
      this.$bvToast.show('toast')
    },
  },
}
</script>

<template>
  <Layout>
    <div class="bloco">
      <div class="cabecalho">
        <div class="row">
          <div class="col-xl-12">
            <button
              v-if="formComponentExists"
              class="btn btn-mercado-justo botaoTopo"
              @click="onComponentChange(nextComponent)"
            >
              {{ component.text || nextComponentText }}
            </button>
            <div class="titulo">{{ title }}</div>
            <div class="subTitulo">
              {{ subTitle }}
            </div>
            <div class="borda"></div>
            <keep-alive>
              <component
                ref="componentRef"
                :is="
                  ['create', 'edit'].includes(currentComponent)
                    ? 'form-template'
                    : 'list'
                "
                v-bind="currentProperties"
                v-on:edit="
                  onComponentChange('edit')
                  changeEditId($event)
                "
                v-on:loading="isLoading = $event"
                v-on:toast="showToast($event)"
              />
            </keep-alive>
          </div>
        </div>
      </div>
    </div>
    <Loading
      :active.sync="isLoading"
      color="#111d5e"
      :can-cancel="false"
    ></Loading>
    <b-toast 
      id="toast" 
      b-toaster-top-center 
      :variant="toast.variant" 
      :auto-hide-delay="toast.autoHideDelay"
    >
      {{ toast.message }}
    </b-toast>
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