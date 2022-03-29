<script>
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'

export default {
  components: { vueDropzone: vue2Dropzone, Loading },
  props: {
    value: {
      type: Array,
      required: false,
      default: () => []
    },
    state: {
      type: Boolean,
      required: false,
      default: null
    },
    isLoading: Boolean,
  },
  data () {
    return {
      dropzoneOptions: {
        url: 'http://aws-direct-s3.dev/',
        addRemoveLinks: true,
        autoProcessQueue: false,
        dictDefaultMessage: 'Solte os arquivos aqui para enviar',
        dictFallbackMessage: 'Seu navegador não suporta uploads de arquivos "arrastar e soltar".',
        dictFileTooBig: 'Arquivo muito grande ({{filesize}}MiB). O limite é de {{maxFilesize}} MiB',
        dictInvalidFileType: 'Você não pode fazer upload de arquivos deste tipo.',
        dictRemoveFile: 'Remover arquivo',
        dictRemoveFileConfirmation: 'Confirma?'
      },
    }
  },
  watch: {
    value (newValue) {
      this.$emit('input', newValue)
      if (newValue.length == 0) {
        this.resetDropzoneManually()
      }
    },
  },
  methods: {
    dropzoneFilesAdded (files) {
      for (const file of files) {
        this.$s3.upload(file)
          .then((data) => {
            this.value.push(data.Location)
            this.$emit('vdropzone-success', renamedFile(file, data.key), data.Location)
            this.$refs.DROPZONE_REF.removeFile(file)
            this.$refs.DROPZONE_REF.manuallyAddFile(renamedFile(file, data.key), data.Location)
          })
          .catch((error) => {
            console.log(error)
          })
          .finally(() => {
            this.$refs.DROPZONE_REF.processQueue()
          })
      }

      function renamedFile (file, newName) {
        return new File([file], newName)
      }
    },
    dropzoneRemovedFile (file, error) {
      if (this._isBeingDestroyed || this._isDestroyed || !file.manuallyAdded) {
        return
      }
      const fileName = decodeURI(file.name)
      if (this.value.length > 0) {
        for (const [i, file] of this.value.entries()) {
          const decodedFile = decodeURI(file.slice(file.lastIndexOf('/') + 1))
          if (decodedFile == fileName) {
            this.value.splice(i, 1)
          }
        }
      }
      this.$s3.delete(fileName)
        .catch((error) => {
          console.log(error)
        })
      this.$emit('vdropzone-removed-file')
    },
    resetDropzoneManually () {
      /* Do not call vdropzone-removed-file event that would delete uploads
      when switching between docs. */
      this.$refs.DROPZONE_REF.dropzone.files = []
      const firstChild = this.$refs.DROPZONE_REF.dropzone.element.firstElementChild
      this.$refs.DROPZONE_REF.dropzone.element.innerHTML = ''
      this.$refs.DROPZONE_REF.dropzone.element.appendChild(firstChild)
      this.$refs.DROPZONE_REF.dropzone.element.classList.remove('dz-started')
      this.$refs.DROPZONE_REF.$forceUpdate()
    },
    manuallyAddFile(file, url) {
      this.$refs.DROPZONE_REF.manuallyAddFile(file, url)
    },
  }
}
</script>

<template>
  <div>
    <vue-dropzone
      id="dropzone"
      ref="DROPZONE_REF"
      :options="dropzoneOptions"
      @vdropzone-files-added="dropzoneFilesAdded"
      @vdropzone-removed-file="dropzoneRemovedFile"
    />
    <Loading
      :active.sync="isLoading"
      color="#111d5e"
      :can-cancel="false"
      :is-full-page="false"
    ></Loading>
  </div>
</template>

<style>

</style>
