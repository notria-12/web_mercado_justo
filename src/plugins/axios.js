import axios from 'axios'
import { APP_NAME } from '@/src/constants/app'

export default {
  install: (Vue, options) => {
    const axiosPlugin = axios.create({
      baseURL: process.env.VUE_APP_API_BASE_URL,
      headers: {
        common: {
          ['X-App-Origem']: APP_NAME,
        }
      }
    })
    Vue.prototype.$axios = axiosPlugin
    Vue.$axios = axiosPlugin
  }
}