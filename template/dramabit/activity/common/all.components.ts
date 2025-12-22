

import * as base from './Basic/basicRegister'

const registerList = [base]


export default (Vue) => {
  registerList.forEach((register) => {
    for (const key in register) {
      Vue.component(key, register[key])
    }
  })
}
