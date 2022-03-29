import { helpers } from '@vuelidate/validators'

export default (cpf) => {
  if (!helpers.req(cpf)) {
    return true
  }

  const strCPF = cpf.replace(/[\.-]/g, '')
  let Soma
  let Resto
  Soma = 0
  if (_isDigitsEqual(strCPF)) { return false }
  for (let i = 1; i <= 9; i++) { Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i) }
  Resto = (Soma * 10) % 11
  if ((Resto == 10) || (Resto == 11)) { Resto = 0 }
  if (Resto != parseInt(strCPF.substring(9, 10))) { return false }
  Soma = 0
  for (let i = 1; i <= 10; i++) { Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i) }
  Resto = (Soma * 10) % 11
  if ((Resto == 10) || (Resto == 11)) { Resto = 0 }
  if (Resto != parseInt(strCPF.substring(10, 11))) { return false }
  return true
}

function _isDigitsEqual (str) {
  let lastDigit = ''
  for (let i = 0; i < str.length; i++) {
    if (lastDigit == '') {
      lastDigit = str[i]
    }
    if (str[i] != lastDigit) {
      return false
    }
    lastDigit = str[i]
  }
  return true
}
