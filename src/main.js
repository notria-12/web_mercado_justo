import Vue from 'vue'
import App from './app'
import router from '@router'
import store from '@state/store'
import '@components/_globals'

import BootstrapVue from 'bootstrap-vue'
import InputFacade from 'vue-input-facade'
import vco from 'v-click-outside'
import VueRouter from 'vue-router'
import VueFeather from 'vue-feather'
import flatPickr from 'vue-flatpickr-component'
import ToggleButton from 'vue-js-toggle-button'
import VueCompositionAPI from '@vue/composition-api'
import CKEditor from '@ckeditor/ckeditor5-vue2'
import VueApexCharts from 'vue-apexcharts'
import AWSS3 from '@plugins/aws-s3'
import Common from '@plugins/common'
import Services from '@plugins/services'
import Validations from '@plugins/validations'

Vue.use(VueFeather)
Vue.use(flatPickr)
Vue.use(VueRouter)
Vue.use(vco)
Vue.use(ToggleButton)
Vue.use(BootstrapVue)
Vue.use(InputFacade)
Vue.use(VueCompositionAPI)
Vue.use(CKEditor)
Vue.use(VueApexCharts)
Vue.component('apexchart', VueApexCharts)

// Custom Plugins
Vue.use(AWSS3)
Vue.use(Common)
Vue.use(Services)
Vue.use(Validations)

Vue.config.productionTip = process.env.NODE_ENV === 'production'

const app = new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')

