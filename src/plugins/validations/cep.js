import { helpers } from '@vuelidate/validators'
import cep from 'cep-promise'

export default (value) => {
  if (!helpers.req(value)) {
    return true
  }

  if (value.length < 9) {
    return false
  }

  return cep(value)
    .then((obj) => obj)
    .catch(() => false)
}
