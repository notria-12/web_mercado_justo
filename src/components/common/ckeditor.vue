<script>
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document'
import '@ckeditor/ckeditor5-build-decoupled-document/build/translations/pt-br';

export default {
  props: {
    value: {
      type: String,
      required: false,
      default: null
    },
    config: {
      type: Object,
      required: false,
      default: () => ({
          language: 'pt-br',
          placeholder: 'Descrição...'
        })
    },
    placeholder: {
      type: String,
      required: false,
    },
    minHeight: {
      type: String,
      required: false,
      default: '150px'
    }
  },
  data() {
    return {
      editor: DecoupledEditor,
    }
  },
  computed: {
    editorConfig() {
      if(this.placeholder) {
        return {
          ...this.config,
          placeholder: this.placeholder,
        }
      } else {
        return this.config
      }
    }
  },
  methods: {
    onReady( editor )  {
      // Insert the toolbar before the editable area.
      editor.ui.getEditableElement().parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
      );
    },
    handleInput (event) {
      this.$emit('input', event)
    },
  }
}
</script>

<template>
  <ckeditor 
    :style="`min-height: ${minHeight}`"
    :editor="editor"
    :config="editorConfig"
    :value="value" 
    @input="handleInput"
    @ready="onReady"
  ></ckeditor>
</template>

<style>
.ck-editor__editable {
  max-height: 800px;
  overflow: auto;
  resize: vertical;
}
.ck.ck-editor__editable_inline {
  border: 1px solid #e2e7f1;
}
</style>