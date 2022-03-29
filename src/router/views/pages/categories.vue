<script>
import Layout from '@layouts/main.vue'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import SessionExpired from '@mixins/session-expired.js'

export default {
  setup () {
    return { $v: useVuelidate() }
  },
  components: { Layout, Loading },
  mixins: [SessionExpired],
  data () {
    return {
      isLoading: false,
      selectedCategory: [0, 1, 2].reduce((acc, curr) => {
        return {
          ...acc,
          [curr]: {
            index: null,
            id: null,
            father: null,
          }
        }
      }, {}),
      editingCategory: {
        columnIndex: null,
        index: null,
      },
      categories: {
        0: [],
        1: [],
        2: []
      },
      form: {
        nome: '',
      },
      columnNames: ['Categoria', 'Subcategoria 1', 'Subcategoria 2']
    }
  },
  watch: {
    '$v.form.nome.$model': function (newValue) {
      const { columnIndex, index }  = this.editingCategory
      if (columnIndex !== null && index !== null) {
        this.categories[columnIndex][index].nome = newValue
      }
    }
  },
  validations() {
    return {
      form: {
        nome: { required },
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.isLoading = true
      this.$services.categories.getAll({
        perPage: 1000,
        search: {
          field: 'pai',
          term: '0',
          type: 'null'
        }
      })
        .then(([categories, xTotalCount]) => {
          for (const category of categories) {
            if (!category.pai) {
              this.categories[0].push(category)
            }
          }
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
    isCategorySelected({ columnIndex, index }) {
      return this.selectedCategory[columnIndex] 
        ? this.selectedCategory[columnIndex].index === index
        : false 
    },
    isCategoryEditing({ columnIndex, index }) {
      return this.editingCategory.columnIndex === columnIndex
        && this.editingCategory.index === index
    },
    changeSelectedCategory({ columnIndex, index, id }) {
      this.unloadSubCategory(columnIndex)
      if (!this.isSameIndex(({ columnIndex, index }))) {
        const father = columnIndex > 0 
          ? this.selectedCategory[columnIndex - 1].id
          : null
        this.selectedCategory[columnIndex] = {
          index,
          id,
          father
        }
        this.loadSubCategory({columnIndex, id })
      } else {
         this.selectedCategory[columnIndex] = {
          index: null,
          id: null,
          father: null
        }
      }
    },
    isSameIndex({ columnIndex, index }) {
      return  this.selectedCategory[columnIndex].index === index
    },
    changeEditingCategory({ columnIndex, index }) {
      this.editingCategory = { columnIndex, index }
      this.$v.form.nome.$model = this.categories[columnIndex][index].nome
      this.$v.$reset()
    },
    removeSelectedCategoryGuard(columnIndex) {
      if (columnIndex < 2) {
         this.$bvModal
        .msgBoxConfirm('Todos os subitems serão removidos juntos. Deseja continuar?', {
          title: 'Atenção',
          okVariant: 'danger',
          okTitle: 'Remover',
          cancelVariant: 'primary',
          cancelTitle: 'Cancelar',
        })
        .then((response) => {
          if (response) {
           this.removeSelectedCategory(columnIndex)
          }
        })
      } else {
        this.removeSelectedCategory(columnIndex)
      }
    },
    removeSelectedCategory(columnIndex) {
      const { index, id } = this.selectedCategory[columnIndex]
      if (index !== null && id !== null) {
        this.isLoading = true
        this.$services.categories.remove(id)
          .then((response) => {
            const message = response.data.mensagem
            this.$bvToast.toast(message, {
              variant: 'success',
            })
            this.categories[columnIndex].splice(index, 1)
          })
          .catch((error) => {
            this.$common.serviceCatch(this, error)
          })
          .finally(() => {
           this.isLoading = false
          })
      } else if (index !== null) {
        this.categories[columnIndex].splice(index, 1)
      }
      this.resetSelectedCategory(columnIndex)
      this.unloadSubCategory(columnIndex)
    },
    appendEmptyCategory(columnIndex) {
      if (columnIndex > 0 && this.selectedCategory[columnIndex - 1].id === null) {
        this.$bvToast.toast('É preciso selecionar a categoria pai antes.', {
          variant: 'info',
        })
        return
      }

      this.$v.$touch()
      if(this.isLastItemEmpty(columnIndex) && this.$v.$invalid) {
        this.$bvToast.toast('Dê um nome à categoria antes de criar outra.', {
          variant: 'info',
        })
        return
      }

      const father = columnIndex > 0 
        ? this.selectedCategory[columnIndex - 1].id
        : null
      this.categories[columnIndex].push({
        id: null,
        nome: '',
        pai: father
      })
      this.editingCategory = {
        index: this.categories[columnIndex].length  - 1,
        columnIndex,
      }
      this.resetForm()
    },
    resetEditingCategory() {
      this.editingCategory = {
        index: null,
        columnIndex: null
      }
      this.resetForm()
    },
    resetSelectedCategory(columnIndex) {
      this.selectedCategory[columnIndex] = {
        index: null,
        id: null,
        father: null
      }
    },
    resetForm() {
      this.$v.form.nome.$model = ''
      this.$v.$reset()
    },
    createUpdateCurrentCategory({ columnIndex, index, id }) {
      this.isLoading = true
      if(id === null) {
        this.$services.categories.create({
          nome: this.categories[columnIndex][index].nome,
          pai: this.categories[columnIndex][index].pai
        })
          .then((response) => {
            this.categories[columnIndex][index].id = response.data.dados._id
          })
          .catch((error) => {
            this.$common.serviceCatch(this, error)
          })
          .finally(() => {
            this.isLoading = false
            this.resetEditingCategory()
          })
      } else {
        this.$services.categories.update(id, {
          nome: this.categories[columnIndex][index].nome,
          pai: this.categories[columnIndex][index].pai
        })
          .catch((error) => {
            this.$common.serviceCatch(this, error)
          })
          .finally(() => {
            this.isLoading = false
            this.resetEditingCategory()
          })
      }
    },
    loadSubCategory({ columnIndex, id }) {
      if (!id || columnIndex > 1) {
        return
      }
      this.$services.categories.getAll({
        perPage: 1000,
        search: {
          field: 'pai',
          term: id,
          type: 'objectId'
        }
      })
        .then(([subCategories, xTotalCount]) => {
          for (const subCategory of subCategories) {
            this.categories[Number(columnIndex) + 1].push({
              id: subCategory.id,
              nome: subCategory.nome,
              pai: subCategory.pai._id
            })
          }
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
        })
    },
    unloadSubCategory(columnIndex) {
      if (columnIndex > 1) {
        return
      }
      for (const key in this.categories) {
        if (key >= Number(columnIndex) + 1) {
          this.$set(this.categories, Number(key), [])
          this.resetSelectedCategory(Number(key))
        }
      }
    },
    isLastItemEmpty(columnIndex) {
      const lastCategoryIndex = this.categories[columnIndex].length - 1
      return this.categories[columnIndex][lastCategoryIndex] 
        ? this.categories[columnIndex][lastCategoryIndex] .nome === ''
        : false     
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
            <div class="titulo">Categorias</div>
            <div class="subTitulo">Cadastre aqui as categorias dos produtos</div>
            <div class="borda"></div>

            <div class="row">
              <div 
                class="col-4"
                v-for="(column, columnIndex) in categories"
                :key="columnIndex"
              >
                <div class="row">
                  <div class="col">
                    <h2 class="text-center">{{ columnNames[columnIndex] }}</h2>
                  </div>
                </div>
                <div class="row">
                  <div class="col">
                    <b-card
                      class="border"
                      footer-class="p-0"
                      body-class="p-0"
                    >
                      <div class="list-container h-100">
                        <b-list-group flush>
                          <b-list-group-item
                            v-for="(category, index) in column"
                            :key="index"
                          >
                            <div 
                              v-if="isCategoryEditing({ columnIndex, index })"
                              class="w-100 d-flex justify-content-between align-items-center"
                            >
                              <b-form-input
                                v-model="$v.form.nome.$model"
                                :state="$common.getState($v.form.nome)"
                                @blur="createUpdateCurrentCategory({ columnIndex, index, id: category.id })"
                              />
                              <div class="d-flex justify-content-between align-items-center">
                                <feather 
                                  type="edit" 
                                  size="1.2em" 
                                  class="pointer ml-5" 
                                  @click="changeEditingCategory({ columnIndex, index })"
                                />
                                <b-form-checkbox
                                  class="ml-2"
                                  :checked="isCategorySelected({ columnIndex, index })"
                                  @change="changeSelectedCategory({ columnIndex, index, id: category.id })"
                                />
                              </div>
                            </div>
                            <div 
                              v-if="!isCategoryEditing({ columnIndex, index })"
                              class="w-100 d-flex justify-content-between"
                            >
                              <span>{{ category.nome }}</span>
                              <div class="d-flex justify-content-between align-items-center">
                                <feather 
                                  type="edit"
                                  size="1.2em"
                                  class="pointer"
                                  @click="changeEditingCategory({ columnIndex, index })"
                                />
                                <b-form-checkbox
                                  class="ml-2"
                                  :checked="isCategorySelected({ columnIndex, index })"
                                  @change="changeSelectedCategory({ columnIndex, index, id: category.id })"
                                />
                              </div>
                            </div>
                          </b-list-group-item>
                        </b-list-group>
                      </div>

                      <template #footer>
                        <b-button-group class="w-100">
                          <b-button @click="removeSelectedCategoryGuard(columnIndex)" size="sm" variant="primary">
                            <feather type="minus" size="1.8em" />
                          </b-button>
                          <b-button @click="appendEmptyCategory(columnIndex)" size="sm" variant="primary">
                            <feather type="plus" size="1.8em" />
                          </b-button>
                        </b-button-group>
                      </template>
                    </b-card>
                  </div>
                </div>
              </div>
            </div>
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
  .list-container {
    height: 400px;
  }
}
.pointer {
  cursor: pointer;
}
</style>