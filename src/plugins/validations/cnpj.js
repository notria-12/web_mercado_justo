import { helpers } from '@vuelidate/validators'

export default (cnpj) => {
  if (!helpers.req(cnpj)) {
    return true
  }
  if (cnpj.length < 18) {
    return false
  }

  const firstStepMultiplication = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const secondStepMultiplication = [6, ...firstStepMultiplication]
  const lastTwoDigits = cnpj.replaceAll(/(\.|\/|-)/g, '').slice(-2)
  const stripedCNPJArr = cnpj.replaceAll(/(\.|\/|-)/g, '').slice(0, -2).split('')
  const firstDigit = _calcCPNJDigit(firstStepMultiplication, stripedCNPJArr)
  const secondDigit = _calcCPNJDigit(secondStepMultiplication, [...stripedCNPJArr, firstDigit])

  if (lastTwoDigits[0] == firstDigit && lastTwoDigits[1] == secondDigit) {
    return true
  } else {
    return false
  }
}

function _calcCPNJDigit (stepMultiplicationArr, stripedCNPJArr) {
  const magicNumber = 11
  let result = 0

  for (let i = 0; i < stepMultiplicationArr.length; i++) {
    result += stepMultiplicationArr[i] * stripedCNPJArr[i]
  }

  const moduleFirstStep = result % magicNumber
  if (moduleFirstStep > 2) {
    return magicNumber - moduleFirstStep
  } else {
    return 0
  }
}
