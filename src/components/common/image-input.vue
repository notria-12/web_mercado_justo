<script>
import useVuelidate from '@vuelidate/core'
import { requiredIf } from '@vuelidate/validators'

export default {
  setup () {
    return { $v: useVuelidate() }
  },
  props: {
    imageUrl: {
      type: String,
      required: false,
      default: ''
    },
    required: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      imageFile: null,
    }
  },
  validations() {
    return {
      imageUrl: {
        required: requiredIf(function() {
          return this.required
        })
      }
    }
  },
  computed: {
     showPreviewImage() {
      return !!this.imageUrl
    },
  },
  methods: {
    onFileInput(file) {
      if(file) {
        this.imageFile = file
        this.$emit('input', URL.createObjectURL(file))
      } else {
        this.imageFile = null
        this.$emit('input', '')
      }
      this.$v.imageUrl.$touch()
    },
    save() {
      return new Promise((resolve, reject) => {
        if (this.imageFile) {
          this.$s3.upload(this.imageFile)
            .then((data) => {
              if (this.imageUrl) {
                this.removePreviousImage()
              }
              this.$emit('input', data.Location)
              resolve(true)
            })
            .catch((error) => {
              this.$common.serviceCatch(this, error)
              reject(false)
            })
        } else {
          resolve(true)
        }
      }) 
    },
    removePreviousImage() {
      this.imageFile = null
      const url = this.imageUrl
      const fileName = decodeURI(url.substring(url.lastIndexOf('/') + 1))
      this.$s3.delete(fileName)
        .catch((error) => {
          console.log(error)
        })
    },
    reset() {
      this.$nextTick(() => {
        this.$v.$reset()
      })
      this.$refs.fileInputRef.reset()
    }
  }
}
</script>

<template>
  <div class="row d-flex flex-column">
    <b-form-group label="Imagem (preview)" label-for="imagem" class="col-6">
      <b-img
        v-if="showPreviewImage"
        id="imagem"
        :src="$v.imageUrl.$model"
        fluid
        thumbnail
        style="max-width: 400px;"
      ></b-img>
    </b-form-group>
    <b-form-group class="col-6">
      <b-form-file
        ref="fileInputRef"
        :state="$common.getState($v.imageUrl)"
        placeholder="Escolha uma imagem ou arreste-a para aqui..."
        drop-placeholder="Arraste uma imagem para aqui..."
        browse-text="Procurar"
        accept="image/*"
        @input="onFileInput"
      ></b-form-file>
    </b-form-group>
  </div>
</template>

<style>

</style>